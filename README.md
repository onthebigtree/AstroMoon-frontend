# 🌙 AstroMoon Frontend

AstroMoon 占星命盘分析应用 - 前端项目

基于星盘计算的交易员财富分析系统，使用 AI 生成个性化的人生运势解读。

## ✨ 特性

- 🔮 **星盘计算** - 精确计算太阳、月亮、上升星座等星盘数据
- 📊 **可视化图表** - K线图展示人生运势走势
- 🤖 **AI 生成** - 智能生成个性化占星解读
- 🎨 **现代 UI** - 优雅的用户界面和交互体验
- ⚡ **高性能** - 基于 Vite 的快速构建和热更新

## 🛠️ 技术栈

- **框架：** React 19
- **语言：** TypeScript
- **构建工具：** Vite 7
- **图表库：** Recharts
- **图标库：** Lucide React
- **样式：** CSS-in-JS

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

> 💡 **提示：** 项目已统一使用 Railway 后端，无需配置后端 URL

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 4. 构建生产版本

```bash
npm run build
```

构建结果在 `dist/` 目录

## 🚀 部署

### Vercel 部署（推荐）

详细部署指南请查看：[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)

**快速部署步骤：**

1. 推送代码到 GitHub/GitLab/Bitbucket
2. 在 [Vercel Dashboard](https://vercel.com/dashboard) 导入项目
3. 点击 Deploy（无需配置后端环境变量）

**或使用 CLI：**

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
vercel --prod
```

### Netlify 部署

1. 连接 GitHub 仓库
2. 构建命令: `npm run build`
3. 发布目录: `dist`

---

## 🧪 API 使用

详细的 API 调用方式请参考：[CHART_API_USAGE.md](./CHART_API_USAGE.md)

**支持的 API：**
- ✅ 星盘计算 (`/api/chart/unified`) - Railway 后端
- ✅ AI 生成 (`/api/generate`) - Railway 后端
- 🔐 所有 API 均需 Firebase JWT 认证

## 📁 项目结构

```
AstroMoon-frontend/
├── components/              # React 组件
│   ├── ImportDataMode.tsx   # 数据导入表单
│   ├── LifeKLineChart.tsx   # K线图表组件
│   └── AnalysisResult.tsx   # 分析结果展示
├── services/                # API 服务
│   └── apiService.ts        # 后端 API 调用
├── utils/                   # 工具函数
│   └── retry.ts             # 重试机制
├── types.ts                 # TypeScript 类型定义
├── constants.ts             # 常量配置
├── App.tsx                  # 主应用组件
├── index.tsx                # 入口文件
├── index.html               # HTML 模板
├── vite.config.ts           # Vite 配置
├── vercel.json              # Vercel 部署配置
├── .vercelignore            # Vercel 忽略文件
└── test-api.html            # API 测试工具
```

## 🔧 环境变量

| 变量名 | 说明 | 备注 |
|--------|------|------|
| `VITE_TURNSTILE_SITE_KEY` | Cloudflare Turnstile 站点密钥 | 用于人机验证 |

> 💡 **提示：** 后端 API 地址已硬编码为 Railway，无需配置

> ⚠️ **注意：** Vite 环境变量必须以 `VITE_` 开头才能在客户端访问

---

## 🔗 后端 API

详细文档：[CHART_API_USAGE.md](./CHART_API_USAGE.md)

**后端地址：**
- Railway: `https://astromoon-backend-production.up.railway.app`

**主要接口：**

- `POST /api/chart/unified` - 星盘计算（需认证）
- `POST /api/generate` - AI 生成（需认证）

**API 示例：**

```javascript
import { calculateChart } from './services/apiService';

// 计算星盘（自动添加 Firebase JWT Token）
const chartData = await calculateChart({
  unixTimestamp: Math.floor(new Date('1990-06-15T14:30:00').getTime() / 1000),
  latitude: 23.1291,
  longitude: 113.2644,
  houseSystem: 'P'
});

console.log(chartData);
// { bodies: {...}, aspects: [...], houses: {...} }
```

---

## 📝 开发说明

### 构建优化

- ✅ 自动代码分割
- ✅ Tree shaking
- ✅ 资源压缩和混淆
- ✅ 带 hash 的文件名（缓存优化）

### 浏览器支持

- Chrome（最新 2 个版本）
- Firefox（最新 2 个版本）
- Safari（最新 2 个版本）
- Edge（最新 2 个版本）

### 性能优化

- 使用 React 19 的最新特性
- 懒加载和代码分割
- 图片和资源优化
- CDN 加速（Vercel）

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 License

MIT

---

## 📞 支持

如有问题，请查看：
- [部署文档](./VERCEL_DEPLOYMENT.md)
- [后端 API 文档](./backend/README.md)
- 提交 GitHub Issue
