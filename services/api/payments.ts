import { apiRequest } from './config';
import type {
  ProductsResponse,
  CreatePaymentRequest,
  CreatePaymentResponse,
  PaymentStatusResponse,
  CurrenciesResponse
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
