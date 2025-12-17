import { Hono } from 'hono';
import { cors } from 'hono/cors';

// 类型定义
interface Env {
  OPENAI_API_KEY?: string;
  GEMINI_API_KEY?: string;
  AI_API_BASE_URL?: string;
}

const app = new Hono<{ Bindings: Env }>();

// CORS 配置
app.use('/*', cors({
  origin: [
    'https://astromoon.xyz',
    'https://www.astromoon.xyz',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}));

// 健康检查端点
app.get('/', (c) => {
  return c.json({
    status: 'ok',
    service: 'AstroMoon Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// AI 生成接口
app.post('/api/generate', async (c) => {
  try {
    const { systemPrompt, userPrompt } = await c.req.json();

    if (!userPrompt) {
      return c.json({ error: 'userPrompt is required' }, 400);
    }

    // 获取 API 配置
    const apiKey = c.env.OPENAI_API_KEY || c.env.GEMINI_API_KEY;
    const apiBaseUrl = c.env.AI_API_BASE_URL || 'https://api.openai.com/v1';

    if (!apiKey) {
      return c.json({
        error: 'API key not configured. Please set OPENAI_API_KEY or GEMINI_API_KEY in Cloudflare Workers secrets.'
      }, 500);
    }

    console.log('🔐 Calling AI API:', apiBaseUrl);

    // 调用 OpenAI 兼容 API
    const response = await fetch(`${apiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt || 'You are a helpful assistant.'
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        stream: true,
        max_tokens: 16000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API Error:', errorText);
      return c.json({
        error: `AI API request failed: ${response.status} ${response.statusText}`,
        details: errorText
      }, response.status);
    }

    // 返回流式响应
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': c.req.header('origin') || '*',
      },
    });

  } catch (error: any) {
    console.error('Generate API Error:', error);
    return c.json({
      error: 'Internal server error',
      message: error.message
    }, 500);
  }
});

// 星盘计算接口
app.post('/api/calculate-chart', async (c) => {
  try {
    const { birthDate, birthTime, latitude, longitude, timezone } = await c.req.json();

    // 验证必填参数
    if (!birthDate || !birthTime || latitude === undefined || longitude === undefined) {
      return c.json({
        error: 'Missing required parameters: birthDate, birthTime, latitude, longitude'
      }, 400);
    }

    console.log('🔮 Calculating astrology chart:', { birthDate, birthTime, latitude, longitude });

    // 这里需要集成星盘计算库或调用第三方 API
    // 示例使用第三方星盘计算 API（需要替换为实际的服务）

    // 方案 1: 使用 Swiss Ephemeris WebAssembly (推荐)
    // 方案 2: 调用第三方星盘 API
    // 方案 3: 返回模拟数据供前端使用

    // 临时返回示例数据结构
    const chartData = {
      success: true,
      data: {
        sun: { sign: 'Aries', degree: 15.5, house: 1 },
        moon: { sign: 'Taurus', degree: 22.3, house: 2 },
        ascendant: { sign: 'Leo', degree: 10.2 },
        // ... 更多行星数据
      },
      birthInfo: {
        date: birthDate,
        time: birthTime,
        location: { latitude, longitude, timezone }
      }
    };

    return c.json(chartData);

  } catch (error: any) {
    console.error('Calculate Chart Error:', error);
    return c.json({
      error: 'Failed to calculate chart',
      message: error.message
    }, 500);
  }
});

// 404 处理
app.notFound((c) => {
  return c.json({
    error: 'Not Found',
    path: c.req.path
  }, 404);
});

// 错误处理
app.onError((err, c) => {
  console.error('Unhandled Error:', err);
  return c.json({
    error: 'Internal Server Error',
    message: err.message
  }, 500);
});

export default app;
