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
    try {
      await app.doLogin()
      const userInfo = app.globalData.userInfo
      // 新用户（昵称为默认值）→ 引导设置昵称
      if (userInfo && userInfo.nickname === '新用户') {
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
