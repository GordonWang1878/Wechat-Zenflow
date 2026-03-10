// pages/profile/profile.js
const app = getApp()
const { requireLogin } = require('../../utils/auth')

Page({
  data: {
    nickname: '',
    isFirstSetup: false,
    submitting: false,
  },

  onLoad(options) {
    if (!requireLogin()) return

    const isFirstSetup = options.firstSetup === '1'
    // 优先使用登录时获取到的微信昵称（新用户首次设置）
    const pendingNickname = app.globalData.pendingNickname || ''
    const userInfo = app.globalData.userInfo
    const savedNickname = (userInfo && userInfo.nickname !== '新用户') ? userInfo.nickname : ''

    this.setData({
      nickname: pendingNickname || savedNickname,
      isFirstSetup,
    })

    // 清除临时缓存
    app.globalData.pendingNickname = ''
  },

  onNicknameInput(e) {
    this.setData({ nickname: e.detail.value })
  },

  async handleSave() {
    const finalName = this.data.nickname.trim()
    if (!finalName) {
      wx.showToast({ title: '请输入昵称', icon: 'none' })
      return
    }

    this.setData({ submitting: true })
    wx.showLoading({ title: '保存中...' })
    try {
      const db = wx.cloud.database()
      const userId = app.globalData.userInfo._id
      await db.collection('users').doc(userId).update({
        data: {
          nickname: finalName,
          updatedAt: db.serverDate(),
        },
      })
      // 同步更新全局数据
      app.globalData.userInfo.nickname = finalName

      wx.hideLoading()
      wx.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => {
        wx.reLaunch({ url: '/pages/home/home' })
      }, 1200)
    } catch (err) {
      wx.hideLoading()
      console.error('保存昵称失败:', err)
      wx.showToast({ title: '保存失败，请重试', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  },
})
