# Cloudflare Turnstile 人类验证配置指南

本项目已集成 Cloudflare Turnstile 人类验证，在用户生成占星报告前进行验证。

## 📌 什么是 Cloudflare Turnstile？

Cloudflare Turnstile 是一个免费、隐私友好的人类验证服务，是 Google reCAPTCHA 的替代品。特点：

- ✅ 完全免费
- ✅ 无需 Google 账号
- ✅ 更好的用户体验（大多数情况下无需交互）
- ✅ 符合隐私法规（GDPR、CCPA）
- ✅ 无广告追踪

## 🚀 快速开始

### 1. 获取 Site Key

访问 [Cloudflare Dashboard](https://dash.cloudflare.com/?to=/:account/turnstile)：

1. 登录 Cloudflare 账号（没有账号需先注册）
2. 进入 **Turnstile** 页面
3. 点击 **Add Site** 创建新站点
4. 填写配置：
   - **Site name**: `AstroMoon Frontend`（随意命名）
   - **Domain**:
     - 开发环境：`localhost`
     - 生产环境：你的实际域名（如 `astromoon.com`）
   - **Widget Mode**: 选择 `Managed`（推荐，自动适应难度）
5. 点击 **Create** 创建
6. 复制生成的 **Site Key**（形如 `0x4AAA...`）

### 2. 配置环境变量

在项目根目录的 `.env` 文件中添加：

```bash
# Cloudflare Turnstile Site Key
VITE_TURNSTILE_SITE_KEY=你的_Site_Key
```

**注意**：
- 如果 `.env` 文件不存在，复制 `.env.example` 并重命名为 `.env`
- 开发环境和生产环境可以使用不同的 Site Key
- 测试时可以使用测试密钥：`1x00000000000000000000AA`（始终通过验证）

### 3. 重启开发服务器

修改 `.env` 后需要重启开发服务器：

```bash
npm run dev
```

## 🔧 验证流程

用户在生成占星报告时的验证流程：

1. 用户点击"继续生成完整分析"按钮
2. 检查生成次数限制
3. 显示社交媒体关注弹窗（Telegram + Twitter）
4. 用户点击"验证并继续"后，弹出 **Cloudflare Turnstile 验证**
5. Turnstile 自动检测用户是否为真人（大多数情况下无需交互）
6. 验证成功后，开始 AI 生成报告

## 🎨 验证模式

Cloudflare Turnstile 支持三种模式：

### 1. Managed（推荐）
- 自动适应难度
- 大多数用户无需交互
- 怀疑是机器人时才显示挑战

### 2. Non-Interactive
- 完全静默验证
- 用户无感知
- 适合对用户体验要求高的场景

### 3. Invisible
- 后台验证
- 需要在代码中手动触发

**当前配置使用 Managed 模式。**

## 📊 监控与分析

在 [Cloudflare Turnstile Dashboard](https://dash.cloudflare.com/?to=/:account/turnstile) 可以查看：

- 验证请求总数
- 通过率
- 拦截的机器人数量
- 响应时间分析

## 🔒 安全注意事项

### ⚠️ Site Key vs Secret Key

- **Site Key (Public)**：前端可见，用于显示验证组件
- **Secret Key (Private)**：仅后端使用，用于验证 token

**重要**：本项目目前仅实现前端验证（适用于防止普通滥用）。如需更高安全性，需要：

1. 在后端验证 Turnstile token
2. 后端调用 Cloudflare API 确认 token 有效性

### 后端验证示例（可选）

```javascript
// 后端 API 路由
app.post('/api/verify-turnstile', async (req, res) => {
  const { token } = req.body;

  // 调用 Cloudflare API 验证
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: token
    })
  });

  const data = await response.json();

  if (data.success) {
    res.json({ verified: true });
  } else {
    res.status(400).json({ verified: false });
  }
});
```

## 🧪 测试

### 测试密钥

Cloudflare 提供专用测试密钥：

| 用途 | Site Key |
|------|----------|
| 总是通过 | `1x00000000000000000000AA` |
| 总是失败 | `2x00000000000000000000AB` |
| 强制交互挑战 | `3x00000000000000000000FF` |

使用测试密钥时，验证始终按预期行为返回结果。

### 本地测试

1. 在 `.env` 中设置测试密钥：
   ```bash
   VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA
   ```

2. 启动开发服务器：
   ```bash
   npm run dev
   ```

3. 访问 `http://localhost:5173` 并测试生成报告流程

## 🌐 生产环境部署

### Vercel 部署

1. 在 Vercel Dashboard → 项目设置 → Environment Variables 中添加：
   ```
   VITE_TURNSTILE_SITE_KEY = 你的生产环境Site_Key
   ```

2. 重新部署项目

### 域名配置

确保在 Cloudflare Turnstile 站点配置中添加了生产域名：

- ✅ 正确：`yourdomain.com`
- ❌ 错误：`https://yourdomain.com`（不要加协议）

支持通配符域名：
- `*.yourdomain.com` - 匹配所有子域名
- `yourdomain.com` - 仅匹配主域名

## 📚 相关资源

- [Cloudflare Turnstile 官方文档](https://developers.cloudflare.com/turnstile/)
- [React Turnstile 组件库](https://github.com/marsidev/react-turnstile)
- [Turnstile Dashboard](https://dash.cloudflare.com/?to=/:account/turnstile)

## ❓ 常见问题

### Q: 验证失败怎么办？

A: 检查以下几点：
1. Site Key 是否正确配置
2. 域名是否在 Cloudflare 站点配置中
3. 浏览器是否禁用了第三方脚本
4. 网络是否能访问 Cloudflare

### Q: 测试环境总是失败？

A: 确保使用测试密钥 `1x00000000000000000000AA`，或在 Cloudflare 配置中添加 `localhost` 域名。

### Q: 如何禁用验证？

A: 在 `ImportDataMode.tsx` 中注释掉 Turnstile 验证逻辑（不推荐）。

### Q: 验证影响性能吗？

A: Turnstile 加载脚本约 10KB，验证时间通常 < 1 秒，对性能影响极小。

---

🎉 配置完成后，你的应用将拥有强大的机器人防护能力！
