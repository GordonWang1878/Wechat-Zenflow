// app.js
App({
  globalData: {
    userInfo: null,
    isLoggedIn: false,
    isAdmin: false,
  },

  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
      return
    }
    wx.cloud.init({
      // TODO: 替换为你的微信云开发环境 ID
      env: 'cloud1-1g64oe2m689330c7',
      traceUser: true,
    })
  },

  // 执行微信登录，并在云端查询/创建用户记录
  doLogin() {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'login',
        success: res => {
          const result = res.result
          if (result.success) {
            this.globalData.userInfo = result.user
            this.globalData.isLoggedIn = true
            this.globalData.isAdmin = result.user.isAdmin === true
            resolve(result)
          } else {
            reject(new Error(result.error || '登录失败'))
          }
        },
        fail: err => {
          console.error('云函数 login 调用失败:', err)
          reject(err)
        },
      })
    })
  },

  // 退出登录，清空全局状态
  logout() {
    this.globalData.userInfo = null
    this.globalData.isLoggedIn = false
    this.globalData.isAdmin = false
  },
})
