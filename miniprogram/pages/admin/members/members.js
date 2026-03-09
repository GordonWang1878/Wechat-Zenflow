// pages/admin/members/members.js
const { requireAdmin } = require('../../../utils/auth')

Page({
  data: {
    members: [],
    filteredMembers: [],
    loading: true,
    keyword: '',
  },

  onLoad() {
    if (!requireAdmin()) return
    this._loadMembers()
  },

  onShow() {
    // 返回此页面时刷新列表（新增/编辑后）
    this._loadMembers()
  },

  async _loadMembers() {
    this.setData({ loading: true })
    try {
      const db = wx.cloud.database()
      const res = await db.collection('members')
        .orderBy('memberNo', 'asc')
        .get()
      this.setData({ members: res.data, loading: false })
      this._applyFilter()
    } catch (err) {
      console.error('加载会员失败:', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
      this.setData({ loading: false })
    }
  },

  // 搜索过滤（本地过滤）
  onSearchInput(e) {
    this.setData({ keyword: e.detail.value }, () => this._applyFilter())
  },

  _applyFilter() {
    const kw = this.data.keyword.trim().toLowerCase()
    if (!kw) {
      this.setData({ filteredMembers: this.data.members })
      return
    }
    const filtered = this.data.members.filter(m =>
      m.name.toLowerCase().includes(kw) ||
      m.memberNo.toLowerCase().includes(kw) ||
      (m.phone && m.phone.includes(kw))
    )
    this.setData({ filteredMembers: filtered })
  },

  // 前往新增会员
  goToAdd() {
    wx.navigateTo({ url: '/pages/admin/member-form/member-form' })
  },

  // 前往会员详情
  goToDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/admin/member-detail/member-detail?id=${id}` })
  },

  // 删除会员
  deleteMember(e) {
    const { id, name } = e.currentTarget.dataset
    wx.showModal({
      title: '确认删除',
      content: `确定删除会员「${name}」吗？该操作不可恢复。`,
      confirmColor: '#e53935',
      success: async res => {
        if (!res.confirm) return
        wx.showLoading({ title: '删除中...' })
        try {
          await wx.cloud.database().collection('members').doc(id).remove()
          wx.hideLoading()
          wx.showToast({ title: '已删除', icon: 'success' })
          this._loadMembers()
        } catch (err) {
          wx.hideLoading()
          wx.showToast({ title: '删除失败', icon: 'none' })
        }
      },
    })
  },
})
