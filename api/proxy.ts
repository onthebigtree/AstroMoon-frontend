/**
 * Vercel Serverless Function - API 代理
 * 解决 CORS 跨域问题
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const BACKEND_URL = 'http://43.134.98.27:3782';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 获取目标路径
    const { path } = req.query;
    const targetPath = Array.isArray(path) ? path.join('/') : path || '';
    const targetUrl = `${BACKEND_URL}/${targetPath}`;

    console.log(`[Proxy] ${req.method} ${targetUrl}`);

    // 转发请求到后端
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    // 检查是否是流式响应（SSE）
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('text/event-stream')) {
      // 设置 SSE 响应头
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // 流式转发
      const reader = response.body?.getReader();
      if (!reader) {
        return res.status(500).json({ error: 'Cannot read response stream' });
      }

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        res.write(chunk);
      }

      res.end();
    } else {
      // 普通 JSON 响应
      const data = await response.json();
      res.status(response.status).json(data);
    }
  } catch (error: any) {
    console.error('[Proxy Error]', error);
    res.status(500).json({
      error: 'Proxy request failed',
      message: error.message,
    });
  }
}
