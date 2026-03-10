// pages/login/login.js
const app = getApp()

Page({
  data: {
    loading: false,
  },

  onLoad() {
    // 已登录则直接跳转主页
    if (app.globalData.isLoggedIn) {
      this._toHome()
    }
  },

  // 微信一键登录
  async handleLogin() {
    if (this.data.loading) return
    this.setData({ loading: true })

    // 第一步：在用户点击时获取微信昵称（必须在 tap 事件中调用）
    let wechatNickname = ''
    try {
      const profileRes = await new Promise((resolve, reject) =>
        wx.getUserProfile({
          desc: '用于设置您在本小程序中的昵称',
          success: resolve,
          fail: reject,
        })
      )
      wechatNickname = profileRes.userInfo.nickName || ''
    } catch (e) {
      // 用户拒绝授权或接口不支持，继续正常登录流程
    }

    // 第二步：云函数登录
    try {
      await app.doLogin()
      const userInfo = app.globalData.userInfo
      if (userInfo && userInfo.nickname === '新用户') {
        // 新用户：将微信昵称暂存，跳转设置页预填
        app.globalData.pendingNickname = wechatNickname
        wx.reLaunch({ url: '/pages/profile/profile?firstSetup=1' })
      } else {
        wx.showToast({ title: '登录成功', icon: 'success', duration: 1200 })
        setTimeout(() => this._toHome(), 1200)
      }
    } catch (err) {
      console.error('登录失败:', err)
      wx.showToast({ title: '登录失败，请重试', icon: 'none', duration: 2000 })
    } finally {
      this.setData({ loading: false })
    }
  },

  _toHome() {
    wx.reLaunch({ url: '/pages/home/home' })
  },
})
