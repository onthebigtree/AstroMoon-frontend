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
- ⚠️ **每日生成限制：默认5次/天**

**限流错误响应** (HTTP 429):
```json
{
  "error": "Daily generation limit reached",
  "message": "您今日已达到生成上限（5次），请明天再试",
  "limit": 5,
  "used": 5,
  "remaining": 0,
  "resetAt": "2024-12-22T00:00:00.000Z"
}
```

#### 3.2 查询生成限制状态

**GET** `/api/reports/limit`

查询当前用户今日的生成次数和剩余配额。

**请求 Headers**:
```
Authorization: Bearer YOUR_FIREBASE_ID_TOKEN
```

**响应示例**:
```json
{
  "success": true,
  "allowed": true,
  "remaining": 3,
  "used": 2,
  "limit": 5,
  "resetAt": "2024-12-22T00:00:00.000Z"
}
```

**字段说明**:
- `allowed`: 是否允许继续生成（`true`/`false`）
- `remaining`: 今日剩余生成次数
- `used`: 今日已使用次数
- `limit`: 每日生成上限
- `resetAt`: 限制重置时间（明天00:00）

**TypeScript 示例**:
```typescript
interface GenerationLimit {
  success: boolean;
  allowed: boolean;
  remaining: number;
  used: number;
  limit: number;
  resetAt: string;
}

async function checkGenerationLimit(): Promise<GenerationLimit> {
  const response = await fetch(
    'https://astromoon-backend-production.up.railway.app/api/reports/limit',
    {
      headers: {
        'Authorization': `Bearer ${idToken}`
      }
    }
  );

  return response.json();
}

// 使用示例
const limitStatus = await checkGenerationLimit();

if (!limitStatus.allowed) {
  alert(`今日生成次数已用完，剩余 ${limitStatus.remaining} 次`);
  // 显示明天重置时间
  const resetDate = new Date(limitStatus.resetAt);
  console.log('将在', resetDate.toLocaleString(), '重置');
} else {
  console.log(`可以继续生成，剩余 ${limitStatus.remaining} 次`);
  // 继续生成报告...
}
```

**建议用法**:
1. 在用户点击"生成"按钮前先调用此接口
2. 根据 `remaining` 显示剩余次数提示
3. 当 `allowed: false` 时禁用生成按钮
4. 显示 `resetAt` 让用户知道何时可以再次使用

#### 3.3 获取所有报告

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

#### 3.4 获取单个报告

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

#### 3.5 标记报告为已导出

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

#### 3.6 删除报告

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

## 5. Telegram 频道成员管理 🔐

### 概述

本模块提供 Telegram 频道成员验证和账号绑定功能，用于：
- 验证用户是否在指定的 Telegram 频道内
- 将用户的 Telegram 账号绑定到系统账户
- 实现基于 Telegram 频道订阅的会员验证

**频道信息**:
- 频道名称: 月亮牌手说
- 频道 Username: @themoon_dojo
- 频道 ID: -1003243468587

---

### 5.1 检查用户是否在频道内 ⭐⭐⭐

**GET** `/api/telegram/check/:tg_user_id`

检查指定 Telegram 用户 ID 是否在频道内（支持所有成员类型：创建者、管理员、普通成员）。

**URL 参数**:
- `tg_user_id`: Telegram 用户 ID（数字）

**请求 Headers**:
```
Authorization: Bearer YOUR_FIREBASE_ID_TOKEN
```

**响应示例 - 用户在频道内**:
```json
{
  "success": true,
  "isMember": true,
  "status": "member",
  "user": {
    "tg_user_id": 123456789,
    "username": "john_doe",
    "first_name": "John",
    "last_name": "Doe"
  },
  "lastChecked": "2024-12-22T00:00:00.000Z",
  "cachedUntil": "2024-12-22T00:00:30.000Z",
  "source": "database"
}
```

**响应示例 - 用户不在频道内**:
```json
{
  "success": true,
  "isMember": false,
  "status": "left",
  "user": null,
  "source": "realtime"
}
```

**字段说明**:
- `isMember`: 是否是频道成员（`true`/`false`）
- `status`: 成员状态
  - `creator` - 频道创建者
  - `administrator` - 管理员
  - `member` - 普通成员
  - `left` - 已离开
  - `kicked` - 被踢出
  - `not_found` - 用户不存在
- `source`: 数据来源（`database` 缓存 / `realtime` 实时查询）
- `cachedUntil`: 缓存过期时间（30秒缓存）

**TypeScript 示例**:
```typescript
interface TelegramMemberCheck {
  success: boolean;
  isMember: boolean;
  status: string;
  user: {
    tg_user_id: number;
    username: string;
    first_name: string;
    last_name: string;
  } | null;
  lastChecked: string;
  cachedUntil: string;
  source: 'database' | 'realtime';
}

async function checkTelegramMembership(
  tgUserId: number
): Promise<TelegramMemberCheck> {
  const response = await fetch(
    `https://astromoon-backend-production.up.railway.app/api/telegram/check/${tgUserId}`,
    {
      headers: {
        'Authorization': `Bearer ${idToken}`
      }
    }
  );

  if (!response.ok) {
    throw new Error('Failed to check membership');
  }

  return response.json();
}

// 使用示例
const result = await checkTelegramMembership(123456789);

if (result.isMember) {
  console.log('✅ 用户在频道内，状态:', result.status);
  // 允许访问功能
} else {
  console.log('❌ 用户不在频道内');
  // 提示用户加入频道
  alert('请先加入我们的 Telegram 频道: https://t.me/themoon_dojo');
}
```

**注意事项**:
- ⚡ 带30秒缓存，减少 API 调用
- 🔄 缓存过期自动刷新
- 📊 可检查任何用户（管理员或普通成员）

---

### 5.2 绑定 Telegram 账号 ⭐

**POST** `/api/telegram/bind`

将 Telegram 账号绑定到当前登录用户。

**请求 Headers**:
```
Authorization: Bearer YOUR_FIREBASE_ID_TOKEN
Content-Type: application/json
```

**请求 Body**:
```json
{
  "tg_user_id": 123456789,
  "tg_username": "john_doe"
}
```

**必填字段**:
- `tg_user_id`: Telegram 用户 ID（必填）

**可选字段**:
- `tg_username`: Telegram 用户名（可选，用于显示）

**响应示例 - 绑定成功**:
```json
{
  "success": true,
  "message": "Telegram 账号绑定成功",
  "user": {
    "tg_user_id": 123456789,
    "tg_username": "john_doe",
    "tg_verified": true
  }
}
```

**响应示例 - 用户不在频道**:
```json
{
  "error": "User not in channel",
  "message": "该 Telegram 账号不在指定频道内",
  "tg_user_id": 123456789,
  "status": "left"
}
```

**响应示例 - 账号已被绑定**:
```json
{
  "error": "TG account already bound",
  "message": "该 Telegram 账号已被其他用户绑定"
}
```

**绑定验证流程**:
1. ✅ 验证用户是否在频道内
2. ✅ 检查该 Telegram ID 是否已被其他用户绑定
3. ✅ 绑定成功，设置 `tg_verified = true`
4. ✅ 记录绑定时间

**TypeScript 示例**:
```typescript
interface BindResult {
  success: boolean;
  message: string;
  user?: {
    tg_user_id: number;
    tg_username: string;
    tg_verified: boolean;
  };
}

async function bindTelegramAccount(
  tgUserId: number,
  tgUsername?: string
): Promise<BindResult> {
  const response = await fetch(
    'https://astromoon-backend-production.up.railway.app/api/telegram/bind',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tg_user_id: tgUserId,
        tg_username: tgUsername
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    if (data.error === 'User not in channel') {
      throw new Error('请先加入 Telegram 频道');
    } else if (data.error === 'TG account already bound') {
      throw new Error('该 Telegram 账号已被其他用户绑定');
    }
    throw new Error(data.message || 'Binding failed');
  }

  return data;
}
```

**用户绑定数据存储**:

绑定后，用户数据会更新以下字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| `tg_user_id` | BIGINT | Telegram 用户 ID |
| `tg_username` | VARCHAR(255) | Telegram 用户名 |
| `tg_verified` | BOOLEAN | 是否已验证（绑定后为 true） |
| `tg_linked_at` | TIMESTAMP | 绑定时间 |

**查询用户的 Telegram 绑定信息**:
```sql
SELECT
  id,
  email,
  tg_user_id,
  tg_username,
  tg_verified,
  tg_linked_at
FROM users
WHERE id = :user_id;
```

---

### 5.3 解绑 Telegram 账号

**DELETE** `/api/telegram/unbind`

解除当前用户的 Telegram 账号绑定。

**请求 Headers**:
```
Authorization: Bearer YOUR_FIREBASE_ID_TOKEN
```

**响应示例**:
```json
{
  "success": true,
  "message": "Telegram 账号解绑成功"
}
```

**TypeScript 示例**:
```typescript
async function unbindTelegramAccount(): Promise<void> {
  const response = await fetch(
    'https://astromoon-backend-production.up.railway.app/api/telegram/unbind',
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${idToken}`
      }
    }
  );

  if (!response.ok) {
    throw new Error('Failed to unbind Telegram account');
  }

  const data = await response.json();
  console.log(data.message);
}
```

---

### 5.4 获取频道成员列表

**GET** `/api/telegram/members`

获取频道成员列表（分页），主要用于管理后台。

**查询参数**:
- `limit`: 每页数量（默认：50）
- `offset`: 偏移量（默认：0）

**请求示例**:
```
GET /api/telegram/members?limit=20&offset=0
```

**请求 Headers**:
```
Authorization: Bearer YOUR_FIREBASE_ID_TOKEN
```

**响应示例**:
```json
{
  "success": true,
  "members": [
    {
      "tg_user_id": 123456789,
      "username": "john_doe",
      "first_name": "John",
      "last_name": "Doe",
      "status": "member",
      "last_seen_at": "2024-12-22T00:00:00.000Z"
    }
  ],
  "total": 150,
  "limit": 20,
  "offset": 0,
  "cacheValid": true,
  "cachedUntil": "2024-12-22T00:00:30.000Z"
}
```

---

### 5.5 完整集成示例

#### 场景1：用户绑定 Telegram 账号流程

```typescript
// 第一步：用户输入 Telegram ID
function TelegramBindingForm() {
  const [tgUserId, setTgUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBind = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. 先检查用户是否在频道内
      const check = await checkTelegramMembership(parseInt(tgUserId));

      if (!check.isMember) {
        setError('您不在频道内，请先加入');
        window.open('https://t.me/themoon_dojo', '_blank');
        return;
      }

      // 2. 在频道内，执行绑定
      const result = await bindTelegramAccount(
        parseInt(tgUserId),
        check.user?.username
      );

      alert('✅ Telegram 账号绑定成功！');

      // 3. 刷新用户信息
      await refreshUserProfile();

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="输入您的 Telegram ID"
        value={tgUserId}
        onChange={(e) => setTgUserId(e.target.value)}
      />
      <button onClick={handleBind} disabled={loading}>
        {loading ? '验证中...' : '绑定 Telegram'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <p style={{ fontSize: '12px', color: '#666' }}>
        💡 如何获取 Telegram ID？发送 /start 给
        <a href="https://t.me/userinfobot" target="_blank">@userinfobot</a>
      </p>
    </div>
  );
}
```

#### 场景2：生成报告前验证会员身份

```typescript
async function generateAIReport() {
  try {
    // 1. 获取当前用户信息
    const user = await getCurrentUser();

    // 2. 检查是否绑定了 Telegram
    if (!user.tg_user_id || !user.tg_verified) {
      alert('请先绑定 Telegram 账号以使用此功能');
      // 跳转到绑定页面
      router.push('/settings/telegram');
      return;
    }

    // 3. 实时检查用户是否还在频道内
    const check = await checkTelegramMembership(user.tg_user_id);

    if (!check.isMember) {
      alert('您已离开频道，无法使用此功能。请重新加入频道。');
      window.open('https://t.me/themoon_dojo', '_blank');
      return;
    }

    // 4. 验证通过，调用生成报告 API
    const response = await fetch(
      'https://astromoon-backend-production.up.railway.app/api/reports/generate',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          systemPrompt: '...',
          userPrompt: '...'
        })
      }
    );

    // 处理流式响应...

  } catch (error) {
    console.error('生成失败:', error);
    alert('生成失败，请稍后重试');
  }
}
```

#### 场景3：显示用户的 Telegram 绑定状态

```typescript
function TelegramStatus() {
  const [user, setUser] = useState(null);
  const [memberStatus, setMemberStatus] = useState(null);

  useEffect(() => {
    loadUserTelegramStatus();
  }, []);

  const loadUserTelegramStatus = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);

    if (currentUser.tg_user_id) {
      // 检查当前是否还在频道内
      const status = await checkTelegramMembership(currentUser.tg_user_id);
      setMemberStatus(status);
    }
  };

  if (!user?.tg_user_id) {
    return (
      <div className="telegram-status unbound">
        <p>❌ 未绑定 Telegram 账号</p>
        <button onClick={() => router.push('/bind-telegram')}>
          立即绑定
        </button>
      </div>
    );
  }

  return (
    <div className="telegram-status bound">
      <p>✅ 已绑定 Telegram</p>
      <p>Username: @{user.tg_username}</p>
      <p>User ID: {user.tg_user_id}</p>
      <p>绑定时间: {new Date(user.tg_linked_at).toLocaleString()}</p>

      {memberStatus && (
        <p>
          频道状态: {memberStatus.isMember ? '✅ 在频道内' : '❌ 已离开频道'}
        </p>
      )}

      <button onClick={handleUnbind}>解绑账号</button>
    </div>
  );
}
```

---

### 5.6 获取 Telegram User ID 的方法

用户可以通过以下方式获取自己的 Telegram ID：

**方法1：使用 Bot**
1. 打开 Telegram
2. 搜索 @userinfobot
3. 发送 `/start` 命令
4. Bot 会返回您的 User ID

**方法2：使用其他工具**
- @getmyid_bot
- @myidbot

**前端提示示例**:
```typescript
<div className="help-text">
  <h4>如何获取 Telegram ID？</h4>
  <ol>
    <li>打开 Telegram 应用</li>
    <li>搜索 <a href="https://t.me/userinfobot" target="_blank">@userinfobot</a></li>
    <li>发送 /start 命令</li>
    <li>复制返回的 ID 数字</li>
  </ol>
</div>
```

---

### 5.7 错误处理

| 错误码 | 错误类型 | 说明 | 处理建议 |
|--------|---------|------|----------|
| 403 | User not in channel | 用户不在频道内 | 提示用户加入频道 |
| 409 | TG account already bound | 该 TG 账号已被绑定 | 提示用户该账号已被使用 |
| 404 | member not found | 用户不存在 | 检查 ID 是否正确 |
| 500 | Telegram API Error | Telegram API 错误 | 稍后重试 |

**错误处理示例**:
```typescript
try {
  await bindTelegramAccount(tgUserId);
} catch (error) {
  if (error.message.includes('not in channel')) {
    // 不在频道内
    showJoinChannelPrompt();
  } else if (error.message.includes('already bound')) {
    // 已被绑定
    alert('该 Telegram 账号已被其他用户绑定');
  } else {
    // 其他错误
    alert('绑定失败，请稍后重试');
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

**文档版本**: 1.1
**最后更新**: 2024-12-22
**生产环境**: https://astromoon-backend-production.up.railway.app

## 更新日志

**v1.1 (2024-12-22)**
- ✅ 新增第5章：Telegram 频道成员管理
- ✅ 添加用户绑定 Telegram 账号功能
- ✅ 添加成员验证接口文档
- ✅ 提供完整的前端集成示例

**v1.0 (2024-12-21)**
- 初始版本发布
