import { getAuth } from 'firebase/auth';

// 新后端 Base URL
export const API_BASE_URL = 'https://astromoon-backend-production.up.railway.app';

/**
 * 获取 Firebase ID Token
 * @returns Firebase ID Token 或 null
 */
export async function getAuthToken(): Promise<string | null> {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return null;

  try {
    // 强制刷新 token 以确保有效性
    return await user.getIdToken(true);
  } catch (error) {
    console.error('获取 Firebase Token 失败:', error);
    return null;
  }
}

/**
 * 通用 API 请求封装
 * @param endpoint API 端点（如 '/api/profiles'）
 * @param options fetch 请求选项
 * @param requireAuth 是否需要认证（默认 true）
 * @returns API 响应数据
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  requireAuth: boolean = true
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // 如果需要认证，添加 Authorization header
  if (requireAuth) {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('未登录或登录已过期，请重新登录');
    }
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      // 尝试解析错误信息
      let errorMessage = `API 请求失败: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        // 如果无法解析 JSON，使用默认错误信息
      }

      const error: any = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }

    return response.json();
  } catch (error: any) {
    console.error('API 请求错误:', error);

    // 处理网络错误
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('网络连接失败，请检查网络设置');
    }

    throw error;
  }
}
