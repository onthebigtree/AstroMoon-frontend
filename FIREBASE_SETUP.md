# Firebase 登录配置指南

## 概述
本项目已经集成了 Firebase 认证系统，支持：
- 电子邮件链接登录（无密码）
- Google 单点登录（SSO）

## 配置步骤

### 1. 创建 Firebase 项目

1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 点击"添加项目"或"Create a project"
3. 输入项目名称，例如 "AstroMoon"
4. （可选）启用 Google Analytics
5. 点击"创建项目"

### 2. 注册 Web 应用

1. 在项目概览页面，点击 Web 图标 `</>`
2. 输入应用昵称，例如 "AstroMoon Web"
3. （可选）勾选 "Also set up Firebase Hosting"
4. 点击"注册应用"
5. **配置信息已经填写完成**（位于 `firebase.config.ts` 文件）

### 3. 启用身份验证方法

#### 启用电子邮件链接登录（无密码）

1. 在 Firebase Console 左侧菜单，点击 "Authentication"（身份验证）
2. 点击 "Get started"（开始使用）
3. 点击 "Sign-in method"（登录方法）标签
4. 点击 "Email/Password"
5. **只启用第二个选项** "Email link (passwordless sign-in)"（电子邮件链接/无密码登录）
6. 点击保存

#### 启用 Google 登录

1. 在同一页面点击 "Google"
2. 启用开关
3. 选择项目支持电子邮件
4. 点击保存

### 4. 配置授权域（重要！）

这一步非常关键，否则会出现 `auth/unauthorized-domain` 错误。

#### 开发环境配置

1. 在 Firebase Console 的 Authentication 页面
2. 点击 "Settings"（设置）标签
3. 滚动到 "Authorized domains"（授权域）
4. 默认已包含 `localhost`，如果没有，点击 "Add domain" 添加：
   - `localhost`

#### 生产环境配置

如果你部署到以下平台，需要添加相应域名：

**生产域名:**
```
app.astromoon.xyz
```

**其他平台示例:**
```
your-app.vercel.app
your-app.netlify.app
```

**添加步骤：**
1. 点击 "Add domain"（添加域）
2. 输入域名（不包含 http:// 或 https://）
3. 点击"添加"

### 5. 常见错误和解决方案

#### 错误：`auth/unauthorized-domain`

**原因：** 当前访问的域名不在 Firebase 授权域列表中

**解决方法：**
1. 打开浏览器控制台，查看当前域名
2. 访问 Firebase Console → Authentication → Settings → Authorized domains
3. 点击 "Add domain"
4. 添加你的域名
5. 刷新页面重试

**示例：**
- 本地开发：添加 `localhost`
- 生产环境：添加 `app.astromoon.xyz`

#### 错误：Google 登录弹窗被阻止

**解决方法：**
1. 检查浏览器设置，允许该网站显示弹窗
2. 在地址栏右侧查看是否有弹窗被阻止的图标
3. 点击允许后重试

## 工作流程

### 电子邮件链接登录流程

1. 用户输入邮箱地址
2. 系统发送包含登录链接的邮件
3. 用户在邮件中点击链接
4. 自动完成登录并跳转到应用

**注意事项：**
- 链接有效期为 60 分钟
- 必须在同一浏览器中打开链接
- 如果在不同设备打开，需要再次输入邮箱验证

### Google 登录流程

1. 用户点击 "使用 Google 账号登录"
2. 弹出 Google 登录窗口
3. 选择 Google 账号
4. 授权后自动完成登录

## 项目文件结构

```
├── firebase.config.ts           # Firebase 配置文件
├── contexts/
│   └── AuthContext.tsx         # 认证上下文，提供全局认证状态
├── components/
│   └── Login.tsx               # 登录组件（电子邮件链接 + Google）
├── App.tsx                     # 主应用，包含登录检查逻辑
└── index.tsx                   # 入口文件，包裹 AuthProvider
```

## 功能说明

### 已实现的功能

1. **电子邮件链接登录（无密码）**
   - 输入邮箱即可登录
   - 自动发送登录链接到邮箱
   - 60秒发送间隔限制
   - 自动处理邮箱链接验证
   - 支持跨设备登录（需要重新输入邮箱）

2. **Google 单点登录**
   - 一键登录
   - 弹窗式登录
   - 完善的错误处理

3. **用户状态管理**
   - 全局认证状态
   - 自动登录状态持久化
   - 登出功能

4. **UI/UX**
   - 美观的渐变背景
   - 响应式设计
   - 邮件发送成功提示
   - 倒计时功能
   - 清晰的错误提示
   - 加载状态指示

### 使用方式

用户在访问应用时：
- 如果未登录，自动显示登录页面
- 可以选择电子邮件链接登录或 Google 登录
- 登录成功后，显示主应用内容
- 可以随时点击右上角的"退出"按钮登出

## 测试步骤

### 1. 测试电子邮件链接登录

```bash
npm run dev
```

1. 访问 http://localhost:5173
2. 输入邮箱地址
3. 点击"发送登录链接"
4. 检查邮箱（包括垃圾邮件箱）
5. 点击邮件中的链接
6. 应该自动登录并进入应用

### 2. 测试 Google 登录

1. 在登录页面点击 "使用 Google 账号登录"
2. 在弹出窗口中选择 Google 账号
3. 应该自动登录并进入应用

### 3. 测试登出功能

1. 登录后，点击右上角的用户邮箱旁边的"退出"按钮
2. 应该返回登录页面

## 安全建议

1. **环境变量（可选优化）**
   - 考虑使用环境变量存储 Firebase 配置
   - 创建 `.env` 文件：
     ```
     VITE_FIREBASE_API_KEY=your_api_key
     VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
     ...
     ```
   - 修改 `firebase.config.ts` 读取环境变量

2. **配置安全规则**
   - 如果使用 Firestore 或 Storage，配置安全规则
   - 确保只有授权用户可以访问数据

3. **启用应用检查（App Check）**
   - 防止未授权的客户端访问 Firebase 服务
   - 参考：https://firebase.google.com/docs/app-check

4. **监控使用情况**
   - 定期检查 Firebase Console 中的使用统计
   - 设置配额警报

## 邮件发送限制

Firebase 免费版本有以下限制：
- 每日邮件发送上限
- 如果超出限制，会返回 `auth/quota-exceeded` 错误
- 建议在生产环境监控邮件发送量

## 故障排除

### 问题：未收到登录邮件

**可能原因：**
1. 邮件在垃圾邮件文件夹中
2. 邮箱地址输入错误
3. 邮件服务器延迟

**解决方法：**
1. 检查垃圾邮件文件夹
2. 等待 1-2 分钟后再检查
3. 尝试重新发送
4. 尝试使用其他邮箱

### 问题：点击邮件链接后提示错误

**可能原因：**
1. 链接已过期（超过 60 分钟）
2. 在不同浏览器中打开
3. 链接已被使用

**解决方法：**
1. 重新发送登录链接
2. 确保在同一浏览器中打开
3. 如果在不同设备，输入邮箱地址继续

### 问题：Google 登录失败

**可能原因：**
1. 弹窗被浏览器阻止
2. Google 登录未启用
3. 域名未授权

**解决方法：**
1. 允许浏览器弹窗
2. 检查 Firebase Console 中是否启用 Google 登录
3. 添加当前域名到授权域列表

## 下一步优化建议

1. **添加邮箱验证**
   - 要求用户验证邮箱地址
   - 增强账户安全性

2. **添加更多登录方式**
   - GitHub 登录
   - Facebook 登录
   - Apple 登录

3. **用户资料管理**
   - 允许用户编辑个人信息
   - 上传头像

4. **集成 Firestore**
   - 存储用户数据
   - 保存用户的星盘分析历史

5. **多因素认证（MFA）**
   - 增加额外的安全层
   - 支持短信或认证器应用

## 支持

如有问题，请参考：
- [Firebase Authentication 文档](https://firebase.google.com/docs/auth)
- [Email Link Authentication](https://firebase.google.com/docs/auth/web/email-link-auth)
- [Google Sign-In](https://firebase.google.com/docs/auth/web/google-signin)
