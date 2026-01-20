<template>
  <div class="home">
    <!-- 聊天内容 -->
    <ul>
      <li v-for="item in msgList" :key="item.id">
        <p>
          <span>{{ item.user }}:{{ item.msg }}</span>
        </p>
      </li>
    </ul>
    <!-- 输入框 -->
    <span>{{ username }}</span>
    <input type="text" v-model.trim="msg" />
    <button @click="btnSendFn">发送</button>
    <!-- 私人聊天室 -->
    <div>---------------私人聊天-------------------</div>
    <ul>
      <li v-for="item in msgsList" :key="item.id">
        <p>
          <span>{{ item.user }}:{{ item.msg }}</span>
        </p>
      </li>
    </ul>
    <!-- 输入框 -->
    <span>你想发给谁</span><input type="text" v-model="targetUser" />
    <div>
      <input type="text" v-model.trim="msgs" />
      <button @click="btnSendFn1">发送</button>
    </div>
  </div>
</template>

<script>
// import {io} from 'socket.io-client'
// let socket = null
let ws = null;
export default {
  name: "Home",
  data() {
    return {
      msg: "", // 公共消息
      msgList: [], // 公共消息列表
      username: "",
      msgsList: [], // 私人聊天消息列表
      msgs: "", // 私人消息
      targetUser: "",
    };
  },
  mounted() {
    this.username = sessionStorage.getItem("username");
    // socket = io('ws://localhost:8000')

    // socket.emit('login', () => {

    // })

    // 在获取用户名后再建立WebSocket连接
    ws = new WebSocket("ws://localhost:8000");

    // 使用箭头函数确保this指向Vue组件实例
    ws.addEventListener("open", () => this.handleOpen(), false);
    ws.addEventListener("message", (e) => this.handleMesage(e), false);
    ws.addEventListener("close", (e) => this.handleClose(e), false);
    ws.addEventListener("error", (e) => this.handleError(e), false);
  },
  methods: {
    // 群发发送按钮事件
    btnSendFn() {
      ws.send(
        JSON.stringify({
          type: 1,
          user: this.username,
          msg: this.msg,
        })
      );
      // socket.emit('sends', {
      //   user: this.username,
      //   msg: this.msg
      // })
      // socket.on('msgs', res => {
      //   this.msgList.push(res)
      // })
    },
    handleOpen() {
      console.log("连接成功");
      // 发送登录消息
      ws.send(
        JSON.stringify({
          type: 0,
          user: this.username,
        })
      );
    },
    handleMesage(e) {
      console.log("收到数据", e.data);
      const data = JSON.parse(e.data);
      if (data.type === 1) {
        // 群聊消息
        this.msgList.push(data);
        this.msg = "";
      } else if (data.type === 2) {
        // 私聊消息
        this.msgsList.push(data);
        this.msgs = "";
      } else if (data.type === 3) {
        // 错误消息
        console.error("错误:", data.error);
      }
    },
    handleClose(e) {
      console.log("连接已关闭");
    },
    handleError(e) {
      console.log("连接出现错误");
    },
    // 私发发送
    btnSendFn1() {
      ws.send(
        JSON.stringify({
          type: 2,
          user: this.username,
          msg: this.msgs,
          targetUser: this.targetUser,
        })
      );
    },
  },
};
</script>
