# 星盘计算 API 使用指南 (前端)

## 概述

本项目已统一使用 **Railway 后端** 的星盘计算 API，无需再维护腾讯云或 Cloudflare Workers 后端。

## API 配置

### 后端地址

```javascript
const RAILWAY_BACKEND_URL = 'https://astromoon-backend-production.up.railway.app';
```

### API 端点

```
POST /api/chart/unified
```

### 认证方式

使用 **Firebase JWT Token** 进行认证，Token 会自动从当前登录用户获取并添加到请求头。

```javascript
headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer <firebase_jwt_token>'
}
```

## 前端调用方式

### 方法 1: 直接使用 `calculateChart` 函数（推荐）

```typescript
import { calculateChart } from './services/apiService';
import type { ChartCalculationRequest } from './types';

async function getChart() {
  const request: ChartCalculationRequest = {
    // 使用 Unix 时间戳（推荐）
    unixTimestamp: Math.floor(new Date('2000-01-01T08:30:00').getTime() / 1000),
    latitude: 39.9042,
    longitude: 116.4074,
    houseSystem: 'P', // Placidus
    includeAspects: true,
    includeArabicParts: true,
  };

  try {
    const chartData = await calculateChart(request);
    console.log('星盘数据:', chartData);
    return chartData;
  } catch (error) {
    console.error('计算失败:', error);
    alert(error.message);
  }
}
```

### 方法 2: 使用日期时间字符串

```typescript
const request: ChartCalculationRequest = {
  birthDatetime: '2000-01-01T08:30:00', // ISO 格式
  timezoneOffset: 8, // UTC+8
  isDaylightSaving: false,
  latitude: 39.9042,
  longitude: 116.4074,
  houseSystem: 'W', // Whole Sign
};

const chartData = await calculateChart(request);
```

## 请求参数说明

### 必填参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `latitude` | number | 出生地纬度 |
| `longitude` | number | 出生地经度 |

### 时间参数（二选一）

| 参数 | 类型 | 说明 |
|------|------|------|
| `unixTimestamp` | number | Unix 时间戳（秒）**推荐** |
| `birthDatetime` | string | ISO 格式时间字符串 |

**注意**: 使用 `birthDatetime` 时必须提供 `timezoneOffset`

### 可选参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `timezoneOffset` | number | - | 时区偏移（小时），如 +8 |
| `isDaylightSaving` | boolean | false | 是否夏令时 |
| `houseSystem` | string | 'P' | 宫位系统 (P/W/K/E等) |
| `includeAspects` | boolean | true | 是否包含相位 |
| `includeArabicParts` | boolean | true | 是否包含阿拉伯点 |
| `includeFixedStars` | boolean | false | 是否包含恒星 |
| `gender` | string | - | 性别（可选）|
| `profileId` | number | - | 档案 ID |

### 宫位系统代码

- `P` - Placidus（默认）
- `W` - Whole Sign（整宫制）
- `K` - Koch
- `E` - Equal（等宫制）
- `C` - Campanus
- `R` - Regiomontanus

## 响应格式

### 成功响应

```json
{
  "code": 0,
  "msg": "获取成功",
  "data": {
    "meta": {
      "is_day_chart": false,
      "calculation_engine": "pyswisseph 2.10.03",
      "birth_time": "2000-01-01T00:00:00+00:00",
      "timezone_offset": 8.0
    },
    "bodies": {
      "sun": {
        "longitude": 279.859,
        "sign": "Capricorn",
        "sign_degree": 9.859,
        "speed": 1.019,
        "is_retrograde": false,
        "house_placement": {
          "whole_sign": 1,
          "alchabitius": {
            "raw": 12,
            "effective": 12
          }
        }
      },
      "moon": { /* ... */ },
      // ... 其他行星
    },
    "aspects": [
      {
        "body_a": "sun",
        "body_b": "moon",
        "type": "sextile",
        "orb": 2.5,
        "is_applying": true
      }
    ],
    "arabic_parts": {
      "part_of_fortune": {
        "longitude": 156.73,
        "sign": "Virgo",
        "sign_degree": 6.73
      }
    },
    "houses": {
      "whole_sign_cusps": { /* ... */ },
      "alchabitius_cusps": { /* ... */ }
    },
    "highlights": {
      "chart_type": "夜盘 (Night Chart)",
      "sun": {
        "sign": "Capricorn",
        "house": "第 1 宫"
      }
    }
  }
}
```

### 错误响应

#### 401 Unauthorized - 未登录

```json
{
  "error": "Unauthorized",
  "message": "No token provided"
}
```

**处理方式**: 提示用户登录

```typescript
try {
  const data = await calculateChart(request);
} catch (error) {
  if (error.message.includes('未授权')) {
    // 跳转到登录页面
    window.location.href = '/login';
  }
}
```

#### 400 Bad Request - 参数错误

```json
{
  "error": "InvalidRequest",
  "message": "需要提供 unix_timestamp 或 birth_datetime"
}
```

## 认证流程

### 自动认证

`calculateChart` 函数会自动处理认证：

1. 从 Firebase Auth 获取当前用户
2. 获取用户的 JWT Token
3. 添加到请求头 `Authorization: Bearer <token>`

### 手动认证（不推荐）

如果需要手动处理：

```typescript
import { getAuth } from 'firebase/auth';

const auth = getAuth();
const user = auth.currentUser;

if (user) {
  const token = await user.getIdToken(true);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(request)
  });
}
```

## 完整示例

### React 组件示例

```typescript
import React, { useState } from 'react';
import { calculateChart } from './services/apiService';
import type { ChartCalculationRequest, ChartCalculationResponse } from './types';

export function ChartCalculator() {
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<ChartCalculationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async (birthDate: Date, lat: number, lng: number) => {
    setLoading(true);
    setError(null);

    try {
      const request: ChartCalculationRequest = {
        unixTimestamp: Math.floor(birthDate.getTime() / 1000),
        latitude: lat,
        longitude: lng,
        houseSystem: 'P',
        includeAspects: true,
        includeArabicParts: true,
      };

      const data = await calculateChart(request);
      setChartData(data);
    } catch (err: any) {
      setError(err.message);

      // 处理未登录
      if (err.message.includes('未授权')) {
        alert('请先登录');
        // 跳转登录页面
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading && <div>计算中...</div>}
      {error && <div className="error">{error}</div>}
      {chartData && (
        <div>
          <h3>太阳: {chartData.bodies.sun.sign}</h3>
          <h3>月亮: {chartData.bodies.moon.sign}</h3>
          {/* 显示更多星盘数据 */}
        </div>
      )}
    </div>
  );
}
```

## 数据提取示例

```typescript
function extractChartInfo(chartData: ChartCalculationResponse) {
  return {
    // 基本信息
    chartType: chartData.meta.is_day_chart ? '日盘' : '夜盘',

    // 太阳
    sun: {
      sign: chartData.bodies.sun.sign,
      house: chartData.bodies.sun.house_placement.whole_sign,
      degree: chartData.bodies.sun.sign_degree.toFixed(2),
      isRetrograde: chartData.bodies.sun.is_retrograde,
    },

    // 月亮
    moon: {
      sign: chartData.bodies.moon.sign,
      house: chartData.bodies.moon.house_placement.whole_sign,
    },

    // 上升和天顶
    ascendant: {
      sign: chartData.bodies.asc.sign,
      degree: chartData.bodies.asc.sign_degree.toFixed(2),
    },
    midheaven: {
      sign: chartData.bodies.mc.sign,
      degree: chartData.bodies.mc.sign_degree.toFixed(2),
    },

    // 相位
    aspectsCount: chartData.aspects.length,

    // 福点
    fortune: chartData.arabic_parts.part_of_fortune,
  };
}

// 使用
const chartInfo = extractChartInfo(chartData);
console.log(`你的太阳在 ${chartInfo.sun.sign} 第 ${chartInfo.sun.house} 宫`);
```

## 注意事项

### 1. 用户必须登录

星盘计算 API 需要 Firebase 认证，用户未登录时会返回 401 错误。

**建议**：在调用前检查用户登录状态：

```typescript
import { getAuth } from 'firebase/auth';

const auth = getAuth();
if (!auth.currentUser) {
  alert('请先登录');
  // 跳转登录页面
  return;
}

// 继续计算星盘
await calculateChart(request);
```

### 2. 时间格式推荐

优先使用 `unixTimestamp`，比日期字符串更可靠：

```typescript
// ✅ 推荐
const timestamp = Math.floor(new Date('2000-01-01T08:30:00').getTime() / 1000);

// ❌ 不推荐（需要额外处理时区）
const birthDatetime = '2000-01-01T08:30:00';
```

### 3. 错误处理

务必捕获异常并向用户展示友好的错误信息：

```typescript
try {
  await calculateChart(request);
} catch (error) {
  if (error.message.includes('未授权')) {
    showLoginDialog();
  } else if (error.message.includes('参数')) {
    alert('请检查输入的出生信息');
  } else {
    alert('计算失败，请稍后重试');
  }
}
```

### 4. 响应数据结构

Railway API 返回格式为：
```json
{
  "code": 0,
  "msg": "成功",
  "data": { /* 星盘数据 */ }
}
```

`calculateChart` 函数会自动提取 `data` 字段，你直接使用返回值即可。

## 旧代码迁移

### 从腾讯云 API 迁移

**旧代码** (已删除):
```typescript
// ❌ 旧的腾讯云 API
const url = 'http://43.134.98.27:8000/chart/unified';
```

**新代码**:
```typescript
// ✅ 新的 Railway API（已内置）
import { calculateChart } from './services/apiService';
```

无需修改调用方式，只需确保用户已登录。

### 从 Cloudflare Workers 迁移

**旧代码** (已删除):
```typescript
// ❌ 旧的 CF Workers
const response = await fetch('/api/calculate-chart', { /* ... */ });
```

**新代码**:
```typescript
// ✅ 统一使用 Railway API
import { calculateChart } from './services/apiService';
const data = await calculateChart(request);
```

## 相关文档

- [后端 API 完整文档](https://github.com/onthebigtree/AstroMoon-backend/blob/main/CHART_API_USAGE.md)
- [Firebase 认证文档](./FIREBASE_SETUP.md)
- [类型定义](./types.ts)

## 问题排查

### Q: 提示"未授权"错误

**A**: 检查用户是否已登录 Firebase：
```typescript
import { getAuth } from 'firebase/auth';
const auth = getAuth();
console.log('当前用户:', auth.currentUser);
```

### Q: 计算速度慢

**A**: Railway 后端计算通常在 100-500ms 内完成。如果超时，检查网络连接。

### Q: 参数错误

**A**: 确保提供了必填参数：
- `latitude` 和 `longitude` 必填
- `unixTimestamp` 或 `birthDatetime` 二选一
- 使用 `birthDatetime` 时必须提供 `timezoneOffset`

## 开发环境

本地开发时 API 会直接调用 Railway 生产环境：

```
https://astromoon-backend-production.up.railway.app/api/chart/unified
```

无需配置环境变量，开箱即用。
