// pages/admin/transaction/transaction.js
// 充值 / 消费 页面
const { requireAdmin } = require('../../../utils/auth')

Page({
  data: {
    memberId: '',
    type: 'recharge',     // 'recharge' | 'consume'
    member: null,
    amount: '',
    notes: '',
    submitting: false,
    projectedBalance: null,
  },

  onLoad(options) {
    if (!requireAdmin()) return
    const type = options.type || 'recharge'
    this.setData({ memberId: options.memberId, type })
    wx.setNavigationBarTitle({ title: type === 'recharge' ? '充值' : '消费' })
    this._loadMember(options.memberId)
  },

  async _loadMember(id) {
    try {
      const db = wx.cloud.database()
      const res = await db.collection('members').doc(id).get()
      this.setData({ member: res.data })
    } catch (err) {
      wx.showToast({ title: '加载会员失败', icon: 'none' })
    }
  },

  onAmountInput(e) {
    const amount = e.detail.value
    this.setData({ amount })
    this._calcProjected(amount)
  },

  onNotesInput(e) {
    this.setData({ notes: e.detail.value })
  },

  _calcProjected(amountStr) {
    const { member, type } = this.data
    if (!member) return
    const amount = parseFloat(amountStr)
    if (isNaN(amount) || amount <= 0) {
      this.setData({ projectedBalance: null })
      return
    }
    const current = member.balance || 0
    const projected = type === 'recharge'
      ? current + amount
      : current - amount
    this.setData({ projectedBalance: projected.toFixed(2) })
  },

  async handleSubmit() {
    const { memberId, type, member, amount, notes } = this.data

    const amountNum = parseFloat(amount)
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      wx.showToast({ title: '请输入有效金额', icon: 'none' })
      return
    }
    if (type === 'consume' && amountNum > member.balance) {
      wx.showModal({
        title: '余额不足',
        content: `当前余额 ¥${member.balance}，消费金额 ¥${amountNum}，余额不足。`,
        showCancel: false,
      })
      return
    }

    this.setData({ submitting: true })
    wx.showLoading({ title: '处理中...' })

    try {
      const db = wx.cloud.database()
      const _ = db.command
      const now = db.serverDate()
      const balanceBefore = member.balance || 0
      const balanceAfter = type === 'recharge'
        ? balanceBefore + amountNum
        : balanceBefore - amountNum

      // 1. 更新会员余额
      await db.collection('members').doc(memberId).update({
        data: {
          balance: _.set(parseFloat(balanceAfter.toFixed(2))),
          updatedAt: now,
        },
      })

      // 2. 写入交易记录
      await db.collection('transactions').add({
        data: {
          memberId,
          memberNo: member.memberNo,
          memberName: member.name,
          type,
          amount: amountNum,
          balanceBefore,
          balanceAfter: parseFloat(balanceAfter.toFixed(2)),
          notes: notes.trim(),
          createdAt: now,
        },
      })

      wx.hideLoading()
      wx.showToast({
        title: type === 'recharge' ? '充值成功' : '消费成功',
        icon: 'success',
      })
      setTimeout(() => wx.navigateBack(), 1200)
    } catch (err) {
      wx.hideLoading()
      console.error('交易失败:', err)
      wx.showToast({ title: '操作失败，请重试', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  },
})
