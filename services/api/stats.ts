import { apiRequest } from './config';
import type { UsageStats, ActivityResponse, SummaryStats } from './types';

/**
 * 获取 API 使用统计
 * @param days 查询最近 N 天（默认 30）
 * @returns 使用统计数据
 */
export async function getUsageStats(days: number = 30): Promise<UsageStats> {
  return apiRequest<UsageStats>(
    `/api/stats/usage?days=${days}`,
    {
      method: 'GET',
    },
    true
  );
}

/**
 * 获取用户活动历史
 * @param limit 返回条数（默认 50）
 * @param type 活动类型筛选（可选）
 * @returns 活动记录列表
 */
export async function getActivity(
  limit: number = 50,
  type?: 'profile_create' | 'report_generation' | 'report_export'
): Promise<ActivityResponse> {
  let url = `/api/stats/activity?limit=${limit}`;
  if (type) {
    url += `&type=${type}`;
  }

  return apiRequest<ActivityResponse>(
    url,
    {
      method: 'GET',
    },
    true
  );
}

/**
 * 获取总体统计摘要
 * @returns 统计摘要数据
 */
export async function getSummaryStats(): Promise<SummaryStats> {
  return apiRequest<SummaryStats>(
    '/api/stats/summary',
    {
      method: 'GET',
    },
    true
  );
}
