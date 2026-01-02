import { apiRequest } from './config';
import type {
  ProductsResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  OrderResponse,
  OrdersResponse,
} from './types';

/**
 * 获取所有产品列表
 * @returns 产品列表
 */
export async function getProducts(): Promise<ProductsResponse> {
  return apiRequest<ProductsResponse>(
    '/api/payments/products',
    {
      method: 'GET',
    },
    true
  );
}

/**
 * 创建支付订单
 * @param request 订单请求
 * @returns 订单信息和支付链接
 */
export async function createOrder(request: CreateOrderRequest): Promise<CreateOrderResponse> {
  return apiRequest<CreateOrderResponse>(
    '/api/payments/orders/create',
    {
      method: 'POST',
      body: JSON.stringify(request),
    },
    true
  );
}

/**
 * 查询订单状态
 * @param orderId 订单ID
 * @returns 订单详情
 */
export async function getOrder(orderId: number): Promise<OrderResponse> {
  return apiRequest<OrderResponse>(
    `/api/payments/orders/${orderId}`,
    {
      method: 'GET',
    },
    true
  );
}

/**
 * 获取用户订单历史
 * @param limit 每页数量（默认 20）
 * @param offset 偏移量（默认 0）
 * @returns 订单列表
 */
export async function getOrders(
  limit: number = 20,
  offset: number = 0
): Promise<OrdersResponse> {
  return apiRequest<OrdersResponse>(
    `/api/payments/orders?limit=${limit}&offset=${offset}`,
    {
      method: 'GET',
    },
    true
  );
}
