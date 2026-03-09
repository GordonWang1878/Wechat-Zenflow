// utils/auth.js —— 登录/权限工具
const app = getApp()

/**
 * 检查是否已登录；未登录则跳转到登录页
 * @returns {boolean}
 */
function requireLogin() {
  if (!app.globalData.isLoggedIn) {
    wx.reLaunch({ url: '/pages/login/login' })
    return false
  }
  return true
}

/**
 * 检查是否为管理员；无权限则提示并返回上一页
 * @returns {boolean}
 */
function requireAdmin() {
  if (!requireLogin()) return false
  if (!app.globalData.isAdmin) {
    wx.showToast({ title: '无权限访问', icon: 'none', duration: 2000 })
    setTimeout(() => wx.navigateBack(), 2000)
    return false
  }
  return true
}

module.exports = { requireLogin, requireAdmin }
