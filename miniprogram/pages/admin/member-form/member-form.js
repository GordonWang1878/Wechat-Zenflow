// pages/admin/member-form/member-form.js
// 新增 / 编辑 会员
const { requireAdmin } = require('../../../utils/auth')
const { collections, generateMemberNo } = require('../../../utils/db')

Page({
  data: {
    isEdit: false,
    memberId: '',
    form: {
      name: '',
      phone: '',
      gender: '',
      notes: '',
      balance: '',
    },
    genderOptions: ['男', '女', '未知'],
    genderIndex: 2,
    submitting: false,
  },

  onLoad(options) {
    if (!requireAdmin()) return
    if (options.id) {
      this.setData({ isEdit: true, memberId: options.id })
      wx.setNavigationBarTitle({ title: '编辑会员' })
      this._loadMember(options.id)
    } else {
      wx.setNavigationBarTitle({ title: '新增会员' })
    }
  },

  async _loadMember(id) {
    wx.showLoading({ title: '加载中...' })
    try {
      const db = wx.cloud.database()
      const res = await db.collection('members').doc(id).get()
      const m = res.data
      const genderIndex = ['男', '女', '未知'].indexOf(m.gender)
      this.setData({
        form: {
          name: m.name || '',
          phone: m.phone || '',
          gender: m.gender || '',
          notes: m.notes || '',
          balance: String(m.balance || 0),
        },
        genderIndex: genderIndex >= 0 ? genderIndex : 2,
      })
      wx.hideLoading()
    } catch (err) {
      wx.hideLoading()
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  onInput(e) {
    const { field } = e.currentTarget.dataset
    this.setData({ [`form.${field}`]: e.detail.value })
  },

  onGenderChange(e) {
    const idx = Number(e.detail.value)
    this.setData({
      genderIndex: idx,
      'form.gender': this.data.genderOptions[idx],
    })
  },

  async handleSubmit() {
    const { form, isEdit, memberId } = this.data

    // 验证
    if (!form.name.trim()) {
      wx.showToast({ title: '请输入姓名', icon: 'none' })
      return
    }
    const balance = parseFloat(form.balance)
    if (form.balance !== '' && (isNaN(balance) || balance < 0)) {
      wx.showToast({ title: '余额格式不正确', icon: 'none' })
      return
    }

    this.setData({ submitting: true })
    wx.showLoading({ title: isEdit ? '保存中...' : '创建中...' })

    try {
      const db = wx.cloud.database()
      const now = db.serverDate()

      if (isEdit) {
        await db.collection('members').doc(memberId).update({
          data: {
            name: form.name.trim(),
            phone: form.phone.trim(),
            gender: form.gender || '未知',
            notes: form.notes.trim(),
            updatedAt: now,
          },
        })
      } else {
        const memberNo = await generateMemberNo()
        await collections.members.add({
          data: {
            memberNo,
            name: form.name.trim(),
            phone: form.phone.trim(),
            gender: form.gender || '未知',
            notes: form.notes.trim(),
            balance: isNaN(balance) ? 0 : balance,
            createdAt: now,
            updatedAt: now,
          },
        })
      }

      wx.hideLoading()
      wx.showToast({ title: isEdit ? '保存成功' : '创建成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1200)
    } catch (err) {
      wx.hideLoading()
      console.error('保存失败:', err)
      wx.showToast({ title: '操作失败，请重试', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  },
})
