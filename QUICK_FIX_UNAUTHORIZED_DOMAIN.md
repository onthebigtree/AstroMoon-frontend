# 🔧 快速修复：auth/unauthorized-domain 错误

## 问题说明
如果你看到错误信息：`Firebase: Error (auth/unauthorized-domain)`，这意味着你当前访问的域名没有在 Firebase 授权域列表中。

## 快速解决步骤（5分钟）

### 1. 确认当前域名
打开浏览器控制台（F12），在地址栏查看当前 URL。例如：
- `http://localhost:5173` → 域名是 `localhost`
- `https://app.astromoon.xyz` → 域名是 `app.astromoon.xyz`

### 2. 访问 Firebase Console
1. 打开 [Firebase Console](https://console.firebase.google.com/project/astromoon-f8837/authentication/settings)
2. 点击左侧菜单的 "Authentication"（身份验证）
3. 点击顶部的 "Settings"（设置）标签
4. 滚动到 "Authorized domains"（授权域）部分

### 3. 添加域名
1. 点击 "Add domain"（添加域）按钮
2. 输入你的域名（**不要包含** `http://` 或 `https://`）
   - ✅ 正确：`localhost`
   - ❌ 错误：`http://localhost`
   - ✅ 正确：`app.astromoon.xyz`
   - ❌ 错误：`https://app.astromoon.xyz`
3. 点击"添加"

### 4. 刷新页面测试
添加域名后，刷新你的应用页面，重新尝试登录。

## 常用域名列表

根据你的开发/部署环境，添加相应的域名：

### 本地开发
```
localhost
```

### Vercel 部署
```
your-app.vercel.app
your-custom-domain.com
```

### Netlify 部署
```
your-app.netlify.app
your-custom-domain.com
```

### 其他部署平台
添加你的实际域名即可。

## 验证配置

添加域名后，你应该在 "Authorized domains" 列表中看到：
- ✅ `localhost` (本地开发)
- ✅ `astromoon-f8837.firebaseapp.com` (Firebase 默认)
- ✅ 你添加的其他域名

## 仍然有问题？

### 问题 1：找不到 "Authorized domains" 选项
**解决方法：** 确保你在正确的项目中（astromoon-f8837），并且在 Authentication → Settings 标签下。

### 问题 2：添加后仍然报错
**解决方法：**
1. 清除浏览器缓存
2. 完全关闭浏览器重新打开
3. 确认域名拼写完全正确（不包含端口号，如 `:5173`）

### 问题 3：Google 登录仍然失败
**额外步骤：** 确保在 Authentication → Sign-in method 中启用了 Google 登录。

## 联系支持

如果以上步骤都无法解决问题，请检查：
1. Firebase 项目是否正常运行
2. 网络连接是否正常
3. 浏览器控制台是否有其他错误信息

---

💡 **提示：** 添加域名是一次性操作，添加后该域名将永久有效，无需重复配置。
