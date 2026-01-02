import { apiRequest } from './config';

/**
 * 星星套餐配置
 */
export interface StarPackage {
  id: string;
  name: string;
  stars: number;
  price: number; // USD
  currency: 'USD';
  bonus?: number; // 额外赠送的星星
  popular?: boolean;
}

/**
 * 可用的星星套餐
 */
export const STAR_PACKAGES: StarPackage[] = [
  {
    id: 'stars_10',
    name: '入门套餐',
    stars: 10,
    price: 5,
    currency: 'USD',
  },
  {
    id: 'stars_30',
    name: '标准套餐',
    stars: 30,
    price: 12,
    currency: 'USD',
    bonus: 5,
    popular: true,
  },
  {
    id: 'stars_100',
    name: '豪华套餐',
    stars: 100,
    price: 35,
    currency: 'USD',
    bonus: 20,
  },
  {
    id: 'stars_300',
    name: '至尊套餐',
    stars: 300,
    price: 90,
    currency: 'USD',
    bonus: 80,
  },
];

/**
 * Coinbase Commerce 支付创建响应
 */
export interface CoinbaseChargeResponse {
  chargeId: string;
  hostedUrl: string;
  expiresAt: string;
  pricing: {
    local: {
      amount: string;
      currency: string;
    };
  };
}

/**
 * 创建 Coinbase 支付订单
 * @param packageId 套餐 ID
 * @returns Coinbase 支付链接和订单信息
 */
export async function createCoinbasePayment(packageId: string): Promise<CoinbaseChargeResponse> {
  const response = await apiRequest<CoinbaseChargeResponse>(
    '/api/payments/coinbase/create',
    {
      method: 'POST',
      body: JSON.stringify({ packageId }),
    },
    true
  );
  return response;
}

/**
 * 查询支付状态
 * @param chargeId Coinbase Charge ID
 * @returns 支付状态信息
 */
export async function getPaymentStatus(chargeId: string): Promise<{
  status: 'pending' | 'confirmed' | 'failed' | 'expired';
  starsAdded?: number;
}> {
  const response = await apiRequest<{
    status: 'pending' | 'confirmed' | 'failed' | 'expired';
    starsAdded?: number;
  }>(
    `/api/payments/coinbase/status/${chargeId}`,
    {
      method: 'GET',
    },
    true
  );
  return response;
}

/**
 * 获取用户支付历史
 * @param limit 返回数量限制
 * @returns 支付记录列表
 */
export async function getPaymentHistory(limit: number = 20): Promise<Array<{
  id: string;
  packageName: string;
  stars: number;
  amount: string;
  currency: string;
  status: string;
  createdAt: string;
}>> {
  const response = await apiRequest<{
    payments: Array<{
      id: string;
      packageName: string;
      stars: number;
      amount: string;
      currency: string;
      status: string;
      createdAt: string;
    }>;
  }>(
    `/api/payments/history?limit=${limit}`,
    {
      method: 'GET',
    },
    true
  );
  return response.payments;
}
