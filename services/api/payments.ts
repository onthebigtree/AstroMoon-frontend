import { apiRequest } from './config';
import type {
  ProductsResponse,
  CreatePaymentRequest,
  CreatePaymentResponse,
  PaymentStatusResponse,
  CurrenciesResponse,
  StarBalanceResponse,
  TransactionsResponse,
  TransactionsRequest
} from './types';

/**
 * 获取所有产品列表
 */
export async function getProducts(): Promise<ProductsResponse> {
  return await apiRequest<ProductsResponse>(
    '/api/payments/products',
    {
      method: 'GET',
    },
    true
  );
}

/**
 * 获取支持的加密货币列表
 */
export async function getCurrencies(): Promise<CurrenciesResponse> {
  return await apiRequest<CurrenciesResponse>(
    '/api/payments/currencies',
    {
      method: 'GET',
    },
    true
  );
}

/**
 * 创建支付发票
 */
export async function createPayment(request: CreatePaymentRequest): Promise<CreatePaymentResponse> {
  return await apiRequest<CreatePaymentResponse>(
    '/api/payments/create',
    {
      method: 'POST',
      body: JSON.stringify(request),
    },
    true
  );
}

/**
 * 查询支付状态
 */
export async function getPaymentStatus(invoiceId: number): Promise<PaymentStatusResponse> {
  return await apiRequest<PaymentStatusResponse>(
    `/api/payments/status/${invoiceId}`,
    {
      method: 'GET',
    },
    true
  );
}

/**
 * 根据 orderId 查询支付状态
 * 用于支付回调页面查询订单状态
 */
export async function getPaymentStatusByOrder(orderId: string): Promise<PaymentStatusResponse> {
  return await apiRequest<PaymentStatusResponse>(
    `/api/payments/status-by-order/${orderId}`,
    {
      method: 'GET',
    },
    true
  );
}

/**
 * 获取当前星星余额
 */
export async function getStarBalance(): Promise<StarBalanceResponse> {
  return await apiRequest<StarBalanceResponse>(
    '/api/payments/stars-balance',
    {
      method: 'GET',
    },
    true
  );
}

/**
 * 获取交易记录（充值和消费历史）
 */
export async function getTransactions(params?: TransactionsRequest): Promise<TransactionsResponse> {
  const queryParams = new URLSearchParams();

  if (params?.type) {
    queryParams.append('type', params.type);
  }
  if (params?.page) {
    queryParams.append('page', params.page.toString());
  }
  if (params?.limit) {
    queryParams.append('limit', params.limit.toString());
  }

  const queryString = queryParams.toString();
  const endpoint = queryString
    ? `/api/payments/transactions?${queryString}`
    : '/api/payments/transactions';

  return await apiRequest<TransactionsResponse>(
    endpoint,
    {
      method: 'GET',
    },
    true
  );
}
