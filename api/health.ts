/**
 * Vercel Serverless Function - Health Check Proxy
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const BACKEND_URL = 'http://43.134.98.27:3782';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error: any) {
    res.status(500).json({
      error: 'Backend health check failed',
      message: error.message,
    });
  }
}
