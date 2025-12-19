/**
 * Vercel Serverless Function - Chart Calculation Proxy
 * 代理到新的统一 API 端点 /chart/unified
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const BACKEND_URL = 'http://43.134.98.27:8000';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔮 代理星盘计算请求到:', `${BACKEND_URL}/chart/unified`);
    console.log('📊 请求体:', req.body);

    const response = await fetch(`${BACKEND_URL}/chart/unified`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    console.log('✅ 响应状态:', response.status);

    res.status(response.status).json(data);
  } catch (error: any) {
    console.error('❌ 星盘计算失败:', error);
    res.status(500).json({
      error: 'Chart calculation failed',
      message: error.message,
    });
  }
}
