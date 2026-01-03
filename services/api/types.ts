/**
 * 新后端 API 类型定义
 */

// ==================== 档案管理相关类型 ====================

export interface CreateProfileData {
  profileName?: string;
  gender: 'male' | 'female' | 'other';
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
  birthMinute: number;
  birthPlace?: string;
  birthLongitude?: number;
  birthLatitude?: number;
  timezone?: string;
}

export interface Profile {
  id: string | number; // 后端可能返回数字或字符串
  user_id: string;
  profile_name?: string;
  gender: 'male' | 'female' | 'other';
  birth_year: number;
  birth_month: number;
  birth_day: number;
  birth_hour: number;
  birth_minute: number;
  birth_datetime: string; // ISO 格式
  birth_place?: string;
  birth_longitude?: number;
  birth_latitude?: number;
  timezone?: string;
  created_at: string;
  updated_at: string;
}

export interface ProfilesResponse {
  success: boolean;
  profiles: Profile[];
  count: number;
}

export interface ProfileResponse {
  success: boolean;
  profile: Profile;
}

// ==================== AI 报告相关类型 ====================

export interface GenerateReportRequest {
  systemPrompt: string;
  userPrompt: string;
  chartId?: string;
  profileId?: string;
  reportTitle?: string;
}

export interface Report {
  id: string;
  user_id: string;
  chart_id?: string;
  profile_id?: string;
  report_title: string;
  report_type: string;
  model_name: string;
  system_prompt: string;
  user_prompt: string;
  full_report: {
    content: string;
  };
  generation_duration_ms: number;
  token_count: number;
  generated_at: string;
  viewed_at?: string;
  export_count: number;
  last_exported_at?: string;
  // 档案信息（如果关联）
  profile_name?: string;
  sun_sign?: string;
  moon_sign?: string;
  ascendant_sign?: string;
}

export interface ReportsResponse {
  success: boolean;
  reports: Report[];
  count: number;
}

export interface ReportResponse {
  success: boolean;
  report: Report;
}

export interface ExportResponse {
  success: boolean;
  exportCount: number;
}

// ==================== 星星配额相关类型 ====================

export interface UserCredits {
  success: boolean;
  total_stars: number;
  used_stars: number;
  remaining_stars: number;
}

export interface CreditsError {
  error: string;
  message: string;
  total_stars?: number;
  used_stars?: number;
  remaining_stars?: number;
}

// ==================== 生成限制相关类型 ====================

export interface GenerationLimit {
  success: boolean;
  allowed: boolean;
  remaining: number;
  used: number;
  limit: number;
  resetAt: string;
}

export interface GenerationLimitError {
  error: string;
  message: string;
  limit: number;
  used: number;
  remaining: number;
  resetAt: string;
}

// ==================== 统计数据相关类型 ====================

export interface UsageStats {
  success: boolean;
  summary: {
    totalRequests: number;
    totalSuccess: number;
    totalErrors: number;
    totalTokens: number;
  };
  details: Array<{
    endpoint: string;
    date: string;
    request_count: number;
    success_count: number;
    error_count: number;
    total_tokens_used: number;
    total_duration_ms: number;
    avg_duration_ms: number;
  }>;
}

export interface Activity {
  id: string;
  activity_type: 'profile_create' | 'report_generation' | 'report_export';
  resource_type: string;
  resource_id: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface ActivityResponse {
  success: boolean;
  activities: Activity[];
  count: number;
}

export interface SummaryStats {
  success: boolean;
  summary: {
    totalProfiles: number;
    totalReports: number;
    totalExports: number;
    totalTokensUsed: number;
    recentActivities: Array<{
      activity_type: string;
      count: number;
    }>;
    monthlyUsage: {
      requests: number;
      tokens: number;
    };
  };
}

// ==================== 通用响应类型 ====================

export interface ApiError {
  error: string;
  message?: string;
  details?: string;
}

export interface SuccessResponse {
  success: boolean;
  message: string;
}

// ==================== 队列相关类型 ====================

export interface QueueInfo {
  requestId: number;
  waitTime: number;
  processingTime: number;
  totalTime: number;
  queuePosition: number;
  activeCount: number;
  queueLength: number;
}

// ==================== 支付相关类型 ====================

export interface Product {
  name: string;
  price: number;
  stars: number;
  description: string;
  popular?: boolean;
}

export interface ProductsResponse {
  success: boolean;
  products: Record<string, Product>;
}

export interface CreatePaymentRequest {
  productType: 'stars_10' | 'stars_30' | 'stars_100';
  payCurrency?: string; // btc, eth, usdt, usdcbase 等
}

export interface CreatePaymentResponse {
  success: boolean;
  invoiceId: number;
  paymentUrl: string;
  orderId: string;
}

export interface PaymentInvoice {
  id: number;
  user_id: number;
  invoice_id: string;
  order_id: string;
  invoice_url: string;
  product_type: string;
  stars_amount: number;
  price_amount: number;
  pay_currency: string;
  paid_amount?: number;
  status: 'waiting' | 'confirming' | 'confirmed' | 'finished' | 'failed' | 'expired';
  created_at: string;
  updated_at: string;
}

export interface PaymentStatusResponse {
  success: boolean;
  invoice: PaymentInvoice;
}

export interface CurrenciesResponse {
  success: boolean;
  currencies: string[];
}
