// pages/admin/member-detail/member-detail.js
const { requireAdmin } = require('../../../utils/auth')
const { formatDateTime } = require('../../../utils/db')

Page({
  data: {
    member: null,
    transactions: [],
    loading: true,
    txLoading: true,
    memberId: '',
  },

  onLoad(options) {
    if (!requireAdmin()) return
    if (!options.id) {
      wx.showToast({ title: '参数错误', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 1500)
      return
    }
    this.setData({ memberId: options.id })
    this._loadMember(options.id)
    this._loadTransactions(options.id)
  },

  onShow() {
    // 充值/消费后刷新数据
    if (this.data.memberId) {
      this._loadMember(this.data.memberId)
      this._loadTransactions(this.data.memberId)
    }
  },

  async _loadMember(id) {
    this.setData({ loading: true })
    try {
      const db = wx.cloud.database()
      const res = await db.collection('members').doc(id).get()
      this.setData({ member: res.data, loading: false })
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' })
      this.setData({ loading: false })
    }
  },

  async _loadTransactions(memberId) {
    this.setData({ txLoading: true })
    try {
      const db = wx.cloud.database()
      const res = await db.collection('transactions')
        .where({ memberId })
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get()
      const txList = res.data.map(tx => ({
        ...tx,
        timeStr: formatDateTime(tx.createdAt),
      }))
      this.setData({ transactions: txList, txLoading: false })
    } catch (err) {
      console.error('加载交易记录失败:', err)
      this.setData({ txLoading: false })
    }
  },

  // 前往编辑会员
  goToEdit() {
    wx.navigateTo({
      url: `/pages/admin/member-form/member-form?id=${this.data.memberId}`,
    })
  },

  // 充值 / 消费
  goToTransaction(e) {
    const { type } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/admin/transaction/transaction?memberId=${this.data.memberId}&type=${type}`,
    })
  },
})
