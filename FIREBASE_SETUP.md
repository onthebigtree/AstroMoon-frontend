# Firebase 登录配置指南

## 概述
本项目已经集成了 Firebase 认证系统，支持：
- 邮件/密码登录
- Google 单点登录（SSO）
- 密码重置功能

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
5. **记录下显示的配置信息**，格式如下：

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

### 3. 启用身份验证方法

1. 在 Firebase Console 左侧菜单，点击 "Authentication"（身份验证）
2. 点击 "Get started"（开始使用）
3. 点击 "Sign-in method"（登录方法）标签
4. 启用以下登录方法：

#### 启用邮件/密码登录
- 点击 "Email/Password"
- 启用第一个选项 "Email/Password"
- 点击保存

#### 启用 Google 登录
- 点击 "Google"
- 启用开关
- 选择项目支持电子邮件
- 点击保存

### 4. 更新项目配置

打开项目中的 `firebase.config.ts` 文件，将第 7-13 行的占位符替换为你的 Firebase 配置：

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",              // 替换为你的 API Key
  authDomain: "YOUR_AUTH_DOMAIN",      // 替换为你的 Auth Domain
  projectId: "YOUR_PROJECT_ID",        // 替换为你的 Project ID
  storageBucket: "YOUR_STORAGE_BUCKET", // 替换为你的 Storage Bucket
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // 替换为你的 Messaging Sender ID
  appId: "YOUR_APP_ID"                 // 替换为你的 App ID
};
```

### 5. （可选）配置授权域

如果你部署到自定义域名，需要将域名添加到授权域列表：

1. 在 Firebase Console 的 Authentication 页面
2. 点击 "Settings"（设置）标签
3. 滚动到 "Authorized domains"（授权域）
4. 点击 "Add domain"（添加域）
5. 输入你的域名（例如：yourdomain.com）
6. 点击"添加"

### 6. 测试登录功能

配置完成后：

1. 运行项目：`npm run dev`
2. 打开浏览器访问应用
3. 测试注册新账户
4. 测试邮件登录
5. 测试 Google 登录
6. 测试密码重置功能

## 项目文件结构

```
├── firebase.config.ts           # Firebase 配置文件
├── contexts/
│   └── AuthContext.tsx         # 认证上下文，提供全局认证状态
├── components/
│   └── Login.tsx               # 登录/注册组件
├── App.tsx                     # 主应用，包含登录检查逻辑
└── index.tsx                   # 入口文件，包裹 AuthProvider
```

## 功能说明

### 已实现的功能

1. **用户注册**
   - 邮件/密码注册
   - 密码强度验证（最少 6 个字符）
   - 邮箱格式验证

2. **用户登录**
   - 邮件/密码登录
   - Google 单点登录
   - 完善的错误处理和中文提示

3. **密码管理**
   - 忘记密码功能
   - 通过邮件重置密码

4. **用户状态管理**
   - 全局认证状态
   - 自动登录状态持久化
   - 登出功能

5. **UI/UX**
   - 美观的渐变背景
   - 响应式设计
   - 加载状态指示
   - 清晰的错误提示

### 使用方式

用户在访问应用时：
- 如果未登录，自动显示登录页面
- 登录成功后，显示主应用内容
- 可以随时点击右上角的"退出"按钮登出

## 安全建议

1. **不要将 Firebase 配置提交到公共仓库**
   - 考虑使用环境变量存储敏感配置
   - 添加 `firebase.config.ts` 到 `.gitignore`（如果包含真实配置）

2. **配置安全规则**
   - 在 Firebase Console 中配置 Firestore/Storage 安全规则
   - 确保只有授权用户可以访问数据

3. **启用应用检查（App Check）**
   - 防止未授权的客户端访问 Firebase 服务

4. **监控使用情况**
   - 定期检查 Firebase Console 中的使用统计
   - 设置配额警报

## 常见问题

### Q: 登录时提示 "auth/configuration-not-found"
A: 请检查 firebase.config.ts 中的配置是否正确填写，确保所有占位符都已替换。

### Q: Google 登录失败
A: 确保在 Firebase Console 中已启用 Google 登录方法，并且配置了项目支持电子邮件。

### Q: 本地开发时 Google 登录弹窗被阻止
A: 检查浏览器设置，允许该网站显示弹窗。

### Q: 部署后登录失败
A: 确保已将部署域名添加到 Firebase Console 的授权域列表中。

## 下一步

配置完成后，你可以：
1. 自定义登录页面样式
2. 添加更多登录方式（如 GitHub、Facebook 等）
3. 实现用户资料管理功能
4. 集成 Firestore 存储用户数据
5. 添加邮箱验证功能

## 支持

如有问题，请参考：
- [Firebase 文档](https://firebase.google.com/docs)
- [Firebase Authentication 指南](https://firebase.google.com/docs/auth)
