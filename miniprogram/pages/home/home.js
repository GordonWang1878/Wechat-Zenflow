// pages/home/home.js
const app = getApp()
const { requireLogin } = require('../../utils/auth')

Page({
  data: {
    userInfo: null,
    isAdmin: false,
    content: null,
    loading: true,
  },

  onLoad() {
    if (!requireLogin()) return
    this.setData({
      userInfo: app.globalData.userInfo,
      isAdmin: app.globalData.isAdmin,
    })
    this._loadContent()
  },

  onShow() {
    // 每次显示时重新加载（管理员编辑后刷新）
    if (app.globalData.isLoggedIn) {
      this._loadContent()
    }
  },

  async _loadContent() {
    this.setData({ loading: true })
    try {
      const db = wx.cloud.database()
      const res = await db.collection('homepage').doc('config').get()
      this.setData({ content: res.data, loading: false })
    } catch (err) {
      // 尚未设置主页内容时使用默认值
      this.setData({
        content: {
          title: '禅流中医推拿',
          subtitle: '专业推拿 · 调理身心',
          description: '欢迎光临，我们提供专业的中医推拿服务，致力于为您调理身体、缓解疲劳。',
          services: [],
          contact: '',
          address: '',
        },
        loading: false,
      })
    }
  },

  goToProfile() {
    wx.navigateTo({ url: '/pages/profile/profile' })
  },

  goToMembers() {
    wx.navigateTo({ url: '/pages/admin/members/members' })
  },

  goToEditHome() {
    wx.navigateTo({ url: '/pages/admin/edit-home/edit-home' })
  },

  handleLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: res => {
        if (res.confirm) {
          app.logout()
          wx.reLaunch({ url: '/pages/login/login' })
        }
      },
    })
  },
})
