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
    wss.on('message', (msg) => {
        // ws版本 需要tostring
        const msgs = msg.toString()
        console.log(msgs);
        if (JSON.parse(msgs).type === 1) {
            // 群聊
            server.clients.forEach((c) => {
                c.send(msgs)
            })
        } else if (JSON.parse(msgs).type === 2) {
            // 私聊


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