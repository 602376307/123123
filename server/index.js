// const express = require('express');
// const app = express(); // 初始化express
// const http = require('http').Server(app); // 创建个Http服务器
// const io = require('socket.io')(http); // 将Http服务注入到io中
// const path = require('path'); // 做路径处理

// http.listen(8080, function() {
//     console.log('服务开启成功')
// })

// app.use(express.static(path.join(__dirname + '/public')))

// app.get('/', function(req, res) {
//     res.sendFile(path.join(__dirname + '/public/index.html'))
// })



// 引入ws
const ws = require('ws')
// 实例化
const server = new ws.Server({ port: 8000 })
// 连接成功
server.on('connection', handleConnection)
// 
server.on('open', handleOpen)
server.on('close', handleClose)
server.on('error', handleError)

const users = [] // 连接的所有用户对象

function handleConnection(ws) {

    console.log(`用户已连接`);
    const wss = ws
    let username = ''

    wss.on('message', (msg) => {
        // ws版本 需要tostring
        const msgs = msg.toString()
        console.log(msgs);

        try {
            const data = JSON.parse(msgs)

            // 验证消息基本结构
            if (data.type === undefined || (data.type !== 0 && !data.user)) {
                throw new Error('消息缺少必要字段')
            }

            // 如果是登录消息，保存用户信息
            if (data.type === 0) {
                username = data.user

                // 去除用户名前后空格
                username = username.trim()

                // 检查用户名是否为空
                if (!username) {
                    throw new Error('用户名不能为空')
                }

                // 检查是否已经存在相同用户名的用户
                const existingUser = users.find(user => user.username === username)
                if (existingUser) {
                    // 如果存在，关闭旧连接
                    existingUser.ws.close()
                    // 移除旧用户
                    const index = users.indexOf(existingUser)
                    users.splice(index, 1)
                    console.log(`用户 ${username} 已在其他地方登录，旧连接已关闭`)
                }

                users.push({
                    ws: wss,
                    username: username
                })
                console.log(`用户 ${username} 登录成功`)
                console.log('当前在线用户:', users.map(u => u.username))
            }
            // 如果是群聊消息
            else if (data.type === 1) {
                // 检查消息内容是否为空
                if (!data.msg || data.msg.trim() === '') {
                    throw new Error('群聊消息内容不能为空')
                }

                // 群聊
                server.clients.forEach((c) => {
                    c.send(msgs)
                })
            }
            // 如果是私聊消息
            else if (data.type === 2) {
                // 检查消息内容是否为空
                if (!data.msg || data.msg.trim() === '') {
                    throw new Error('私聊消息内容不能为空')
                }

                // 检查是否包含目标用户
                if (!data.targetUser || data.targetUser.trim() === '') {
                    throw new Error('私聊必须指定目标用户')
                }

                // 私聊，去除目标用户名前后空格
                const targetUser = data.targetUser.trim()
                const privateMsg = {
                    type: 2,
                    user: data.user,
                    targetUser: targetUser,
                    msg: data.msg
                }

                // 查找目标用户并发送消息
                console.log('当前在线用户列表:', users.map(u => u.username))
                console.log('尝试查找的目标用户:', targetUser)
                console.log('数据类型检查 - targetUser:', typeof targetUser)
                console.log('数据类型检查 - 在线用户用户名:', users.length > 0 ? typeof users[0].username : 'N/A')

                // 尝试使用严格相等和忽略大小写两种方式查找
                const targetClient = users.find(user =>
                    user.username === targetUser ||
                    user.username.toLowerCase() === targetUser.toLowerCase()
                )

                if (targetClient) {
                    console.log('找到目标用户:', targetClient.username)
                    targetClient.ws.send(JSON.stringify(privateMsg))
                    // 同时发送给自己一份
                    wss.send(JSON.stringify(privateMsg))
                    console.log(`用户 ${data.user} 发送私聊消息给 ${targetUser}: ${data.msg}`)
                } else {
                    // 目标用户不在线，发送错误消息
                    wss.send(JSON.stringify({
                        type: 3,
                        error: `用户 ${targetUser} 不在线`
                    }))
                    console.log(`用户 ${data.user} 尝试发送私聊消息给不存在的用户 ${targetUser}`)
                }
            }
        } catch (error) {
            console.error('解析消息错误:', error)
            wss.send(JSON.stringify({
                type: 3,
                error: '消息格式错误'
            }))
        }
    })

    // 监听连接关闭事件，移除用户
    wss.on('close', () => {
        if (username) {
            const index = users.findIndex(user => user.username === username)
            if (index > -1) {
                users.splice(index, 1)
                console.log(`用户 ${username} 已断开连接`)
                console.log('当前在线用户:', users.map(u => u.username))
            }
        }
    })
}

function handleOpen() {
    console.log('open');
}

function handleClose() {
    console.log('close');
}

function handleError() {
    console.log('error');
}

// function handleMsg(msg) {
//     // ws版本 需要tostring
//     const msgs = msg.toString()
//     console.log(msgs);
//     // 群聊
//     if (JSON.parse(msgs).type === 1) {
//         server.clients.forEach((c) => {
//             c.send(msgs)
//         })
//     } else {
//         console.log(2);
//         wss.send('1')
//     }
// }