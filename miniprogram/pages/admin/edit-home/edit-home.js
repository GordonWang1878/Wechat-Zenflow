// pages/admin/edit-home/edit-home.js
const { requireAdmin } = require('../../../utils/auth')

Page({
  data: {
    form: {
      title: '',
      subtitle: '',
      description: '',
      services: [],
      contact: '',
      address: '',
    },
    loading: true,
    submitting: false,
    // 临时新增服务
    newServiceName: '',
    newServicePrice: '',
  },

  onLoad() {
    if (!requireAdmin()) return
    this._loadContent()
  },

  async _loadContent() {
    this.setData({ loading: true })
    try {
      const db = wx.cloud.database()
      const res = await db.collection('homepage').doc('config').get()
      this.setData({ form: { services: [], ...res.data }, loading: false })
    } catch (err) {
      // 首次使用时无内容，使用空表单
      this.setData({ loading: false })
    }
  },

  onInput(e) {
    const { field } = e.currentTarget.dataset
    this.setData({ [`form.${field}`]: e.detail.value })
  },

  onNewServiceInput(e) {
    const { field } = e.currentTarget.dataset
    this.setData({ [field]: e.detail.value })
  },

  // 添加服务项目
  addService() {
    const { newServiceName, newServicePrice, form } = this.data
    if (!newServiceName.trim()) {
      wx.showToast({ title: '请输入服务名称', icon: 'none' })
      return
    }
    const services = [...(form.services || []), {
      name: newServiceName.trim(),
      price: newServicePrice.trim() || '0',
    }]
    this.setData({
      'form.services': services,
      newServiceName: '',
      newServicePrice: '',
    })
  },

  // 删除服务项目
  removeService(e) {
    const { index } = e.currentTarget.dataset
    const services = [...this.data.form.services]
    services.splice(index, 1)
    this.setData({ 'form.services': services })
  },

  async handleSubmit() {
    const { form } = this.data
    if (!form.title.trim()) {
      wx.showToast({ title: '请填写主页标题', icon: 'none' })
      return
    }

    this.setData({ submitting: true })
    wx.showLoading({ title: '保存中...' })

    try {
      const db = wx.cloud.database()
      const data = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        description: form.description.trim(),
        services: form.services || [],
        contact: form.contact.trim(),
        address: form.address.trim(),
        updatedAt: db.serverDate(),
      }

      try {
        // 先尝试更新
        await db.collection('homepage').doc('config').set({ data })
      } catch {
        // 若不存在则新增（使用固定 _id = 'config'）
        await db.collection('homepage').add({ data: { _id: 'config', ...data } })
      }

      wx.hideLoading()
      wx.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1200)
    } catch (err) {
      wx.hideLoading()
      console.error('保存主页失败:', err)
      wx.showToast({ title: '保存失败，请重试', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  },
})
