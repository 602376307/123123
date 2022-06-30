<template>
  <div class="login">
    <input type="text" v-model.trim="username" placeholder="请输入用户名">
    <button @click="btnFn">登录</button>
  </div>
</template>
<script>

export default {
  name: 'Login',
  data () {
    return {
      username: ''
    }
  },
  methods: {
    btnFn() {
      sessionStorage.setItem('username', this.username)
      this.$router.push('/home')
    }
  }
}
</script>