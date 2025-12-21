import { apiRequest } from './config';
import type {
  CreateProfileData,
  Profile,
  ProfilesResponse,
  ProfileResponse,
  SuccessResponse,
} from './types';

/**
 * 创建出生档案
 * @param data 档案数据
 * @returns 创建的档案信息
 */
export async function createProfile(data: CreateProfileData): Promise<Profile> {
  const response = await apiRequest<ProfileResponse>(
    '/api/profiles',
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
    true // 需要认证
  );
  return response.profile;
}

/**
 * 获取所有档案
 * @returns 档案列表
 */
export async function getProfiles(): Promise<Profile[]> {
  const response = await apiRequest<ProfilesResponse>(
    '/api/profiles',
    {
      method: 'GET',
    },
    true
  );
  return response.profiles;
}

/**
 * 获取单个档案
 * @param id 档案 ID
 * @returns 档案信息
 */
export async function getProfile(id: string): Promise<Profile> {
  const response = await apiRequest<ProfileResponse>(
    `/api/profiles/${id}`,
    {
      method: 'GET',
    },
    true
  );
  return response.profile;
}

/**
 * 更新档案
 * @param id 档案 ID
 * @param data 更新的档案数据
 * @returns 更新后的档案信息
 */
export async function updateProfile(
  id: string,
  data: CreateProfileData
): Promise<Profile> {
  const response = await apiRequest<ProfileResponse>(
    `/api/profiles/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    },
    true
  );
  return response.profile;
}

/**
 * 删除档案
 * @param id 档案 ID
 */
export async function deleteProfile(id: string): Promise<void> {
  await apiRequest<SuccessResponse>(
    `/api/profiles/${id}`,
    {
      method: 'DELETE',
    },
    true
  );
}
