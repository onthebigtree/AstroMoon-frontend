# Astro Moon 双域名部署指南

本指南说明如何在 Vercel 上部署 `www.astromoon.xyz` (营销首页) 和 `app.astromoon.xyz` (应用) 两个域名。

## 架构说明

- **www.astromoon.xyz** - 营销首页（SEO优化，介绍产品）
- **app.astromoon.xyz** - Web 应用（完整的占星分析功能）

## 部署方案

### 方案一：使用单个 Vercel 项目（推荐）

这种方案最简单，只需一个 Vercel 项目，通过配置不同的域名规则来路由到不同的页面。

#### 步骤：

1. **保持当前的 Vercel 项目配置**
   - 当前项目已部署在 `app.astromoon.xyz`

2. **添加 www 域名到同一个 Vercel 项目**
   - 在 Vercel 项目设置中，添加 `www.astromoon.xyz` 域名
   - Vercel Dashboard → Settings → Domains → Add Domain

3. **更新 vercel.json 配置文件**

   使用以下配置来区分两个域名的行为：

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/((?!api).*)",
      "destination": "/index.html",
      "has": [
        {
          "type": "host",
          "value": "app.astromoon.xyz"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/",
      "destination": "/landing.html",
      "has": [
        {
          "type": "host",
          "value": "www.astromoon.xyz"
        }
      ]
    }
  ],
  "headers": [
    {
      "source": "/index.html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    },
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

4. **确保 landing.html 会被部署**
   - `landing.html` 文件应该放在项目根目录或 `public` 目录中
   - Vite 会自动将其复制到 `dist` 目录

### 方案二：创建两个独立的 Vercel 项目

如果需要完全独立的部署和配置：

1. **当前项目 (app.astromoon.xyz)**
   - 保持不变

2. **新建 Landing Page 项目**
   - 创建一个新的 Git 仓库，只包含 `landing.html`
   - 在 Vercel 创建新项目并部署
   - 配置域名为 `www.astromoon.xyz`

## 推荐配置

### 使用 public 目录

为了确保 `landing.html` 能被正确部署，建议将其移动到 `public` 目录：

```bash
mkdir -p public
mv landing.html public/
```

然后 Vite 构建时会自动将其复制到 `dist` 目录。

### 更新 vercel.json (简化版)

如果使用 public 目录，可以使用更简单的配置：

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "cleanUrls": true,
  "trailingSlash": false
}
```

然后在 Vercel Dashboard 中配置域名重定向：
- `www.astromoon.xyz` → `/landing.html`
- `app.astromoon.xyz` → `/index.html`

## SEO 优化检查清单

✅ 已完成的优化：

- [x] 为 landing page 添加完整的 meta 标签
- [x] 设置正确的 canonical URL
- [x] 添加 Open Graph 和 Twitter Card 标签
- [x] 添加 Structured Data (Schema.org)
- [x] 优化页面标题和描述
- [x] 添加 Google Analytics

🔲 部署后需要做的：

- [ ] 在 Google Search Console 验证 www.astromoon.xyz
- [ ] 提交 sitemap.xml
- [ ] 检查页面加载速度
- [ ] 验证 robots.txt 配置
- [ ] 测试移动端响应式

## 域名配置

### DNS 设置

确保 DNS 记录正确：

```
A     www    76.76.21.21
CNAME app    cname.vercel-dns.com
```

### Vercel 域名设置

1. 进入 Vercel Dashboard
2. 选择项目
3. Settings → Domains
4. 添加 `www.astromoon.xyz` 和 `app.astromoon.xyz`

## 测试步骤

部署后测试：

1. **访问 www.astromoon.xyz**
   - 应该显示营销首页（landing.html）
   - 检查 SEO meta 标签
   - 测试"开始分析"按钮跳转到 app.astromoon.xyz

2. **访问 app.astromoon.xyz**
   - 应该显示完整应用（index.html）
   - 功能正常运行

3. **SEO 测试**
   ```bash
   curl -I https://www.astromoon.xyz
   # 应该返回 200 状态码，不是 301 重定向
   ```

## 故障排查

### 问题：www 仍然重定向到 app

**解决方案：**
1. 检查 Vercel 项目的域名设置
2. 删除旧的重定向规则
3. 等待 DNS 传播（可能需要几分钟）

### 问题：landing.html 404

**解决方案：**
1. 确保 landing.html 在 dist 目录中
2. 检查 vite.config.ts 的 publicDir 设置
3. 重新构建和部署

## 维护建议

1. **定期更新内容** - 保持营销页面内容新鲜
2. **监控 Google Search Console** - 检查索引状态和错误
3. **A/B 测试** - 测试不同的 CTA 按钮和文案
4. **性能监控** - 使用 Lighthouse 检查性能分数
