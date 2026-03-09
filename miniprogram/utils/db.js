// utils/db.js —— 数据库工具
const db = wx.cloud.database()
const _ = db.command

// ===== 集合引用 =====
const collections = {
  users: db.collection('users'),
  members: db.collection('members'),
  transactions: db.collection('transactions'),
  homepage: db.collection('homepage'),
}

// ===== 日期格式化 =====
function formatDate(val) {
  if (!val) return ''
  const d = val instanceof Date ? val : new Date(val)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatDateTime(val) {
  if (!val) return ''
  const d = val instanceof Date ? val : new Date(val)
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${formatDate(d)} ${h}:${min}`
}

// ===== 生成会员编号 =====
async function generateMemberNo() {
  const res = await collections.members.count()
  return 'M' + String(res.total + 1).padStart(4, '0')
}

module.exports = {
  db,
  _,
  collections,
  formatDate,
  formatDateTime,
  generateMemberNo,
}
