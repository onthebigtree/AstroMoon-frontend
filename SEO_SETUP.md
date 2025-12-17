# SEO 和分析配置指南

## 📊 Google Analytics 设置

### 1. 获取 GA 追踪 ID

1. 访问 [Google Analytics](https://analytics.google.com/)
2. 创建新的 Property（资源）
3. 选择 "Web" 平台
4. 获取您的测量 ID（格式: `G-XXXXXXXXXX`）

### 2. 配置追踪代码

编辑 `index.html` 文件，将以下两处的 `G-XXXXXXXXXX` 替换为您的实际 GA ID：

```html
<!-- Line 37 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>

<!-- Line 42 -->
gtag('config', 'G-XXXXXXXXXX');
```

---

## 🔍 Google Search Console 设置

### 1. 添加网站资源

1. 访问 [Google Search Console](https://search.google.com/search-console/)
2. 点击"添加资源"
3. 选择"网址前缀"方式
4. 输入您的网站 URL: `https://astromoon.vercel.app`

### 2. 验证网站所有权

**方法 1: HTML 标签验证（推荐）**

在 `index.html` 的 `<head>` 中添加 GSC 提供的验证标签：

```html
<!-- 在 Line 13 后添加 -->
<meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" />
```

**方法 2: HTML 文件验证**

将 GSC 提供的 HTML 验证文件放入 `public/` 目录。

### 3. 提交 Sitemap

验证成功后，在 GSC 中提交 sitemap：

```
https://astromoon.vercel.app/sitemap.xml
```

---

## 📄 已创建的 SEO 文件

### ✅ `/public/sitemap.xml`
- 包含网站所有页面的 URL
- 帮助搜索引擎更好地抓取和索引
- 需要在部署后更新 `<lastmod>` 日期

### ✅ `/public/robots.txt`
- 指导搜索引擎爬虫的抓取规则
- 包含 sitemap 位置
- 允许所有爬虫访问（除了 API 路由）

### ✅ `/public/favicon.svg`
- 网站图标（月亮渐变图标）
- 支持现代浏览器
- 自动适配深色/浅色模式

---

## 🏷️ SEO Meta 标签（已添加）

index.html 中已包含以下 SEO 优化：

- ✅ **Title Tag**: 优化的页面标题，包含关键词
- ✅ **Meta Description**: 吸引点击的页面描述
- ✅ **Meta Keywords**: 相关关键词列表
- ✅ **Open Graph Tags**: Facebook/LinkedIn 分享优化
- ✅ **Twitter Card**: Twitter 分享卡片
- ✅ **Canonical URL**: 避免重复内容问题

---

## 🚀 部署后检查清单

部署到 Vercel 后，请完成以下步骤：

### 1. 验证 Google Analytics
- [ ] 替换 GA ID
- [ ] 访问网站，检查 GA 实时报告是否显示访问
- [ ] 等待 24-48 小时查看详细数据

### 2. 验证 Google Search Console
- [ ] 添加网站资源
- [ ] 完成所有权验证
- [ ] 提交 sitemap.xml
- [ ] 检查抓取错误（通常 1-2 天后有数据）

### 3. 验证 SEO 文件
- [ ] 访问 `https://astromoon.vercel.app/robots.txt`
- [ ] 访问 `https://astromoon.vercel.app/sitemap.xml`
- [ ] 检查 favicon 是否正确显示

### 4. 社交媒体分享测试
- [ ] [Facebook 分享调试工具](https://developers.facebook.com/tools/debug/)
- [ ] [Twitter Card 验证器](https://cards-dev.twitter.com/validator)
- [ ] 检查预览图片和描述是否正确

---

## 📈 监控和维护

### Google Analytics 关键指标
- 页面浏览量（Page Views）
- 独立访客（Unique Visitors）
- 跳出率（Bounce Rate）
- 平均会话时长（Avg. Session Duration）
- 转化事件（如：完成占星分析）

### Google Search Console 关键指标
- 展示次数（Impressions）
- 点击次数（Clicks）
- 点击率（CTR）
- 平均排名（Avg. Position）
- 覆盖范围问题（Coverage Issues）

### 定期维护
- **每月**: 检查 GSC 抓取错误并修复
- **每季度**: 更新 sitemap.xml 的 lastmod 日期
- **每半年**: 优化 meta 描述和关键词

---

## 💡 进阶优化建议

1. **结构化数据 (Schema.org)**
   - 添加 JSON-LD 结构化数据
   - 标记服务类型、评价、价格等信息

2. **性能优化**
   - 使用 Lighthouse 检查性能分数
   - 优化图片加载和代码分割
   - 启用 Vercel Analytics

3. **内容策略**
   - 添加博客/资讯页面
   - 定期更新占星相关内容
   - 构建内部链接结构

4. **外部推广**
   - 社交媒体分享
   - 占星论坛外链
   - 合作伙伴链接交换

---

## 📞 需要帮助？

如有 SEO 或分析配置问题，请参考：
- [Google Analytics 帮助中心](https://support.google.com/analytics/)
- [Google Search Console 帮助](https://support.google.com/webmasters/)
- [Vercel Analytics 文档](https://vercel.com/docs/analytics)
