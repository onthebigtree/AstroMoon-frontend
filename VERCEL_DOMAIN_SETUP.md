# Vercel 双域名部署步骤

## 🎯 目标

- **www.astromoon.xyz** → 显示营销首页（landing.html）
- **app.astromoon.xyz** → 显示 Web 应用（index.html）

## 📋 部署步骤

### 1. 提交代码到 Git

```bash
git add .
git commit -m "feat: 添加营销首页和双域名配置"
git push origin dev
```

### 2. Vercel 项目配置

1. 登录 Vercel Dashboard
2. 进入你的项目（当前应该是 app.astromoon.xyz）
3. 点击 **Settings** → **Domains**

### 3. 添加 www 域名

在 Domains 页面：

1. 点击 **Add Domain**
2. 输入：`www.astromoon.xyz`
3. 点击 **Add**
4. Vercel 会提示你配置 DNS 记录

### 4. DNS 配置（如果需要）

根据 Vercel 的提示，在你的域名服务商（如 Cloudflare、阿里云等）添加以下记录：

```
类型: CNAME
名称: www
值: cname.vercel-dns.com
```

**注意**：如果 `www.astromoon.xyz` 已经指向其他地方，你需要先删除或更新现有记录。

### 5. 等待 DNS 传播

- DNS 更改可能需要几分钟到几小时生效
- 你可以使用以下命令检查：

```bash
dig www.astromoon.xyz
# 或
nslookup www.astromoon.xyz
```

### 6. 验证部署

部署完成后，测试两个域名：

#### 测试 www 域名

```bash
curl -I https://www.astromoon.xyz
```

**期望结果**：
- 状态码：`200 OK`（不应该是 301 重定向）
- 内容应该是营销首页

#### 测试 app 域名

```bash
curl -I https://app.astromoon.xyz
```

**期望结果**：
- 状态码：`200 OK`
- 内容应该是 Web 应用

### 7. 浏览器测试

1. **访问 https://www.astromoon.xyz**
   - ✅ 应该看到营销首页
   - ✅ 页面标题："Astro Moon - AI驱动的专业财富占星分析平台"
   - ✅ 有"立即开始分析"按钮

2. **访问 https://app.astromoon.xyz**
   - ✅ 应该看到完整的 Web 应用
   - ✅ 功能正常运行

3. **测试导航**
   - ✅ 点击营销首页的"立即开始分析"按钮
   - ✅ 应该跳转到 https://app.astromoon.xyz

## 🔍 Google Search Console 配置

部署成功后，在 Google Search Console 进行以下操作：

### 1. 添加 www 资源

1. 进入 [Google Search Console](https://search.google.com/search-console)
2. 点击 **添加资源**
3. 选择 **网址前缀**
4. 输入：`https://www.astromoon.xyz`
5. 验证所有权（使用 HTML 标签或 DNS 验证）

### 2. 提交 Sitemap

1. 在 Google Search Console 中
2. 选择 `www.astromoon.xyz` 资源
3. 进入 **索引** → **站点地图**
4. 提交：`https://www.astromoon.xyz/sitemap.xml`

### 3. 请求重新索引

1. 进入 **网址检查**
2. 输入：`https://www.astromoon.xyz/`
3. 点击 **请求编入索引**

## ⚠️ 故障排查

### 问题 1：www 仍然重定向到 app

**可能原因**：
- Vercel 的重定向配置没有生效
- DNS 还在传播中

**解决方案**：
1. 检查 vercel.json 配置是否正确
2. 在 Vercel Dashboard 检查部署日志
3. 等待 5-10 分钟后重试
4. 清除浏览器缓存

### 问题 2：landing.html 返回 404

**可能原因**：
- 文件没有正确构建到 dist 目录

**解决方案**：
1. 本地运行 `npm run build`
2. 检查 `dist/landing.html` 是否存在
3. 如果不存在，确保 `public/landing.html` 存在
4. 重新部署

### 问题 3：Google 仍然显示"自动重定向"错误

**解决方案**：
1. 等待 Google 重新爬取（可能需要几天）
2. 在 Google Search Console 请求重新索引
3. 使用 URL 检查工具验证页面可访问性

## 📊 SEO 优化检查清单

部署后进行以下检查：

- [ ] 访问 https://www.astromoon.xyz 返回 200 状态码
- [ ] robots.txt 可访问：https://www.astromoon.xyz/robots.txt
- [ ] sitemap.xml 可访问：https://www.astromoon.xyz/sitemap.xml
- [ ] 在 Google Search Console 验证域名
- [ ] 提交 sitemap 到 Google Search Console
- [ ] 使用 [PageSpeed Insights](https://pagespeed.web.dev/) 测试性能
- [ ] 使用 [Twitter Card Validator](https://cards-dev.twitter.com/validator) 测试社交卡片
- [ ] 检查移动端响应式设计

## 🚀 下一步优化建议

1. **性能优化**
   - 添加图片懒加载
   - 优化 CSS 和 JS 文件大小
   - 使用 CDN 加速静态资源

2. **内容优化**
   - 定期更新博客内容
   - 添加用户案例研究
   - 创建教程和指南页面

3. **营销优化**
   - A/B 测试不同的 CTA 按钮
   - 添加用户评价和推荐
   - 集成邮件订阅功能

4. **技术优化**
   - 添加结构化数据（更多 Schema.org 标记）
   - 实现服务端渲染（SSR）提升 SEO
   - 添加国际化支持

## 📝 监控和维护

### 定期检查（每周）

1. Google Search Console 错误报告
2. 页面加载速度
3. 404 错误
4. 移动端可用性

### 定期更新（每月）

1. sitemap.xml 的 lastmod 日期
2. 营销页面内容
3. 用户评价和案例

## 📞 获取帮助

如果遇到问题：

1. 查看 Vercel 部署日志
2. 检查 GitHub Issues
3. 联系 Vercel 支持
4. 参考 [Vercel 文档](https://vercel.com/docs)
