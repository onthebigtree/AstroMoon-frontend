import { API_BASE_URL, getAuthToken } from './config';
import { apiRequest } from './config';
import type {
  GenerateReportRequest,
  Report,
  ReportsResponse,
  ReportResponse,
  ExportResponse,
  SuccessResponse,
  GenerationLimit,
} from './types';

/**
 * 生成 AI 报告（流式）
 * 注意：这是一个 AsyncGenerator，用于流式接收生成内容
 * @param request 报告生成请求
 * @param options 选项对象，包含回调函数
 */
export async function* streamReportGenerate(
  request: GenerateReportRequest,
  options?: {
    onToken?: (token: string) => void;
    onQueueInfo?: (queueInfo: import('./types').QueueInfo) => void;
  }
): AsyncGenerator<string, void, unknown> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('未登录或登录已过期，请重新登录');
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  const response = await fetch(`${API_BASE_URL}/api/reports/generate`, {
    method: 'POST',
    headers,
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'API 请求失败' }));

    // 特殊处理 429 限流错误
    if (response.status === 429) {
      const errorMsg = errorData.message || errorData.error || '今日生成次数已用完';
      throw new Error(errorMsg);
    }

    throw new Error(errorData.error || errorData.message || 'AI 生成失败');
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('无法读取响应流');

  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ') && !line.includes('[DONE]')) {
          try {
            const json = JSON.parse(line.slice(6));

            // 处理队列信息事件
            if (json.type === 'queue_info') {
              options?.onQueueInfo?.(json.queueInfo);
            }
            // 处理AI生成内容
            else {
              const content = json.choices?.[0]?.delta?.content || '';
              if (content) {
                options?.onToken?.(content);
                yield content;
              }
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * 获取所有报告
 * @param limit 每页数量（默认 20）
 * @param offset 偏移量（默认 0）
 * @returns 报告列表
 */
export async function getReports(
  limit: number = 20,
  offset: number = 0
): Promise<Report[]> {
  const response = await apiRequest<ReportsResponse>(
    `/api/reports?limit=${limit}&offset=${offset}`,
    {
      method: 'GET',
    },
    true
  );
  return response.reports;
}

/**
 * 获取单个报告
 * @param id 报告 ID
 * @returns 报告详情
 */
export async function getReport(id: string): Promise<Report> {
  const response = await apiRequest<ReportResponse>(
    `/api/reports/${id}`,
    {
      method: 'GET',
    },
    true
  );
  return response.report;
}

/**
 * 标记报告为已导出
 * @param id 报告 ID
 * @returns 导出次数
 */
export async function markReportExported(id: string): Promise<number> {
  const response = await apiRequest<ExportResponse>(
    `/api/reports/${id}/export`,
    {
      method: 'POST',
    },
    true
  );
  return response.exportCount;
}

/**
 * 删除报告
 * @param id 报告 ID
 */
export async function deleteReport(id: string): Promise<void> {
  await apiRequest<SuccessResponse>(
    `/api/reports/${id}`,
    {
      method: 'DELETE',
    },
    true
  );
}

/**
 * 查询今日生成限制状态（已废弃，保留兼容）
 * @deprecated 请使用 getUserCredits() 代替
 * @returns 生成限制信息（是否允许、剩余次数、重置时间等）
 */
export async function checkGenerationLimit(): Promise<GenerationLimit> {
  const response = await apiRequest<GenerationLimit>(
    '/api/reports/limit',
    {
      method: 'GET',
    },
    true
  );
  return response;
}
