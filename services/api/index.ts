/**
 * 新后端 API 统一导出
 */

// 配置和工具
export { API_BASE_URL, getAuthToken, apiRequest } from './config';

// 类型定义
export type * from './types';

// 档案管理
export {
  createProfile,
  getProfiles,
  getProfile,
  updateProfile,
  deleteProfile,
} from './profiles';

// 报告管理
export {
  streamReportGenerate,
  getReports,
  getReport,
  markReportExported,
  deleteReport,
} from './reports';

// 统计数据
export {
  getUsageStats,
  getActivity,
  getSummaryStats,
} from './stats';
