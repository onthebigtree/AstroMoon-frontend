# 🚀 AstroMoon Frontend - Vercel 部署指南

本项目是一个纯前端应用，使用 React + Vite 构建，部署到 Vercel。

## 📋 部署前准备

### 1. 确保已安装 Vercel CLI（可选）

```bash
npm install -g vercel
```

### 2. 检查项目文件

确保以下文件存在并配置正确：

- ✅ `package.json` - 构建脚本
- ✅ `vercel.json` - Vercel 配置
- ✅ `.vercelignore` - 忽略文件
- ✅ `.env.example` - 环境变量示例

## 🌐 方法 1：通过 Vercel Dashboard 部署（推荐）

### 步骤 1：准备 Git 仓库

```bash
# 初始化 Git（如果还没有）
git init

# 添加所有文件
git add .

# 创建提交
git commit -m "Initial commit: AstroMoon frontend"

# 关联远程仓库（GitHub/GitLab/Bitbucket）
git remote add origin <your-repo-url>
git push -u origin main
```

### 步骤 2：导入到 Vercel

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 **"Add New Project"**
3. 选择 **"Import Git Repository"**
4. 授权并选择您的仓库
5. Vercel 会自动检测到 Vite 项目

### 步骤 3：配置项目

**Framework Preset:** Vite（自动检测）

**Build Settings:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

**Root Directory:** `./`（项目根目录）

### 步骤 4：配置环境变量

在 Vercel 项目设置中，添加以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `VITE_BACKEND_URL` | `http://43.134.98.27:3782` | 后端 API 地址 |

> ⚠️ **重要：** Vercel 会自动读取以 `VITE_` 开头的环境变量

### 步骤 5：部署

点击 **"Deploy"** 按钮，等待部署完成（通常 1-2 分钟）。

---

## 💻 方法 2：使用 Vercel CLI 部署

### 快速部署

```bash
# 登录 Vercel
vercel login

# 首次部署（会引导配置）
vercel

# 生产环境部署
vercel --prod
```

### 设置环境变量

```bash
# 添加环境变量
vercel env add VITE_BACKEND_URL production

# 输入值: http://43.134.98.27:3782
```

### 查看部署状态

```bash
# 查看部署列表
vercel ls

# 查看部署详情
vercel inspect <deployment-url>
```

---

## 🔧 Vercel 配置说明

### `vercel.json` 配置

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**关键配置：**

1. **SPA 路由重写**
   - 所有路由都重定向到 `index.html`
   - 支持客户端路由（React Router 等）

2. **安全头部**
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `X-XSS-Protection: 1; mode=block`

3. **静态资源缓存**
   - `/assets/*` 缓存 1 年
   - 不可变资源（带 hash 的文件）

---

## 🌍 环境变量配置

### 本地开发

创建 `.env` 文件：

```bash
# .env
VITE_BACKEND_URL=http://43.134.98.27:3782
```

### Vercel 生产环境

在 Vercel Dashboard 中配置：

1. 进入项目 → Settings → Environment Variables
2. 添加变量：
   - Name: `VITE_BACKEND_URL`
   - Value: `http://43.134.98.27:3782`
   - Environment: Production

### 验证环境变量

```javascript
// 在代码中访问
console.log(import.meta.env.VITE_BACKEND_URL);
```

---

## 🔍 常见问题

### 1. 部署失败：找不到构建输出

**原因：** 构建命令或输出目录配置错误

**解决：**
- 确保 `package.json` 中有 `"build": "vite build"`
- 确保 `vercel.json` 中 `outputDirectory` 为 `"dist"`

### 2. API 请求失败（CORS 错误）

**原因：** 后端未配置 CORS 允许 Vercel 域名

**解决：**
- 在后端添加 Vercel 域名到 CORS 白名单
- 或设置 `CORS_ORIGIN=*`（开发测试）

### 3. 环境变量未生效

**原因：** 环境变量名不以 `VITE_` 开头

**解决：**
- Vite 要求环境变量必须以 `VITE_` 开头
- 修改后需要重新部署

### 4. 页面刷新 404

**原因：** SPA 路由未配置

**解决：**
- 检查 `vercel.json` 中是否有 `rewrites` 配置
- 确保所有路由重定向到 `/index.html`

---

## 📊 部署性能优化

### 1. 启用压缩

Vercel 默认启用 Gzip 和 Brotli 压缩，无需配置。

### 2. 静态资源缓存

已在 `vercel.json` 中配置：

```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 3. 代码分割

Vite 自动进行代码分割，生成带 hash 的文件。

---

## 🔄 自动部署（CI/CD）

### GitHub 集成

1. 连接 GitHub 仓库后，Vercel 会自动：
   - ✅ 监听 `main` 分支推送
   - ✅ 自动构建和部署
   - ✅ 为 PR 创建预览部署

### 触发部署

```bash
# 推送到 main 分支
git push origin main

# Vercel 自动部署
```

### 部署状态检查

- GitHub PR 会显示部署状态
- 每次部署都有唯一的预览 URL
- 可以在 Vercel Dashboard 查看日志

---

## 🧪 部署后测试

### 1. 检查健康状态

访问部署的 URL，检查：
- ✅ 页面是否正常加载
- ✅ 样式是否正确
- ✅ API 请求是否成功

### 2. 测试 API 连接

打开浏览器控制台，执行：

```javascript
fetch(import.meta.env.VITE_BACKEND_URL + '/health')
  .then(r => r.json())
  .then(console.log);
```

### 3. 检查控制台错误

- 打开 DevTools → Console
- 确保没有 CORS 或网络错误

---

## 📝 部署清单

部署前检查：

- [ ] 代码已推送到 Git 仓库
- [ ] `package.json` 构建脚本正确
- [ ] `vercel.json` 配置文件存在
- [ ] `.vercelignore` 排除了不必要的文件
- [ ] 环境变量已配置
- [ ] 后端 API 可访问
- [ ] 后端 CORS 已配置

部署后检查：

- [ ] 网站可以访问
- [ ] API 请求成功
- [ ] 控制台无错误
- [ ] 页面功能正常

---

## 🔗 相关链接

- [Vercel 官方文档](https://vercel.com/docs)
- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html)
- [后端 API 文档](../backend/README.md)

---

## 💡 提示

- **首次部署** 可能需要 3-5 分钟
- **后续部署** 通常 1-2 分钟
- Vercel 提供 **免费额度**：100GB 带宽/月
- 支持 **自定义域名**（在项目设置中配置）

---

**部署成功后，您将获得：**
- 🌐 生产环境 URL: `https://your-project.vercel.app`
- 🔗 自定义域名（可选）
- 📊 实时分析和日志
- 🚀 全球 CDN 加速
