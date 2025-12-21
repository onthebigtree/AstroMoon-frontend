# 后端迁移指南

## 概览

本项目已接入新的后端服务（Railway），同时保持对旧后端（腾讯云）的兼容性。

**新后端地址**: `https://astromoon-backend-production.up.railway.app`

## 新功能

### 1. 档案管理（Profile Management）
- ✅ 创建出生档案 `POST /api/profiles`
- ✅ 获取档案列表 `GET /api/profiles`
- ✅ 获取单个档案 `GET /api/profiles/:id`
- ✅ 更新档案 `PUT /api/profiles/:id`
- ✅ 删除档案 `DELETE /api/profiles/:id`

### 2. AI 报告管理（Report Management）
- ✅ 生成并保存报告 `POST /api/reports/generate` (流式)
- ✅ 获取报告列表 `GET /api/reports`
- ✅ 获取单个报告 `GET /api/reports/:id`
- ✅ 标记报告导出 `POST /api/reports/:id/export`
- ✅ 删除报告 `DELETE /api/reports/:id`

### 3. 统计数据（Statistics）
- ✅ API 使用统计 `GET /api/stats/usage`
- ✅ 用户活动历史 `GET /api/stats/activity`
- ✅ 总体统计摘要 `GET /api/stats/summary`

### 4. AI 生成（已更新）
- ✅ 支持新后端 `/api/generate` (可选 Firebase 认证)
- ✅ 保持旧后端兼容性

## 认证机制

### 新后端（Firebase Authentication）
新后端使用 Firebase ID Token 进行认证：

```typescript
import { getAuth } from 'firebase/auth';

const auth = getAuth();
const user = auth.currentUser;
const token = await user.getIdToken();

// 在请求头中添加
headers['Authorization'] = `Bearer ${token}`;
```

**认证要求**:
- 🔐 **必需认证**: `/api/profiles/*`, `/api/reports/*`, `/api/stats/*`
- ⚠️ **可选认证**: `/api/generate` (传入 token 可关联到用户)
- 🔓 **无需认证**: `/health`, `/docs`

### 旧后端
旧后端不需要认证，继续使用原有方式。

## 使用方式

### 环境变量配置

在 `.env` 文件中设置：

```bash
# 使用新后端（默认）
VITE_USE_NEW_BACKEND=true

# 使用旧后端
# VITE_USE_NEW_BACKEND=false
# VITE_BACKEND_URL=http://43.134.98.27:3782
```

### 前端代码示例

#### 1. 导入 API 方法

```typescript
import {
  // 档案管理
  createProfile,
  getProfiles,
  getProfile,
  updateProfile,
  deleteProfile,

  // 报告管理
  streamReportGenerate,
  getReports,
  getReport,
  markReportExported,
  deleteReport,

  // 统计数据
  getUsageStats,
  getActivity,
  getSummaryStats,
} from './services/api';
```

#### 2. 创建档案

```typescript
const profile = await createProfile({
  profileName: '张三',
  gender: 'male',
  birthYear: 1995,
  birthMonth: 6,
  birthDay: 15,
  birthHour: 14,
  birthMinute: 30,
  birthPlace: '北京市',
  birthLongitude: 116.4074,
  birthLatitude: 39.9042,
  timezone: 'Asia/Shanghai'
});

console.log('档案 ID:', profile.id);
```

#### 3. 生成 AI 报告（流式）

```typescript
const request = {
  systemPrompt: '你是一位专业的占星师...',
  userPrompt: '请分析这个星盘...',
  profileId: 'uuid-xxx', // 可选
  reportTitle: '个人星盘详细解读' // 可选
};

let fullContent = '';

for await (const token of streamReportGenerate(request)) {
  fullContent += token;
  // 实时显示内容
  console.log(token);
}

console.log('完整报告:', fullContent);
```

#### 4. 获取统计数据

```typescript
// 获取最近 7 天的使用统计
const stats = await getUsageStats(7);
console.log('总请求数:', stats.summary.totalRequests);
console.log('总 Token 数:', stats.summary.totalTokens);

// 获取活动历史
const activity = await getActivity(50, 'report_generation');
console.log('生成报告次数:', activity.count);

// 获取总体统计
const summary = await getSummaryStats();
console.log('总档案数:', summary.summary.totalProfiles);
console.log('总报告数:', summary.summary.totalReports);
```

## 测试

### 档案管理 API 测试
在浏览器中打开：
```
services/api/test-profiles.html
```

步骤：
1. 点击"使用 Firebase 登录"
2. 使用 Google 账号登录
3. 点击各个测试按钮测试 CRUD 操作

### AI 生成测试
使用现有的前端界面测试 AI 生成功能，检查控制台日志确认使用的是新后端。

## 文件结构

```
services/
├── api/
│   ├── config.ts           # API 配置和通用请求封装
│   ├── types.ts            # TypeScript 类型定义
│   ├── profiles.ts         # 档案管理 API
│   ├── reports.ts          # 报告管理 API
│   ├── stats.ts            # 统计数据 API
│   ├── index.ts            # 统一导出
│   └── test-profiles.html  # 档案 API 测试页面
└── apiService.ts           # 旧的 API 服务（已更新支持新后端）
```

## 迁移进度

- [x] 第一阶段：基础设施
  - [x] 创建 API 客户端配置
  - [x] 定义 TypeScript 类型
  - [x] 实现所有 API 封装

- [x] 第二阶段：更新现有服务
  - [x] 更新 `generateWithAPI` 支持新后端
  - [x] 添加 Firebase 认证支持
  - [x] 保持向后兼容性

- [ ] 第三阶段：UI 集成（待完成）
  - [ ] 创建档案管理界面
  - [ ] 创建报告历史界面
  - [ ] 创建统计数据面板
  - [ ] 更新导出功能调用 `markReportExported`

## API 文档

详细的 API 文档请参考：[api_docs.md](./api_docs.md)

## 故障排查

### 1. 401 Unauthorized 错误
- 确保已登录 Firebase
- 检查 Token 是否过期（自动刷新）

### 2. CORS 错误
- 新后端已启用 CORS，不应该有跨域问题
- 如果仍有问题，检查浏览器控制台的详细错误信息

### 3. 网络请求失败
- 检查后端服务状态：https://astromoon-backend-production.up.railway.app/health
- 查看 Railway 部署日志

### 4. 切换回旧后端
在 `.env` 中设置：
```bash
VITE_USE_NEW_BACKEND=false
VITE_BACKEND_URL=http://43.134.98.27:3782
```

## 后续计划

1. **UI 集成**: 创建档案管理、报告历史等界面
2. **离线支持**: 使用 IndexedDB 缓存档案和报告
3. **批量操作**: 支持批量导入/导出档案
4. **分享功能**: 生成可分享的报告链接
5. **性能优化**: 实现报告预加载和分页

## 贡献

欢迎提交 Issue 和 Pull Request！

---

**最后更新**: 2024-12-21
**维护者**: AstroMoon Team
