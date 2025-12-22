# Telegram Login Bot 配置指南

## 概述

交易员模式使用 Telegram Login Widget 进行用户验证，需要创建一个 Telegram Bot 来处理登录。

## 配置步骤

### 1. 创建 Telegram Bot

1. 打开 Telegram，搜索 **@BotFather**
2. 发送 `/newbot` 命令
3. 按照提示输入 Bot 名称（例如：AstroMoon Login）
4. 输入 Bot 用户名（例如：astromoon_login_bot）
5. BotFather 会返回你的 Bot Token（保存好，后端需要用）

### 2. 配置 Bot 域名

1. 向 BotFather 发送 `/setdomain` 命令
2. 选择你刚创建的 Bot
3. 输入你的前端域名，例如：
   - 开发环境：`http://localhost:5173`
   - 生产环境：`https://yourdomain.com`

**注意：** 每个 Bot 只能设置一个域名。如果需要支持多个域名（如开发和生产），需要创建多个 Bot。

### 3. 更新前端配置

在 `components/ImportDataMode.tsx` 中，找到 TelegramLoginButton 组件：

```tsx
<TelegramLoginButton
    botUsername="astromoon_login_bot"  // 👈 替换为你的 Bot 用户名（不带 @）
    buttonSize="large"
    cornerRadius={10}
    requestAccess={true}
    dataOnauth={handleTelegramLogin}
/>
```

将 `botUsername` 替换为你的 Bot 用户名（不带 `@`）。

### 4. 验证配置

1. 启动前端开发服务器：`npm run dev`
2. 选择"交易员模式"
3. 点击"继续生成完整分析"
4. 在弹窗中点击"Login with Telegram"按钮
5. 如果配置正确，会跳转到 Telegram 授权页面

## 环境变量配置

### 开发环境

创建 `.env.local` 文件：

```bash
# Telegram Bot 配置
VITE_TELEGRAM_BOT_USERNAME=astromoon_login_bot
```

### 生产环境

在 Vercel/Netlify 等部署平台设置环境变量：

```bash
VITE_TELEGRAM_BOT_USERNAME=astromoon_login_bot_prod
```

## 使用环境变量（推荐）

修改 `ImportDataMode.tsx`，使用环境变量：

```tsx
<TelegramLoginButton
    botUsername={import.meta.env.VITE_TELEGRAM_BOT_USERNAME || "astromoon_login_bot"}
    // ...其他配置
/>
```

## 多环境支持

如果需要支持开发和生产环境，推荐创建两个 Bot：

1. **开发 Bot**：`astromoon_login_dev_bot`
   - 域名：`http://localhost:5173`

2. **生产 Bot**：`astromoon_login_bot`
   - 域名：`https://yourdomain.com`

然后在代码中根据环境动态选择：

```tsx
const botUsername = import.meta.env.DEV
    ? 'astromoon_login_dev_bot'
    : 'astromoon_login_bot';

<TelegramLoginButton botUsername={botUsername} />
```

## 常见问题

### Q: "Bot domain invalid" 错误

**A:** 确保在 BotFather 中使用 `/setdomain` 设置了正确的域名，域名必须完全匹配。

### Q: 登录按钮无法点击

**A:** 检查：
1. Bot 用户名是否正确（不要带 `@`）
2. 域名是否已配置
3. 浏览器控制台是否有错误

### Q: 如何获取用户的 Telegram ID？

**A:** 登录成功后，回调函数会返回用户信息：

```javascript
{
  id: 123456789,        // 用户 ID
  first_name: "John",   // 名字
  last_name: "Doe",     // 姓氏（可选）
  username: "johndoe",  // 用户名（可选）
  photo_url: "...",     // 头像 URL（可选）
  auth_date: 1234567890,// 授权时间戳
  hash: "..."           // 验证哈希
}
```

### Q: 如何验证登录数据的真实性？

**A:** 后端需要验证 `hash` 字段，确保数据来自 Telegram：

```python
import hashlib
import hmac

def verify_telegram_auth(auth_data, bot_token):
    check_hash = auth_data.pop('hash')
    data_check_string = '\n'.join([f"{k}={v}" for k, v in sorted(auth_data.items())])
    secret_key = hashlib.sha256(bot_token.encode()).digest()
    hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
    return hash == check_hash
```

## 参考资料

- [Telegram Login Widget 官方文档](https://core.telegram.org/widgets/login)
- [BotFather 使用指南](https://core.telegram.org/bots#6-botfather)
- [Telegram Bot API](https://core.telegram.org/bots/api)
