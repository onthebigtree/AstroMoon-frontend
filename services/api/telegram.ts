import { apiRequest } from './config';

/**
 * Telegram 频道成员验证相关 API
 */

// ==================== 类型定义 ====================

export interface TelegramMemberCheck {
  success: boolean;
  isMember: boolean;
  status: 'creator' | 'administrator' | 'member' | 'left' | 'kicked' | 'not_found';
  user: {
    tg_user_id: number;
    username: string;
    first_name: string;
    last_name: string;
  } | null;
  lastChecked: string;
  cachedUntil: string;
  source: 'database' | 'realtime';
}

export interface TelegramBindRequest {
  tg_user_id: number;
  tg_username?: string;
}

export interface TelegramBindResult {
  success: boolean;
  message: string;
  user?: {
    tg_user_id: number;
    tg_username: string;
    tg_verified: boolean;
  };
}

export interface TelegramUnbindResult {
  success: boolean;
  message: string;
}

// ==================== API 函数 ====================

/**
 * 检查用户是否在频道内
 * @param tgUserId Telegram 用户 ID
 * @returns 成员状态
 */
export async function checkTelegramMembership(
  tgUserId: number
): Promise<TelegramMemberCheck> {
  return await apiRequest<TelegramMemberCheck>(
    `/api/telegram/check/${tgUserId}`,
    {
      method: 'GET',
    },
    true
  );
}

/**
 * 绑定 Telegram 账号
 * @param request 绑定请求数据
 * @returns 绑定结果
 */
export async function bindTelegramAccount(
  request: TelegramBindRequest
): Promise<TelegramBindResult> {
  return await apiRequest<TelegramBindResult>(
    '/api/telegram/bind',
    {
      method: 'POST',
      body: JSON.stringify(request),
    },
    true
  );
}

/**
 * 解绑 Telegram 账号
 * @returns 解绑结果
 */
export async function unbindTelegramAccount(): Promise<TelegramUnbindResult> {
  return await apiRequest<TelegramUnbindResult>(
    '/api/telegram/unbind',
    {
      method: 'DELETE',
    },
    true
  );
}
