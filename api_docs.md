# AstroMoon Backend - 前端接入文档

## 基本信息

**生产环境 Base URL**: `https://astromoon-backend-production.up.railway.app`
**端口**: 3782 (Railway 自动处理，无需指定)
**协议**: HTTPS

## 认证说明

### Firebase 认证（推荐）

后端支持 Firebase Authentication。在需要认证的请求中，需要在 Header 中携带 Firebase ID Token：

```javascript
headers: {
  'Authorization': 'Bearer YOUR_FIREBASE_ID_TOKEN',
  'Content-Type': 'application/json'
}
```

### 获取 Firebase ID Token

```javascript
import { getAuth } from 'firebase/auth';

const auth = getAuth();
const user = auth.currentUser;

if (user) {
  const idToken = await user.getIdToken();
  // 使用 idToken 调用 API
}
```

### 认证状态

- ✅ **需要认证**: `/api/profiles/*`, `/api/reports/*`, `/api/stats/*`
- ⚠️ **可选认证**: `/api/generate` (传入 token 可记录到用户)
- 🔓 **无需认证**: `/health`, `/docs`

---

## API 端点详情

### 1. 健康检查 & 公开端点

#### 1.1 健康检查

**GET** `/health`

检查服务运行状态。

**响应示例**:
```json
{
  "status": "ok",
  "message": "AI API 代理服务运行中",
  "activeRequests": 2,
  "totalRequests": 1523,
  "uptime": 86400.5,
  "memory": {
    "rss": 65536000,
    "heapTotal": 12345600,
    "heapUsed": 10234800
  }
}
```

#### 1.2 API 文档

**GET** `/docs`

返回 HTML 格式的 API 文档页面。

#### 1.3 AI 生成（流式）

**POST** `/api/generate`

生成 AI 占星解读，返回 Server-Sent Events (SSE) 流式响应。

**请求 Headers**:
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN (可选)
```

**请求 Body**:
```json
{
  "systemPrompt": "你是一位专业的占星师...",
  "userPrompt": "请分析这个星盘：太阳在白羊座，月亮在双鱼座..."
}
```

**响应格式**: `text/event-stream`

**响应示例**:
```
data: {"id":"chatcmpl-xxx","object":"chat.completion.chunk","created":1703001234,"model":"gemini-3-pro-high","choices":[{"delta":{"content":"根据"},"index":0}]}

data: {"id":"chatcmpl-xxx","object":"chat.completion.chunk","created":1703001234,"model":"gemini-3-pro-high","choices":[{"delta":{"content":"您的星盘..."},"index":0}]}

data: [DONE]
```

**前端示例 - Fetch API**:
```javascript
async function streamAIGenerate(systemPrompt, userPrompt) {
  const response = await fetch('https://astromoon-backend-production.up.railway.app/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}` // 可选
    },
    body: JSON.stringify({ systemPrompt, userPrompt })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ') && !line.includes('[DONE]')) {
        try {
          const json = JSON.parse(line.slice(6));
          const content = json.choices?.[0]?.delta?.content || '';
          if (content) {
            // 实时显示内容
            console.log(content);
          }
        } catch (e) {
          // 忽略解析错误
        }
      }
    }
  }
}
```

**前端示例 - EventSource** (不推荐，因为不支持 POST):
```javascript
// 注意：EventSource 只支持 GET 请求，这里需要使用 Fetch API
```

---

### 2. 出生档案管理 🔐

所有档案 API 需要 Firebase 认证。

#### 2.1 创建出生档案

**POST** `/api/profiles`

**请求 Headers**:
```
Content-Type: application/json
Authorization: Bearer YOUR_FIREBASE_ID_TOKEN
```

**请求 Body**:
```json
{
  "profileName": "张三",
  "gender": "male",
  "birthYear": 1995,
  "birthMonth": 3,
  "birthDay": 15,
  "birthHour": 14,
  "birthMinute": 30,
  "birthPlace": "北京市",
  "birthLongitude": 116.4074,
  "birthLatitude": 39.9042,
  "timezone": "Asia/Shanghai"
}
```

**必填字段**:
- `gender`: "male" | "female" | "other"
- `birthYear`, `birthMonth`, `birthDay`, `birthHour`, `birthMinute`

**可选字段**:
- `profileName`: 档案名称
- `birthPlace`: 出生地点
- `birthLongitude`, `birthLatitude`: 经纬度
- `timezone`: 时区

**响应示例**:
```json
{
  "success": true,
  "profile": {
    "id": "uuid-xxx",
    "user_id": "firebase_uid",
    "profile_name": "张三",
    "gender": "male",
    "birth_year": 1995,
    "birth_month": 3,
    "birth_day": 15,
    "birth_hour": 14,
    "birth_minute": 30,
    "birth_datetime": "1995-03-15T14:30:00.000Z",
    "birth_place": "北京市",
    "birth_longitude": 116.4074,
    "birth_latitude": 39.9042,
    "timezone": "Asia/Shanghai",
    "created_at": "2024-12-21T10:00:00.000Z",
    "updated_at": "2024-12-21T10:00:00.000Z"
  }
}
```

**错误响应**:
```json
{
  "error": "Missing required fields",
  "required": ["gender", "birthYear", "birthMonth", "birthDay", "birthHour", "birthMinute"]
}
```

#### 2.2 获取所有档案

**GET** `/api/profiles`

**请求 Headers**:
```
Authorization: Bearer YOUR_FIREBASE_ID_TOKEN
```

**响应示例**:
```json
{
  "success": true,
  "profiles": [
    {
      "id": "uuid-1",
      "profile_name": "张三",
      "gender": "male",
      "birth_datetime": "1995-03-15T14:30:00.000Z",
      "birth_place": "北京市",
      "created_at": "2024-12-21T10:00:00.000Z"
    },
    {
      "id": "uuid-2",
      "profile_name": "李四",
      "gender": "female",
      "birth_datetime": "1998-07-20T08:15:00.000Z",
      "birth_place": "上海市",
      "created_at": "2024-12-20T15:30:00.000Z"
    }
  ],
  "count": 2
}
```

#### 2.3 获取单个档案

**GET** `/api/profiles/:id`

**路径参数**:
- `id`: 档案 ID (UUID)

**请求 Headers**:
```
Authorization: Bearer YOUR_FIREBASE_ID_TOKEN
```

**响应示例**:
```json
{
  "success": true,
  "profile": {
    "id": "uuid-xxx",
    "user_id": "firebase_uid",
    "profile_name": "张三",
    "gender": "male",
    "birth_year": 1995,
    "birth_month": 3,
    "birth_day": 15,
    "birth_hour": 14,
    "birth_minute": 30,
    "birth_datetime": "1995-03-15T14:30:00.000Z",
    "birth_place": "北京市",
    "birth_longitude": 116.4074,
    "birth_latitude": 39.9042,
    "timezone": "Asia/Shanghai",
    "created_at": "2024-12-21T10:00:00.000Z",
    "updated_at": "2024-12-21T10:00:00.000Z"
  }
}
```

**错误响应** (404):
```json
{
  "error": "Profile not found"
}
```

#### 2.4 更新档案

**PUT** `/api/profiles/:id`

**请求 Headers**:
```
Content-Type: application/json
Authorization: Bearer YOUR_FIREBASE_ID_TOKEN
```

**请求 Body** (与创建相同):
```json
{
  "profileName": "张三（更新）",
  "gender": "male",
  "birthYear": 1995,
  "birthMonth": 3,
  "birthDay": 15,
  "birthHour": 14,
  "birthMinute": 35,
  "birthPlace": "北京市朝阳区",
  "birthLongitude": 116.4074,
  "birthLatitude": 39.9042,
  "timezone": "Asia/Shanghai"
}
```

**响应示例**:
```json
{
  "success": true,
  "profile": {
    "id": "uuid-xxx",
    "profile_name": "张三（更新）",
    "birth_minute": 35,
    "updated_at": "2024-12-21T11:00:00.000Z"
    // ... 其他字段
  }
}
```

#### 2.5 删除档案

**DELETE** `/api/profiles/:id`

**请求 Headers**:
```
Authorization: Bearer YOUR_FIREBASE_ID_TOKEN
```

**响应示例**:
```json
{
  "success": true,
  "message": "Profile deleted successfully"
}
```

---

### 3. AI 报告管理 🔐

#### 3.1 生成 AI 报告（流式）

**POST** `/api/reports/generate`

生成并保存 AI 占星报告到数据库。

**请求 Headers**:
```
Content-Type: application/json
Authorization: Bearer YOUR_FIREBASE_ID_TOKEN
```

**请求 Body**:
```json
{
  "systemPrompt": "你是一位专业的占星师，擅长解读出生星盘...",
  "userPrompt": "请分析这个人的性格特点和命运走向...",
  "chartId": "uuid-optional",
  "profileId": "uuid-optional",
  "reportTitle": "个人星盘详细解读"
}
```

**必填字段**:
- `systemPrompt`: 系统提示词
- `userPrompt`: 用户提示词

**可选字段**:
- `chartId`: 关联的星盘计算 ID
- `profileId`: 关联的出生档案 ID
- `reportTitle`: 报告标题（默认："占星报告"）

**响应格式**: `text/event-stream` (与 `/api/generate` 相同)

**特点**:
- 流式返回 AI 生成内容
- 自动保存完整报告到数据库
- 记录 token 使用量和生成时长
- 更新用户活动记录

#### 3.2 获取所有报告

**GET** `/api/reports`

**查询参数**:
- `limit`: 每页数量（默认：20）
- `offset`: 偏移量（默认：0）

**请求示例**:
```
GET /api/reports?limit=10&offset=0
```

**请求 Headers**:
```
Authorization: Bearer YOUR_FIREBASE_ID_TOKEN
```

**响应示例**:
```json
{
  "success": true,
  "reports": [
    {
      "id": "uuid-1",
      "report_title": "个人星盘详细解读",
      "report_type": "astrology",
      "model_name": "gemini-3-pro-high",
      "generation_duration_ms": 5230,
      "token_count": 2548,
      "generated_at": "2024-12-21T10:30:00.000Z",
      "export_count": 3,
      "last_exported_at": "2024-12-21T15:00:00.000Z",
      "profile_name": "张三",
      "birth_datetime": "1995-03-15T14:30:00.000Z",
      "sun_sign": "白羊座",
      "moon_sign": "双鱼座",
      "ascendant_sign": "天秤座"
    }
  ],
  "count": 1
}
```

#### 3.3 获取单个报告

**GET** `/api/reports/:id`

**请求 Headers**:
```
Authorization: Bearer YOUR_FIREBASE_ID_TOKEN
```

**响应示例**:
```json
{
  "success": true,
  "report": {
    "id": "uuid-xxx",
    "user_id": "firebase_uid",
    "chart_id": "uuid-chart",
    "profile_id": "uuid-profile",
    "report_title": "个人星盘详细解读",
    "report_type": "astrology",
    "model_name": "gemini-3-pro-high",
    "system_prompt": "你是专业占星师...",
    "user_prompt": "请分析...",
    "full_report": {
      "content": "完整的 AI 生成内容..."
    },
    "generation_duration_ms": 5230,
    "token_count": 2548,
    "generated_at": "2024-12-21T10:30:00.000Z",
    "viewed_at": "2024-12-21T10:35:00.000Z",
    "export_count": 0,
    "last_exported_at": null,
    "profile_name": "张三",
    "sun_sign": "白羊座",
    "moon_sign": "双鱼座"
  }
}
```

**副作用**:
- 自动更新 `viewed_at` 字段为当前时间

#### 3.4 标记报告为已导出

**POST** `/api/reports/:id/export`

记录报告导出次数（用于统计）。

**请求 Headers**:
```
Authorization: Bearer YOUR_FIREBASE_ID_TOKEN
```

**响应示例**:
```json
{
  "success": true,
  "exportCount": 4
}
```

#### 3.5 删除报告

**DELETE** `/api/reports/:id`

**请求 Headers**:
```
Authorization: Bearer YOUR_FIREBASE_ID_TOKEN
```

**响应示例**:
```json
{
  "success": true,
  "message": "Report deleted successfully"
}
```

---

### 4. 统计数据 🔐

#### 4.1 API 使用统计

**GET** `/api/stats/usage`

查看用户的 API 使用情况。

**查询参数**:
- `days`: 查询最近 N 天（默认：30）

**请求示例**:
```
GET /api/stats/usage?days=7
```

**请求 Headers**:
```
Authorization: Bearer YOUR_FIREBASE_ID_TOKEN
```

**响应示例**:
```json
{
  "success": true,
  "summary": {
    "totalRequests": 125,
    "totalSuccess": 118,
    "totalErrors": 7,
    "totalTokens": 45230
  },
  "details": [
    {
      "endpoint": "/api/reports/generate",
      "date": "2024-12-21",
      "request_count": 15,
      "success_count": 14,
      "error_count": 1,
      "total_tokens_used": 5234,
      "total_duration_ms": 78450,
      "avg_duration_ms": 5230
    },
    {
      "endpoint": "/api/reports/generate",
      "date": "2024-12-20",
      "request_count": 20,
      "success_count": 20,
      "error_count": 0,
      "total_tokens_used": 8150,
      "total_duration_ms": 104600,
      "avg_duration_ms": 5230
    }
  ]
}
```

#### 4.2 用户活动历史

**GET** `/api/stats/activity`

查看用户的操作历史记录。

**查询参数**:
- `limit`: 返回条数（默认：50）
- `type`: 活动类型筛选（可选）

**活动类型**:
- `profile_create`: 创建档案
- `report_generation`: 生成报告
- `report_export`: 导出报告

**请求示例**:
```
GET /api/stats/activity?limit=20&type=report_generation
```

**请求 Headers**:
```
Authorization: Bearer YOUR_FIREBASE_ID_TOKEN
```

**响应示例**:
```json
{
  "success": true,
  "activities": [
    {
      "id": "uuid-1",
      "activity_type": "report_generation",
      "resource_type": "report",
      "resource_id": "uuid-report-1",
      "metadata": {
        "chartId": "uuid-chart",
        "tokenCount": 2548,
        "duration": 5230
      },
      "created_at": "2024-12-21T10:30:00.000Z"
    },
    {
      "id": "uuid-2",
      "activity_type": "profile_create",
      "resource_type": "profile",
      "resource_id": "uuid-profile-1",
      "metadata": {
        "profileName": "张三"
      },
      "created_at": "2024-12-21T09:15:00.000Z"
    }
  ],
  "count": 2
}
```

#### 4.3 总体统计

**GET** `/api/stats/summary`

获取用户的所有统计数据摘要。

**请求 Headers**:
```
Authorization: Bearer YOUR_FIREBASE_ID_TOKEN
```

**响应示例**:
```json
{
  "success": true,
  "summary": {
    "totalProfiles": 5,
    "totalReports": 23,
    "totalExports": 12,
    "totalTokensUsed": 45230,
    "recentActivities": [
      {
        "activity_type": "report_generation",
        "count": 15
      },
      {
        "activity_type": "profile_create",
        "count": 3
      },
      {
        "activity_type": "report_export",
        "count": 8
      }
    ],
    "monthlyUsage": {
      "requests": 125,
      "tokens": 45230
    }
  }
}
```

---

## 错误处理

### 标准错误响应

所有 API 在出错时会返回统一格式的错误响应：

```json
{
  "error": "错误描述",
  "message": "详细错误信息（可选）",
  "details": "额外详情（可选）"
}
```

### HTTP 状态码

- `200` - 成功
- `201` - 创建成功
- `400` - 请求参数错误
- `401` - 未授权（缺少或无效的 token）
- `404` - 资源不存在
- `500` - 服务器内部错误

### 示例

```json
// 401 未授权
{
  "error": "Unauthorized",
  "message": "Invalid or missing Firebase token"
}

// 400 参数错误
{
  "error": "Missing required fields",
  "required": ["gender", "birthYear", "birthMonth"]
}

// 404 资源不存在
{
  "error": "Profile not found"
}

// 500 服务器错误
{
  "error": "Failed to create profile",
  "message": "Database connection error"
}
```

---

## 完整前端示例

### React + TypeScript 示例

#### 1. API 客户端封装

```typescript
// api/client.ts
import { getAuth } from 'firebase/auth';

const BASE_URL = 'https://astromoon-backend-production.up.railway.app';

async function getAuthToken(): Promise<string | null> {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return null;
  return await user.getIdToken();
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || error.message || 'API request failed');
  }

  return response.json();
}
```

#### 2. 创建档案

```typescript
// api/profiles.ts
import { apiRequest } from './client';

export interface CreateProfileData {
  profileName?: string;
  gender: 'male' | 'female' | 'other';
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
  birthMinute: number;
  birthPlace?: string;
  birthLongitude?: number;
  birthLatitude?: number;
  timezone?: string;
}

export interface Profile extends CreateProfileData {
  id: string;
  user_id: string;
  birth_datetime: string;
  created_at: string;
  updated_at: string;
}

export async function createProfile(data: CreateProfileData): Promise<Profile> {
  const response = await apiRequest<{ success: boolean; profile: Profile }>(
    '/api/profiles',
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
  return response.profile;
}

export async function getProfiles(): Promise<Profile[]> {
  const response = await apiRequest<{ success: boolean; profiles: Profile[] }>(
    '/api/profiles'
  );
  return response.profiles;
}

export async function getProfile(id: string): Promise<Profile> {
  const response = await apiRequest<{ success: boolean; profile: Profile }>(
    `/api/profiles/${id}`
  );
  return response.profile;
}

export async function updateProfile(
  id: string,
  data: CreateProfileData
): Promise<Profile> {
  const response = await apiRequest<{ success: boolean; profile: Profile }>(
    `/api/profiles/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );
  return response.profile;
}

export async function deleteProfile(id: string): Promise<void> {
  await apiRequest(`/api/profiles/${id}`, {
    method: 'DELETE',
  });
}
```

#### 3. 流式 AI 生成

```typescript
// api/generate.ts
import { getAuth } from 'firebase/auth';

const BASE_URL = 'https://astromoon-backend-production.up.railway.app';

export async function* streamAIGenerate(
  systemPrompt: string,
  userPrompt: string,
  onToken?: (token: string) => void
): AsyncGenerator<string, void, unknown> {
  const auth = getAuth();
  const user = auth.currentUser;
  const token = user ? await user.getIdToken() : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}/api/generate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ systemPrompt, userPrompt }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate AI response');
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ') && !line.includes('[DONE]')) {
          try {
            const json = JSON.parse(line.slice(6));
            const content = json.choices?.[0]?.delta?.content || '';
            if (content) {
              onToken?.(content);
              yield content;
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
```

#### 4. React 组件使用示例

```typescript
// components/AIGenerateDialog.tsx
import { useState } from 'react';
import { streamAIGenerate } from '../api/generate';

export function AIGenerateDialog() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setResult('');

    try {
      const systemPrompt = '你是一位专业的占星师...';

      for await (const token of streamAIGenerate(systemPrompt, prompt)) {
        setResult(prev => prev + token);
      }
    } catch (error) {
      console.error('生成失败:', error);
      alert('生成失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="输入你的问题..."
        disabled={loading}
      />

      <button onClick={handleGenerate} disabled={loading || !prompt}>
        {loading ? '生成中...' : '生成'}
      </button>

      {result && (
        <div className="result">
          <h3>AI 解读结果：</h3>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
}
```

---

## CORS 配置

后端已启用 CORS，允许所有来源访问：

```javascript
app.use(cors());
```

前端可以直接跨域请求，无需额外配置。

---

## 超时配置

- **流式响应** (`/api/generate`, `/api/reports/generate`): 5 分钟
- **普通请求**: 30 秒

建议前端也设置相应的超时处理。

---

## 最佳实践

### 1. Token 刷新

Firebase ID Token 默认 1 小时过期，建议在请求前刷新：

```typescript
async function getAuthToken(): Promise<string | null> {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return null;

  // 强制刷新 token
  return await user.getIdToken(true);
}
```

### 2. 错误处理

```typescript
try {
  const profiles = await getProfiles();
} catch (error) {
  if (error.message.includes('Unauthorized')) {
    // 重新登录
    redirectToLogin();
  } else {
    // 显示错误信息
    showError(error.message);
  }
}
```

### 3. 流式响应中断处理

```typescript
const abortController = new AbortController();

// 使用 signal 支持中断
fetch(url, { signal: abortController.signal });

// 用户取消时
abortController.abort();
```

### 4. 加载状态

```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

async function fetchData() {
  setLoading(true);
  setError(null);

  try {
    const data = await apiRequest('/api/profiles');
    // 处理数据
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}
```

---

## 调试建议

### 1. 查看网络请求

浏览器开发者工具 → Network 标签页

### 2. 测试健康检查

```bash
curl https://astromoon-backend-production.up.railway.app/health
```

### 3. 测试认证

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://astromoon-backend-production.up.railway.app/api/profiles
```

### 4. 查看 Railway 日志

Railway Dashboard → 你的项目 → Deployments → View Logs

---

## 联系与支持

如有问题，请：

1. 检查本文档
2. 查看 Railway 部署日志
3. 检查浏览器控制台错误
4. 提交 GitHub Issue

---

**文档版本**: 1.0
**最后更新**: 2024-12-21
**生产环境**: https://astromoon-backend-production.up.railway.app
