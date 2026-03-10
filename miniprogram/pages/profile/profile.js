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
    const userInfo = app.globalData.userInfo
    this.setData({
      // 如果昵称是默认"新用户"，则留空让用户重新设置
      nickname: (userInfo && userInfo.nickname !== '新用户') ? userInfo.nickname : '',
      isFirstSetup: options.firstSetup === '1',
    })
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

  handleSkip() {
    wx.reLaunch({ url: '/pages/home/home' })
  },
})
