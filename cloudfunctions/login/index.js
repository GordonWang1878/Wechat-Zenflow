// cloudfunctions/login/index.js
// 登录云函数：获取 openId，查询/创建用户记录
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  // 云函数自动注入调用者的 openId
  const { OPENID } = cloud.getWXContext()

  if (!OPENID) {
    return { success: false, error: '无法获取用户标识' }
  }

  try {
    // 查询当前用户是否已存在
    const res = await db.collection('users')
      .where({ _openid: OPENID })
      .get()

    if (res.data.length > 0) {
      // 已存在：直接返回用户信息
      return { success: true, isNewUser: false, user: res.data[0] }
    }

    // 新用户：自动注册（默认非管理员）
    const countRes = await db.collection('users').count()
    const memberNo = 'U' + String(countRes.total + 1).padStart(4, '0')

    const now = db.serverDate()
    const newUser = {
      _openid: OPENID,   // 云函数调用 add() 不会自动注入 _openid，必须手动写入
      memberNo,
      nickname: '新用户',
      notes: '',
      isAdmin: false,
      createdAt: now,
      updatedAt: now,
    }

    const addRes = await db.collection('users').add({ data: newUser })

    return {
      success: true,
      isNewUser: true,
      user: { _id: addRes._id, _openid: OPENID, ...newUser },
    }
  } catch (err) {
    console.error('login cloud function error:', err)
    return { success: false, error: err.message }
  }
}
