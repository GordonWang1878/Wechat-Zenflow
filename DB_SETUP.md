# 数据库初始化说明

使用微信云开发控制台创建以下集合，并配置权限。

---

## 集合列表

### 1. `users` — 小程序用户表

| 字段        | 类型      | 说明                       |
|-------------|-----------|---------------------------|
| _id         | string    | 自动生成                   |
| _openid     | string    | 微信 openId（自动注入）    |
| memberNo    | string    | 用户编号，如 U0001          |
| nickname    | string    | 昵称，默认"新用户"         |
| notes       | string    | 备注                       |
| isAdmin     | boolean   | 是否为管理员，默认 false   |
| createdAt   | timestamp | 创建时间                   |
| updatedAt   | timestamp | 更新时间                   |

**权限设置**：仅创建者可读写（云函数操作）

---

### 2. `members` — 工作室会员表

| 字段        | 类型      | 说明                   |
|-------------|-----------|------------------------|
| _id         | string    | 自动生成               |
| memberNo    | string    | 会员编号，如 M0001      |
| name        | string    | 姓名                   |
| phone       | string    | 手机号                 |
| gender      | string    | 性别：男/女/未知        |
| balance     | number    | 账户余额               |
| notes       | string    | 备注                   |
| createdAt   | timestamp | 创建时间               |
| updatedAt   | timestamp | 更新时间               |

**权限设置**：所有用户可读，仅管理员（通过云函数）可写

---

### 3. `transactions` — 交易记录表

| 字段          | 类型      | 说明                        |
|---------------|-----------|-----------------------------|
| _id           | string    | 自动生成                    |
| memberId      | string    | 关联的会员 _id              |
| memberNo      | string    | 会员编号                    |
| memberName    | string    | 会员姓名                    |
| type          | string    | recharge（充值）/consume（消费）|
| amount        | number    | 金额                        |
| balanceBefore | number    | 交易前余额                  |
| balanceAfter  | number    | 交易后余额                  |
| notes         | string    | 备注                        |
| createdAt     | timestamp | 创建时间                    |

**权限设置**：所有用户可读，仅管理员（通过云函数）可写

---

### 4. `homepage` — 主页内容（单条记录）

| 字段        | 类型      | 说明                 |
|-------------|-----------|----------------------|
| _id         | string    | 固定为 `config`      |
| title       | string    | 主页标题             |
| subtitle    | string    | 副标题               |
| description | string    | 工作室介绍           |
| services    | array     | 服务项目列表         |
| contact     | string    | 联系电话             |
| address     | string    | 地址                 |
| updatedAt   | timestamp | 更新时间             |

**services 数组元素格式**：
```json
{ "name": "推拿60分钟", "price": "200" }
```

**权限设置**：所有用户可读，仅管理员可写

---

## 初始化管理员账号

首次使用时，需要手动将你的账号标记为管理员：

1. 使用微信登录小程序（会自动创建用户记录）
2. 进入云开发控制台 → 数据库 → `users` 集合
3. 找到你的记录（可通过 nickname 或 memberNo 识别）
4. 将 `isAdmin` 字段修改为 `true`
5. 重新登录小程序即可获得管理员权限

---

## 环境配置

在 `miniprogram/app.js` 中，将 `YOUR_ENV_ID` 替换为你的云开发环境 ID：

```javascript
wx.cloud.init({
  env: 'YOUR_ENV_ID',  // ← 替换这里
  traceUser: true,
})
```

在 `project.config.json` 中，将 `your-appid-here` 替换为你的小程序 AppID。
