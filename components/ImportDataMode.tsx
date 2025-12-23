
import React, { useState, useEffect } from 'react';
import { LifeDestinyResult } from '../types';
import { CheckCircle, AlertCircle, Sparkles, ArrowRight, Zap, Loader2, TrendingUp, Heart, MapPin, BookOpen, Save, Edit2, Trash2, X } from 'lucide-react';
import { TRADER_SYSTEM_INSTRUCTION, NORMAL_LIFE_SYSTEM_INSTRUCTION } from '../constants';
import { generateWithAPI } from '../services/apiService';
import { streamReportGenerate, checkGenerationLimit } from '../services/api/reports';
import { robustParseJSON, validateAstroData } from '../utils/jsonParser';
import LocationMapPicker from './LocationMapPicker';
import ChinaCitySelector from './ChinaCitySelector';
import TelegramLoginButton from './TelegramLoginButton';
import { useAuth } from '../contexts/AuthContext';
import { getProfiles, createProfile, updateProfile, deleteProfile, type Profile, checkTelegramMembership, bindTelegramAccount } from '../services/api';
import type { GenerationLimit } from '../services/api/types';

interface ImportDataModeProps {
    onDataImport: (data: LifeDestinyResult) => void;
}

type Mode = 'choose' | 'trader' | 'normal';
type Step = 1 | 2;

// 基础星盘信息接口
interface BasicChartInfo {
    isDiurnal: boolean; // 昼盘还是夜盘
    sunSign: string; // 太阳星座
    moonSign: string; // 月亮星座
    ascendant: string; // 上升星座
    mc: string; // 天顶星座
    sunHouse: number; // 太阳落宫
    sunStatus: string; // 太阳状态（庙旺陷落）
    sunDegree: number; // 太阳度数
    moonDegree: number; // 月亮度数
}

// 常用城市坐标和时区映射表
const CITY_COORDINATES: Record<string, { latitude: number; longitude: number; timezone: number }> = {
    // === 直辖市 ===
    '北京': { latitude: 39.9042, longitude: 116.4074, timezone: 8.0 },
    '上海': { latitude: 31.2304, longitude: 121.4737, timezone: 8.0 },
    '天津': { latitude: 39.0842, longitude: 117.2010, timezone: 8.0 },
    '重庆': { latitude: 29.4316, longitude: 106.9123, timezone: 8.0 },

    // === 广东省 ===
    '广州': { latitude: 23.1291, longitude: 113.2644, timezone: 8.0 },
    '深圳': { latitude: 22.5431, longitude: 114.0579, timezone: 8.0 },
    '东莞': { latitude: 23.0209, longitude: 113.7518, timezone: 8.0 },
    '佛山': { latitude: 23.0218, longitude: 113.1219, timezone: 8.0 },
    '珠海': { latitude: 22.2711, longitude: 113.5767, timezone: 8.0 },
    '惠州': { latitude: 23.1115, longitude: 114.4152, timezone: 8.0 },
    '中山': { latitude: 22.5170, longitude: 113.3927, timezone: 8.0 },
    '江门': { latitude: 22.5790, longitude: 113.0816, timezone: 8.0 },

    // === 浙江省 ===
    '杭州': { latitude: 30.2741, longitude: 120.1551, timezone: 8.0 },
    '宁波': { latitude: 29.8683, longitude: 121.5440, timezone: 8.0 },
    '温州': { latitude: 28.0006, longitude: 120.6725, timezone: 8.0 },
    '绍兴': { latitude: 30.0365, longitude: 120.5821, timezone: 8.0 },
    '嘉兴': { latitude: 30.7462, longitude: 120.7555, timezone: 8.0 },

    // === 江苏省 ===
    '南京': { latitude: 32.0603, longitude: 118.7969, timezone: 8.0 },
    '苏州': { latitude: 31.2989, longitude: 120.5853, timezone: 8.0 },
    '无锡': { latitude: 31.4912, longitude: 120.3119, timezone: 8.0 },
    '常州': { latitude: 31.8106, longitude: 119.9740, timezone: 8.0 },
    '南通': { latitude: 32.0146, longitude: 120.8945, timezone: 8.0 },
    '扬州': { latitude: 32.3912, longitude: 119.4215, timezone: 8.0 },

    // === 四川省 ===
    '成都': { latitude: 30.5728, longitude: 104.0668, timezone: 8.0 },
    '绵阳': { latitude: 31.4677, longitude: 104.6793, timezone: 8.0 },
    '德阳': { latitude: 31.1270, longitude: 104.3983, timezone: 8.0 },

    // === 陕西省 ===
    '西安': { latitude: 34.3416, longitude: 108.9398, timezone: 8.0 },

    // === 湖北省 ===
    '武汉': { latitude: 30.5928, longitude: 114.3055, timezone: 8.0 },

    // === 湖南省 ===
    '长沙': { latitude: 28.2282, longitude: 112.9388, timezone: 8.0 },

    // === 河南省 ===
    '郑州': { latitude: 34.7466, longitude: 113.6253, timezone: 8.0 },

    // === 山东省 ===
    '济南': { latitude: 36.6512, longitude: 117.1205, timezone: 8.0 },
    '青岛': { latitude: 36.0671, longitude: 120.3826, timezone: 8.0 },
    '烟台': { latitude: 37.4638, longitude: 121.4478, timezone: 8.0 },

    // === 福建省 ===
    '福州': { latitude: 26.0745, longitude: 119.2965, timezone: 8.0 },
    '厦门': { latitude: 24.4798, longitude: 118.0894, timezone: 8.0 },
    '泉州': { latitude: 24.8741, longitude: 118.6758, timezone: 8.0 },

    // === 辽宁省 ===
    '沈阳': { latitude: 41.8057, longitude: 123.4328, timezone: 8.0 },
    '大连': { latitude: 38.9140, longitude: 121.6147, timezone: 8.0 },

    // === 吉林省 ===
    '长春': { latitude: 43.8171, longitude: 125.3235, timezone: 8.0 },

    // === 黑龙江省 ===
    '哈尔滨': { latitude: 45.8038, longitude: 126.5340, timezone: 8.0 },

    // === 云南省 ===
    '昆明': { latitude: 25.0406, longitude: 102.7129, timezone: 8.0 },

    // === 贵州省 ===
    '贵阳': { latitude: 26.6470, longitude: 106.6302, timezone: 8.0 },

    // === 广西壮族自治区 ===
    '南宁': { latitude: 22.8170, longitude: 108.3665, timezone: 8.0 },

    // === 海南省 ===
    '海口': { latitude: 20.0444, longitude: 110.1999, timezone: 8.0 },
    '三亚': { latitude: 18.2528, longitude: 109.5121, timezone: 8.0 },

    // === 港澳台 ===
    '香港': { latitude: 22.3193, longitude: 114.1694, timezone: 8.0 },
    '澳门': { latitude: 22.1987, longitude: 113.5439, timezone: 8.0 },
    '台北': { latitude: 25.0330, longitude: 121.5654, timezone: 8.0 },
    '台中': { latitude: 24.1477, longitude: 120.6736, timezone: 8.0 },
    '高雄': { latitude: 22.6273, longitude: 120.3014, timezone: 8.0 },

    // === 国际城市 ===
    '纽约': { latitude: 40.7128, longitude: -74.0060, timezone: -5.0 },
    '洛杉矶': { latitude: 34.0522, longitude: -118.2437, timezone: -8.0 },
    '伦敦': { latitude: 51.5074, longitude: -0.1278, timezone: 0.0 },
    '巴黎': { latitude: 48.8566, longitude: 2.3522, timezone: 1.0 },
    '东京': { latitude: 35.6762, longitude: 139.6503, timezone: 9.0 },
    '首尔': { latitude: 37.5665, longitude: 126.9780, timezone: 9.0 },
    '新加坡': { latitude: 1.3521, longitude: 103.8198, timezone: 8.0 },
    '悉尼': { latitude: -33.8688, longitude: 151.2093, timezone: 10.0 },
    '温哥华': { latitude: 49.2827, longitude: -123.1207, timezone: -8.0 },
    '多伦多': { latitude: 43.6532, longitude: -79.3832, timezone: -5.0 },

    // 默认坐标（如果找不到城市，使用北京）
    'default': { latitude: 39.9042, longitude: 116.4074, timezone: 8.0 }
};

const ImportDataMode: React.FC<ImportDataModeProps> = ({ onDataImport }) => {
    const { currentUser } = useAuth();
    const [mode, setMode] = useState<Mode>('choose');
    const [step, setStep] = useState<Step>(1);
    const [basicChart, setBasicChart] = useState<BasicChartInfo | null>(null);
    const [houseSystem, setHouseSystem] = useState<string>('P'); // 默认使用 Placidus
    const [astroInfo, setAstroInfo] = useState({
        name: '测试用户',
        gender: 'Male',
        birthYear: '1990',
        birthMonth: '6',
        birthDay: '15',
        birthHour: '14',
        birthMinute: '30',
        birthPlace: '北京',
        latitude: '39.9042',
        longitude: '116.4074',
        timezone: '8.0',
    });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingTime, setLoadingTime] = useState(0);
    const [jsonInput, setJsonInput] = useState('');
    const [copied, setCopied] = useState(false);

    // 地图选择器相关状态
    const [showMapPicker, setShowMapPicker] = useState(false);
    const [citySelectorKey, setCitySelectorKey] = useState(0); // 用于重置城市选择器

    // 验证弹窗相关状态
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [hasClickedFollow, setHasClickedFollow] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    // Telegram 验证相关状态（仅交易员模式）
    const [tgUserId, setTgUserId] = useState('');
    const [tgUsername, setTgUsername] = useState('');
    const [isTgLoggedIn, setIsTgLoggedIn] = useState(false); // 是否已登录 Telegram
    const [isTgBound, setIsTgBound] = useState(false);
    const [isTgVerifying, setIsTgVerifying] = useState(false);
    const [tgError, setTgError] = useState('');

    // 档案管理相关状态
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [selectedProfileId, setSelectedProfileId] = useState<string>('');
    const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);

    // 档案编辑相关状态
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
    const [isDeletingProfile, setIsDeletingProfile] = useState(false);

    // 生成限制相关状态
    const [limitStatus, setLimitStatus] = useState<GenerationLimit | null>(null);
    const [isLoadingLimit, setIsLoadingLimit] = useState(false);

    // API 配置已在后端服务器，前端不需要配置

    // 加载用户档案列表
    useEffect(() => {
        if (currentUser) {
            loadProfiles();
            loadGenerationLimit();
        }
    }, [currentUser]);

    const loadProfiles = async () => {
        if (!currentUser) return;

        setIsLoadingProfiles(true);
        try {
            const profileList = await getProfiles();
            console.log('✅ 档案列表加载成功:', profileList.length, '个档案');
            console.log('📋 档案 ID 列表:', profileList.map(p => p.id));
            console.log('📋 完整档案列表:', profileList.map(p => ({
                id: p.id,
                name: p.profile_name,
                birthDate: `${p.birth_year}-${p.birth_month}-${p.birth_day}`
            })));
            setProfiles(profileList);
        } catch (error: any) {
            console.error('❌ 加载档案列表失败:', error);
            // 静默失败，不影响用户使用
        } finally {
            setIsLoadingProfiles(false);
        }
    };

    // 加载生成限制状态
    const loadGenerationLimit = async () => {
        if (!currentUser) return;

        setIsLoadingLimit(true);
        try {
            const limit = await checkGenerationLimit();
            console.log('✅ 生成限制状态:', limit);
            setLimitStatus(limit);
        } catch (error: any) {
            console.error('❌ 加载生成限制状态失败:', error);
            // 静默失败，不影响用户使用
        } finally {
            setIsLoadingLimit(false);
        }
    };

    // 从档案加载出生信息
    const handleLoadFromProfile = (profileId: string) => {
        console.log('🔍 尝试加载档案:', profileId, 'typeof:', typeof profileId);
        console.log('📋 当前档案列表:', profiles.map(p => ({ id: p.id, type: typeof p.id, name: p.profile_name })));

        if (!profileId) {
            setSelectedProfileId('');
            return;
        }

        // 🔥 修复类型不匹配问题：将两者都转换为字符串进行比较
        const profile = profiles.find(p => String(p.id) === String(profileId));
        if (!profile) {
            console.error('❌ 找不到档案:', profileId);
            console.error('📋 当前档案列表中的所有 ID:', profiles.map(p => p.id));
            alert('找不到选择的档案');
            return;
        }

        console.log('📂 正在加载档案:', profile.profile_name, profile);

        // 将 ID 统一转换为字符串存储
        setSelectedProfileId(String(profile.id));
        setAstroInfo({
            name: profile.profile_name || '未命名',
            gender: profile.gender === 'male' ? 'Male' : profile.gender === 'female' ? 'Female' : 'Male',
            birthYear: profile.birth_year.toString(),
            birthMonth: profile.birth_month.toString(),
            birthDay: profile.birth_day.toString(),
            birthHour: profile.birth_hour.toString(),
            birthMinute: profile.birth_minute.toString(),
            birthPlace: profile.birth_place || '',
            latitude: profile.birth_latitude?.toString() || '',
            longitude: profile.birth_longitude?.toString() || '',
            timezone: profile.timezone || '8.0',
        });

        // 重置城市选择器
        setCitySelectorKey(prev => prev + 1);

        // 显示加载成功提示
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 2000);

        console.log('✅ 档案加载成功:', profile.profile_name);
    };

    // 保存当前输入为档案
    const handleSaveAsProfile = async () => {
        if (!currentUser) {
            alert('请先登录才能保存档案');
            return;
        }

        // 验证必填字段
        if (!astroInfo.birthYear || !astroInfo.birthMonth || !astroInfo.birthDay ||
            !astroInfo.birthHour || !astroInfo.birthMinute) {
            alert('请填写完整的出生日期和时间');
            return;
        }

        setIsSavingProfile(true);
        try {
            const newProfile = await createProfile({
                profileName: astroInfo.name || `档案 ${new Date().toLocaleString()}`,
                gender: astroInfo.gender === 'Male' ? 'male' : astroInfo.gender === 'Female' ? 'female' : 'other',
                birthYear: parseInt(astroInfo.birthYear),
                birthMonth: parseInt(astroInfo.birthMonth),
                birthDay: parseInt(astroInfo.birthDay),
                birthHour: parseInt(astroInfo.birthHour),
                birthMinute: parseInt(astroInfo.birthMinute),
                birthPlace: astroInfo.birthPlace,
                birthLongitude: parseFloat(astroInfo.longitude) || undefined,
                birthLatitude: parseFloat(astroInfo.latitude) || undefined,
                timezone: astroInfo.timezone,
            });

            console.log('✅ 档案保存成功:', newProfile.id);

            // 直接添加新档案到列表（避免重新加载的时间延迟问题）
            setProfiles(prev => [...prev, newProfile]);

            // 设置为当前选中的档案（统一转换为字符串）
            setSelectedProfileId(String(newProfile.id));

            // 显示成功提示
            setShowSaveSuccess(true);
            setTimeout(() => setShowSaveSuccess(false), 3000);
        } catch (error: any) {
            console.error('❌ 保存档案失败:', error);
            alert(`保存档案失败: ${error.message}`);
        } finally {
            setIsSavingProfile(false);
        }
    };

    // 打开编辑档案弹窗
    const handleEditProfile = (profile: Profile) => {
        setEditingProfile(profile);
        setShowEditModal(true);
    };

    // 保存编辑后的档案
    const handleSaveEditProfile = async (updatedData: Partial<Profile>) => {
        if (!editingProfile) return;

        setIsSavingProfile(true);
        try {
            const updated = await updateProfile(String(editingProfile.id), {
                profileName: updatedData.profile_name || editingProfile.profile_name,
                gender: (updatedData.gender || editingProfile.gender) as 'male' | 'female' | 'other',
                birthYear: updatedData.birth_year || editingProfile.birth_year,
                birthMonth: updatedData.birth_month || editingProfile.birth_month,
                birthDay: updatedData.birth_day || editingProfile.birth_day,
                birthHour: updatedData.birth_hour || editingProfile.birth_hour,
                birthMinute: updatedData.birth_minute || editingProfile.birth_minute,
                birthPlace: updatedData.birth_place || editingProfile.birth_place,
                birthLongitude: updatedData.birth_longitude || editingProfile.birth_longitude,
                birthLatitude: updatedData.birth_latitude || editingProfile.birth_latitude,
                timezone: updatedData.timezone || editingProfile.timezone,
            });

            console.log('✅ 档案更新成功:', updated.id);

            // 更新本地档案列表
            setProfiles(prev => prev.map(p =>
                String(p.id) === String(updated.id) ? updated : p
            ));

            // 如果当前选中的是被编辑的档案，更新表单
            if (String(selectedProfileId) === String(updated.id)) {
                setAstroInfo({
                    name: updated.profile_name || '',
                    gender: updated.gender === 'male' ? 'Male' : updated.gender === 'female' ? 'Female' : 'Male',
                    birthYear: updated.birth_year.toString(),
                    birthMonth: updated.birth_month.toString(),
                    birthDay: updated.birth_day.toString(),
                    birthHour: updated.birth_hour.toString(),
                    birthMinute: updated.birth_minute.toString(),
                    birthPlace: updated.birth_place || '',
                    latitude: updated.birth_latitude?.toString() || '',
                    longitude: updated.birth_longitude?.toString() || '',
                    timezone: updated.timezone || '8.0',
                });
            }

            setShowEditModal(false);
            setEditingProfile(null);

            // 显示成功提示
            setShowSaveSuccess(true);
            setTimeout(() => setShowSaveSuccess(false), 2000);
        } catch (error: any) {
            console.error('❌ 更新档案失败:', error);
            alert(`更新档案失败: ${error.message}`);
        } finally {
            setIsSavingProfile(false);
        }
    };

    // 删除档案
    const handleDeleteProfile = async (profileId: string, e?: React.MouseEvent) => {
        e?.stopPropagation();

        if (!confirm('确定要删除这个档案吗？此操作无法撤销。')) {
            return;
        }

        setIsDeletingProfile(true);
        try {
            await deleteProfile(String(profileId));
            console.log('✅ 档案删除成功:', profileId);

            // 从列表中移除
            setProfiles(prev => prev.filter(p => String(p.id) !== String(profileId)));

            // 如果删除的是当前选中的档案，清空选择
            if (String(selectedProfileId) === String(profileId)) {
                setSelectedProfileId('');
            }

            alert('档案已删除');
        } catch (error: any) {
            console.error('❌ 删除档案失败:', error);
            alert(`删除档案失败: ${error.message}`);
        } finally {
            setIsDeletingProfile(false);
        }
    };

    // 处理城市选择，自动填充经纬度和时区
    const handleCitySelect = (cityName: string) => {
        const city = CITY_COORDINATES[cityName];
        if (city) {
            setAstroInfo(prev => ({
                ...prev,
                birthPlace: cityName,
                latitude: city.latitude.toString(),
                longitude: city.longitude.toString(),
                timezone: city.timezone.toString(),
            }));
        }
    };

    // 处理地图选择位置
    const handleMapLocationSelect = (location: { latitude: number; longitude: number; placeName?: string; timezone?: number }) => {
        setAstroInfo(prev => ({
            ...prev,
            birthPlace: location.placeName || prev.birthPlace,
            latitude: location.latitude.toFixed(4),
            longitude: location.longitude.toFixed(4),
            timezone: (location.timezone || 8).toString(),
        }));
        // 重置城市选择器，清空行政区选择状态
        setCitySelectorKey(prev => prev + 1);
    };

    // 处理省市区选择器回调
    const handleCitySelectorSelect = (location: {
        provinceName: string;
        cityName: string;
        districtName?: string;
        latitude: number;
        longitude: number;
        timezone: number;
    }) => {
        const placeName = location.districtName
            ? `${location.provinceName} ${location.cityName} ${location.districtName}`
            : `${location.provinceName} ${location.cityName}`;

        setAstroInfo(prev => ({
            ...prev,
            birthPlace: placeName,
            latitude: location.latitude.toFixed(4),
            longitude: location.longitude.toFixed(4),
            timezone: location.timezone.toString(),
        }));
    };

    // 调用后端 API 计算基础星盘信息
    const calculateBasicChart = async (): Promise<BasicChartInfo> => {
        const year = parseInt(astroInfo.birthYear);
        const month = parseInt(astroInfo.birthMonth);
        const day = parseInt(astroInfo.birthDay);
        const hour = parseInt(astroInfo.birthHour);
        const minute = parseInt(astroInfo.birthMinute);
        const latitude = parseFloat(astroInfo.latitude);
        const longitude = parseFloat(astroInfo.longitude);
        const timezone = parseFloat(astroInfo.timezone);

        // 验证经纬度和时区
        if (isNaN(latitude) || isNaN(longitude) || isNaN(timezone)) {
            throw new Error('请输入有效的经纬度和时区信息');
        }

        // 构造 ISO 格式的出生日期时间
        const birthDatetime = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;

        try {
            // 调用后端星盘计算 API
            // 🔥 在生产环境使用相对路径（通过 Vercel Serverless Function 代理），避免 CORS
            const isDev = import.meta.env.DEV;
            const backendUrl = isDev ? (import.meta.env.VITE_BACKEND_URL || 'http://43.134.98.27:8000') : '';
            const url = backendUrl ? `${backendUrl}/chart/unified` : '/api/calculate-chart';

            console.log('🔮 调用后端星盘计算 API:', url);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    birth_datetime: birthDatetime,
                    latitude: latitude,
                    longitude: longitude,
                    timezone_offset: timezone,
                    house_system: houseSystem,  // 使用用户选择的分宫制
                    gender: astroInfo.gender.toLowerCase(),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || errorData.msg || '星盘计算失败');
            }

            const apiResponse = await response.json();
            console.log('✅ 星盘计算成功（新API格式）:', apiResponse);

            // 检查 API 响应格式
            if (apiResponse.code !== 0 || !apiResponse.data) {
                throw new Error(apiResponse.msg || '星盘计算失败');
            }

            const { data } = apiResponse;
            const { meta, bodies, dignity_data } = data;

            // 提取太阳状态（从 dignity_data 中获取）
            const sunDignity = dignity_data?.Sun;
            let sunStatus = '中性';
            if (sunDignity) {
                switch (sunDignity.dignity) {
                    case 'domicile':
                        sunStatus = '入庙 (Domicile)';
                        break;
                    case 'exaltation':
                        sunStatus = '擢升 (Exaltation)';
                        break;
                    case 'detriment':
                        sunStatus = '失势 (Detriment)';
                        break;
                    case 'fall':
                        sunStatus = '落陷 (Fall)';
                        break;
                    case 'peregrine':
                        sunStatus = '游离 (Peregrine)';
                        break;
                    default:
                        sunStatus = sunDignity.dignity;
                }
            }

            // 根据用户选择的分宫制使用对应的宫位数据
            // W = Whole Sign 使用 whole_sign，其他使用 alchabitius（API 返回的是计算后的分宫制结果）
            const sunHouse = houseSystem === 'W'
                ? bodies.Sun.house_placement.whole_sign
                : bodies.Sun.house_placement.alchabitius.effective;

            return {
                isDiurnal: meta.is_day_chart,
                sunSign: bodies.Sun.sign,
                moonSign: bodies.Moon.sign,
                ascendant: bodies.ASC.sign,
                mc: bodies.MC.sign,
                sunHouse: sunHouse,
                sunStatus: sunStatus,
                sunDegree: bodies.Sun.sign_degree,
                moonDegree: bodies.Moon.sign_degree,
            };

        } catch (error: any) {
            console.error('星盘计算错误:', error);
            throw new Error(`星盘计算失败：${error.message}`);
        }
    };

    // 处理查看星盘
    const handleViewChart = async () => {
        setError(null);
        setIsLoading(true);
        try {
            const chart = await calculateBasicChart();
            setBasicChart(chart);
            setStep(2); // 进入星盘展示步骤

            // 🔥 自动保存档案（仅在用户登录且未选择已有档案时）
            if (currentUser && !selectedProfileId) {
                try {
                    const newProfile = await createProfile({
                        profileName: astroInfo.name || `档案 ${new Date().toLocaleString()}`,
                        gender: astroInfo.gender === 'Male' ? 'male' : astroInfo.gender === 'Female' ? 'female' : 'other',
                        birthYear: parseInt(astroInfo.birthYear),
                        birthMonth: parseInt(astroInfo.birthMonth),
                        birthDay: parseInt(astroInfo.birthDay),
                        birthHour: parseInt(astroInfo.birthHour),
                        birthMinute: parseInt(astroInfo.birthMinute),
                        birthPlace: astroInfo.birthPlace,
                        birthLongitude: parseFloat(astroInfo.longitude) || undefined,
                        birthLatitude: parseFloat(astroInfo.latitude) || undefined,
                        timezone: astroInfo.timezone,
                    });
                    console.log('✅ 档案自动保存成功:', newProfile.id);
                    console.log('📦 新档案完整数据:', newProfile);

                    // 直接添加新档案到列表（避免重新加载的时间延迟问题）
                    setProfiles(prev => {
                        const updated = [...prev, newProfile];
                        console.log('📋 更新后的档案列表:', updated.map(p => ({ id: p.id, name: p.profile_name })));
                        return updated;
                    });

                    // 设置为当前选中的档案（统一转换为字符串）
                    setSelectedProfileId(String(newProfile.id));
                    console.log('🎯 已设置选中档案 ID:', newProfile.id, 'typeof:', typeof newProfile.id);
                } catch (error: any) {
                    console.error('⚠️ 档案保存失败（不影响继续使用）:', error);
                    // 静默失败，不影响用户继续使用
                }
            }
        } catch (err: any) {
            setError(`计算星盘失败：${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // 生成用户提示词
    const generateUserPrompt = () => {
        const genderStr = astroInfo.gender === 'Male' ? '男' : '女';
        const analysisType = mode === 'trader' ? '交易员财富' : '人生';

        // 如果有基础星盘信息，包含到 prompt 中
        const chartInfo = basicChart ? `
【星盘基础信息（由专业天文算法计算）】

📊 出生地理信息：
- 纬度：${astroInfo.latitude}°
- 经度：${astroInfo.longitude}°
- 时区：UTC${parseFloat(astroInfo.timezone) >= 0 ? '+' : ''}${astroInfo.timezone}

🌓 盘性 (Sect)：
${basicChart.isDiurnal ? '昼盘 (Day Chart) - 太阳在地平线以上，时主光体为太阳' : '夜盘 (Night Chart) - 太阳在地平线以下，时主光体为月亮'}

☀️ 太阳 (Sun)：
- 星座：${basicChart.sunSign}
- 宫位：第 ${basicChart.sunHouse} 宫
- 状态：${basicChart.sunStatus}
- 黄道度数：${basicChart.sunDegree.toFixed(2)}°

🌙 月亮 (Moon)：
- 星座：${basicChart.moonSign}
- 黄道度数：${basicChart.moonDegree.toFixed(2)}°

🎯 四轴点 (Angular Houses)：
- 上升点 (ASC)：${basicChart.ascendant}
- 天顶 (MC)：${basicChart.mc}

💡 **重要提示**：以上星盘数据由专业占星天文算法计算得出，请严格基于这些数据进行分析，而不是重新推算。这些数据包含了精确的经纬度、时区、宫位系统等信息，是准确的星盘配置。

请在分析时：
1. 直接使用上述星盘数据作为分析基础
2. 基于这些精确的行星位置、宫位配置进行深入解读
3. 结合盘性（昼/夜盘）判断各行星的力量强弱
4. 分析太阳、月亮的星座、宫位、度数对命主的影响
5. 考虑四轴点（ASC、MC）对人格与人生方向的塑造
` : '';

        return `请根据以下出生信息进行${analysisType}占星分析。

【基本信息】
性别：${genderStr}
姓名：${astroInfo.name || "未提供"}

【出生日期时间（阳历、公历）】
出生年份：${astroInfo.birthYear} 年
出生月份：${astroInfo.birthMonth} 月
出生日：${astroInfo.birthDay} 日
出生时间：${astroInfo.birthHour} 时 ${astroInfo.birthMinute || "00"} 分
${astroInfo.birthPlace ? `出生地点：${astroInfo.birthPlace}` : ''}

${chartInfo}
【行运阶段参数】
1. 起运年龄：1 岁 (虚岁)。
2. 第一阶段行运标签：木星主导扩张期。
3. 阶段排序方向：顺行 (Forward)。

请严格按照系统指令的 JSON 格式输出，不要添加 markdown 标记。`;
    };

    // 复制完整提示词
    const copyFullPrompt = async () => {
        const systemPrompt = mode === 'trader' ? TRADER_SYSTEM_INSTRUCTION : NORMAL_LIFE_SYSTEM_INSTRUCTION;
        const fullPrompt = `=== 系统指令 (System Prompt) ===\n\n${systemPrompt}\n\n=== 用户提示词 (User Prompt) ===\n\n${generateUserPrompt()}`;

        try {
            await navigator.clipboard.writeText(fullPrompt);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('复制失败', err);
        }
    };

    // 解析 JSON 内容的辅助函数
    const parseJSONContent = (jsonContent: string, currentMode: Mode): LifeDestinyResult => {
        // 尝试从可能包含 markdown 的内容中提取 JSON
        let content = jsonContent.trim();

        console.log('📝 原始内容长度:', content.length);
        console.log('📝 原始内容前 200 字符:', content.slice(0, 200));
        console.log('📝 原始内容后 200 字符:', content.slice(-200));

        // 提取 ```json ... ``` 中的内容
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
            content = jsonMatch[1].trim();
            console.log('✅ 从 markdown 代码块中提取 JSON');
        } else {
            // 尝试找到 JSON 对象
            const jsonStartIndex = content.indexOf('{');
            const jsonEndIndex = content.lastIndexOf('}');
            if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
                content = content.substring(jsonStartIndex, jsonEndIndex + 1);
                console.log('✅ 提取 JSON 对象:', { start: jsonStartIndex, end: jsonEndIndex });
            }
        }

        console.log('📝 清理后的内容长度:', content.length);

        // 🔧 修复常见的 JSON 问题
        // 1. 移除尾随逗号（数组末尾）
        content = content.replace(/,(\s*)\]/g, '$1]');
        // 2. 移除尾随逗号（对象末尾）
        content = content.replace(/,(\s*)\}/g, '$1}');
        // 3. 移除可能的注释
        content = content.replace(/\/\/.*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');

        console.log('🔧 开始解析 JSON...');

        // 使用健壮的 JSON 解析工具
        let data;
        try {
            data = robustParseJSON(content);
            console.log('✅ JSON 解析成功');
        } catch (err: any) {
            throw new Error(err.message);
        }

        // 校验数据结构
        const validation = validateAstroData(data);
        if (!validation.valid) {
            throw new Error(`数据格式验证失败：\n${validation.errors.join('\n')}`);
        }

        // 根据模式设置不同的默认文案
        const isTrader = currentMode === 'trader';

        // 转换为应用所需格式
        return {
            chartData: data.chartPoints,
            analysis: {
                birthChart: data.birthChart || "星盘信息未提供",
                summary: data.summary || (isTrader ? "交易员财富格局总评" : "人生格局总评"),
                summaryScore: data.summaryScore || 85,

                // 设置标题和内容
                traderVitalityTitle: isTrader ? "交易生命力与抗压指数" : "性格特质与生命力",
                traderVitality: data.traderVitality || data.personality || (isTrader ? "交易生命力与抗压指数分析" : "性格特质与生命力分析"),
                traderVitalityScore: data.traderVitalityScore || data.personalityScore || 88,

                wealthPotentialTitle: isTrader ? "财富量级与来源结构" : "财富与物质安全感",
                wealthPotential: data.wealthPotential || data.wealth || (isTrader ? "财富量级与来源结构分析" : "财富与物质安全感分析"),
                wealthPotentialScore: data.wealthPotentialScore || data.wealthScore || 82,

                fortuneLuckTitle: isTrader ? "运气与天选财富" : "情感婚姻与亲密关系",
                fortuneLuck: data.fortuneLuck || data.marriage || (isTrader ? "运气与天选财富潜力分析" : "情感婚姻与亲密关系分析"),
                fortuneLuckScore: data.fortuneLuckScore || data.marriageScore || 90,

                leverageRiskTitle: isTrader ? "杠杆与风险管理能力" : "事业发展与社会角色",
                leverageRisk: data.leverageRisk || data.industry || (isTrader ? "杠杆与风险管理能力分析" : "事业发展与社会角色分析"),
                leverageRiskScore: data.leverageRiskScore || data.industryScore || 75,

                platformTeamTitle: isTrader ? "平台与团队红利" : "家庭关系与社会支持",
                platformTeam: data.platformTeam || data.family || (isTrader ? "平台与团队红利潜力分析" : "家庭关系与社会支持分析"),
                platformTeamScore: data.platformTeamScore || data.familyScore || 80,

                tradingStyleTitle: isTrader ? "适合的交易风格与策略" : "健康状况与生活方式",
                tradingStyle: data.tradingStyle || data.health || (isTrader ? "交易风格与策略匹配分析" : "健康状况与生活方式分析"),
                tradingStyleScore: data.tradingStyleScore || data.healthScore || 85,

                // 新增的两个维度（仅普通盘）
                intimacyEnergyTitle: "亲密能量与深度连接能力",
                intimacyEnergy: data.intimacyEnergy || (isTrader ? undefined : "亲密能量与深度连接能力分析"),
                intimacyEnergyScore: data.intimacyEnergyScore || (isTrader ? undefined : 85),

                sexualCharmTitle: "性魅力与吸引力",
                sexualCharm: data.sexualCharm || (isTrader ? undefined : "性魅力与吸引力分析"),
                sexualCharmScore: data.sexualCharmScore || (isTrader ? undefined : 85),

                keyYears: data.keyYears,
                peakPeriods: data.peakPeriods,
                riskPeriods: data.riskPeriods,
            },
        };
    };

    // 手动导入 JSON
    const handleImport = () => {
        setError(null);

        if (!jsonInput.trim()) {
            setError('请粘贴 AI 返回的 JSON 数据');
            return;
        }

        try {
            const result = parseJSONContent(jsonInput, mode);
            onDataImport(result);
        } catch (err: any) {
            setError(`解析失败：${err.message}`);
        }
    };

    // 点击生成按钮 - 先检查限制，再显示验证弹窗
    const handleAutoGenerate = async () => {
        // 先检查生成限制
        try {
            const limit = await checkGenerationLimit();
            setLimitStatus(limit);

            if (!limit.allowed) {
                const resetDate = new Date(limit.resetAt);
                setError(`今日生成次数已用完（${limit.used}/${limit.limit}），将在 ${resetDate.toLocaleString('zh-CN', {
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                })} 重置`);
                return;
            }
        } catch (err: any) {
            console.error('检查生成限制失败:', err);
            // 如果检查失败，允许继续（避免影响用户体验）
        }

        // 🔥 交易员模式：需要验证 Telegram 会员身份
        if (mode === 'trader') {
            // TODO: 从后端获取用户的 Telegram 绑定状态
            // 暂时假设用户未绑定，需要在验证弹窗中处理
            setIsTgBound(false);
            setTgError('');
        }

        setShowVerifyModal(true);
        setHasClickedFollow(false);
        setIsVerifying(false);
        setTgUserId('');
        setTgUsername('');
        setIsTgLoggedIn(false);
    };

    // 点击"前往关注"按钮
    const handleClickFollow = () => {
        window.open('https://t.me/themoon_dojo', '_blank');
        setHasClickedFollow(true);
    };

    // 处理 Telegram 登录成功（来自 Telegram Login Widget）
    const handleTelegramLogin = (user: any) => {
        console.log('🎉 Telegram 登录成功:', user);
        setTgUserId(user.id.toString());
        setTgUsername(user.username || `${user.first_name}${user.last_name ? ' ' + user.last_name : ''}`);
        setIsTgLoggedIn(true);
        setTgError('');
    };

    // Telegram 绑定和验证
    const handleTelegramBind = async () => {
        if (!tgUserId.trim()) {
            setTgError('请输入您的 Telegram ID');
            return;
        }

        const tgId = parseInt(tgUserId.trim());
        if (isNaN(tgId)) {
            setTgError('Telegram ID 必须是数字');
            return;
        }

        setIsTgVerifying(true);
        setTgError('');

        try {
            // 1. 先检查用户是否在频道内
            console.log('🔍 检查 Telegram 用户是否在频道内:', tgId);
            const memberCheck = await checkTelegramMembership(tgId);

            if (!memberCheck.isMember) {
                setTgError('您不在频道内，请先加入 Telegram 频道');
                setIsTgVerifying(false);
                window.open('https://t.me/themoon_dojo', '_blank');
                return;
            }

            // 2. 用户在频道内，执行绑定
            console.log('✅ 用户在频道内，开始绑定...');
            const bindResult = await bindTelegramAccount({
                tg_user_id: tgId,
                tg_username: tgUsername.trim() || memberCheck.user?.username || undefined,
            });

            console.log('✅ Telegram 账号绑定成功:', bindResult);
            setIsTgBound(true);
            setHasClickedFollow(true); // 标记已完成第一步

        } catch (error: any) {
            console.error('❌ Telegram 验证失败:', error);
            if (error.message.includes('not in channel')) {
                setTgError('您不在频道内，请先加入频道');
                window.open('https://t.me/themoon_dojo', '_blank');
            } else if (error.message.includes('already bound')) {
                setTgError('该 Telegram 账号已被其他用户绑定');
            } else {
                setTgError(error.message || '验证失败，请稍后重试');
            }
        } finally {
            setIsTgVerifying(false);
        }
    };

    // 点击"验证"按钮
    const handleVerify = async () => {
        // 🔥 交易员模式：必须先绑定和验证 Telegram
        if (mode === 'trader' && !isTgBound) {
            setTgError('请先完成 Telegram 账号绑定');
            return;
        }

        setIsVerifying(true);

        // 假加载 2 秒
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 关闭弹窗并开始真正的 AI 生成
        setShowVerifyModal(false);
        setIsVerifying(false);
        executeAIGeneration();
    };

    // 真正执行 AI 生成的函数
    const executeAIGeneration = async () => {
        setError(null);
        setIsLoading(true);
        setLoadingTime(0);

        // 启动计时器，每秒更新一次
        const startTime = Date.now();
        const timer = setInterval(() => {
            setLoadingTime(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);

        try {
            // 校验出生信息
            const year = parseInt(astroInfo.birthYear);
            const month = parseInt(astroInfo.birthMonth);
            const day = parseInt(astroInfo.birthDay);
            const hour = parseInt(astroInfo.birthHour);
            const minute = parseInt(astroInfo.birthMinute);

            if (year < 1900 || year > 2100) {
                throw new Error('出生年份必须在 1900-2100 之间');
            }
            if (month < 1 || month > 12) {
                throw new Error('出生月份必须在 1-12 之间');
            }
            if (day < 1 || day > 31) {
                throw new Error('出生日期必须在 1-31 之间');
            }
            if (hour < 0 || hour > 23) {
                throw new Error('出生小时必须在 0-23 之间');
            }
            if (minute < 0 || minute > 59) {
                throw new Error('出生分钟必须在 0-59 之间');
            }

            // 生成用户提示词
            const userPrompt = generateUserPrompt();

            // 根据模式选择系统指令
            const systemPrompt = mode === 'trader' ? TRADER_SYSTEM_INSTRUCTION : NORMAL_LIFE_SYSTEM_INSTRUCTION;

            // 生成报告标题
            const reportTitle = `${astroInfo.name || '匿名用户'}的${mode === 'trader' ? '交易员财富' : '综合人生'}占星报告`;

            // 调用新后端流式生成 API（会自动保存到数据库）
            console.log('🚀 调用新后端生成报告（会自动保存到数据库）...');
            let content = '';

            try {
                const stream = streamReportGenerate({
                    systemPrompt,
                    userPrompt,
                    chartId: undefined, // 暂时不传 chartId
                    profileId: selectedProfileId || undefined,
                    reportTitle,
                });

                // 累积流式响应内容
                for await (const chunk of stream) {
                    content += chunk;
                }

                console.log('✅ 报告生成完成，已自动保存到数据库');

                // 生成成功后刷新限制状态
                loadGenerationLimit();
            } catch (streamError: any) {
                // 检查是否为 429 限流错误
                if (streamError.message.includes('Daily generation limit reached') ||
                    streamError.message.includes('生成上限')) {
                    // 刷新限制状态以获取最新信息
                    await loadGenerationLimit();
                    throw new Error('今日生成次数已用完，请明天再试');
                }

                // 如果新后端失败，回退到旧后端
                console.warn('⚠️ 新后端失败，回退到旧后端:', streamError.message);
                content = await generateWithAPI({
                    userPrompt,
                    systemPrompt,
                });
            }

            // 使用健壮的 JSON 解析工具
            try {
                const data = robustParseJSON(content);

                // 校验数据结构
                const validation = validateAstroData(data);
                if (!validation.valid) {
                    throw new Error(`数据格式验证失败：\n${validation.errors.join('\n')}`);
                }

                // 根据模式设置不同的默认文案
                const isTrader = mode === 'trader';

                // 转换为应用所需格式
                const result = {
                    chartData: data.chartPoints,
                    analysis: {
                        birthChart: data.birthChart || "星盘信息未提供",
                        summary: data.summary || (isTrader ? "交易员财富格局总评" : "人生格局总评"),
                        summaryScore: data.summaryScore || 85,

                        // 设置标题和内容
                        traderVitalityTitle: isTrader ? "交易生命力与抗压指数" : "性格特质与生命力",
                        traderVitality: data.traderVitality || data.personality || (isTrader ? "交易生命力与抗压指数分析" : "性格特质与生命力分析"),
                        traderVitalityScore: data.traderVitalityScore || data.personalityScore || 88,

                        wealthPotentialTitle: isTrader ? "财富量级与来源结构" : "财富与物质安全感",
                        wealthPotential: data.wealthPotential || data.wealth || (isTrader ? "财富量级与来源结构分析" : "财富与物质安全感分析"),
                        wealthPotentialScore: data.wealthPotentialScore || data.wealthScore || 82,

                        fortuneLuckTitle: isTrader ? "运气与天选财富" : "情感婚姻与亲密关系",
                        fortuneLuck: data.fortuneLuck || data.marriage || (isTrader ? "运气与天选财富潜力分析" : "情感婚姻与亲密关系分析"),
                        fortuneLuckScore: data.fortuneLuckScore || data.marriageScore || 90,

                        leverageRiskTitle: isTrader ? "杠杆与风险管理能力" : "事业发展与社会角色",
                        leverageRisk: data.leverageRisk || data.industry || (isTrader ? "杠杆与风险管理能力分析" : "事业发展与社会角色分析"),
                        leverageRiskScore: data.leverageRiskScore || data.industryScore || 75,

                        platformTeamTitle: isTrader ? "平台与团队红利" : "家庭关系与社会支持",
                        platformTeam: data.platformTeam || data.family || (isTrader ? "平台与团队红利潜力分析" : "家庭关系与社会支持分析"),
                        platformTeamScore: data.platformTeamScore || data.familyScore || 80,

                        tradingStyleTitle: isTrader ? "适合的交易风格与策略" : "健康状况与生活方式",
                        tradingStyle: data.tradingStyle || data.health || (isTrader ? "交易风格与策略匹配分析" : "健康状况与生活方式分析"),
                        tradingStyleScore: data.tradingStyleScore || data.healthScore || 85,

                        // 新增的两个维度（仅普通盘）
                        intimacyEnergyTitle: "亲密能量与深度连接能力",
                        intimacyEnergy: data.intimacyEnergy || (isTrader ? undefined : "亲密能量与深度连接能力分析"),
                        intimacyEnergyScore: data.intimacyEnergyScore || (isTrader ? undefined : 85),

                        sexualCharmTitle: "性魅力与吸引力",
                        sexualCharm: data.sexualCharm || (isTrader ? undefined : "性魅力与吸引力分析"),
                        sexualCharmScore: data.sexualCharmScore || (isTrader ? undefined : 85),

                        keyYears: data.keyYears,
                        peakPeriods: data.peakPeriods,
                        riskPeriods: data.riskPeriods,
                    },
                };

                console.log('✅ 数据解析和转换成功');
                onDataImport(result);
            } catch (parseErr: any) {
                throw new Error(parseErr.message || 'JSON 解析失败，请检查返回格式');
            }
        } catch (err: any) {
            setError(`生成失败：${err.message}`);
        } finally {
            clearInterval(timer);
            setIsLoading(false);
            setLoadingTime(0);
        }
    };

    const handleAstroChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setAstroInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const isStep1Valid = astroInfo.birthYear && astroInfo.birthMonth && astroInfo.birthDay && astroInfo.birthHour && astroInfo.latitude && astroInfo.longitude && astroInfo.timezone;
    const isAutoValid = isStep1Valid; // API 配置已内置

    return (
        <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            {/* 模式选择 */}
            {mode === 'choose' && (
                <div className="space-y-6">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold font-serif-sc text-gray-800 mb-3">选择分析类型</h2>
                        <p className="text-gray-500 text-sm">请选择您想要的占星分析模式</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 专业交易者模式 */}
                        <button
                            onClick={() => { setMode('trader'); setStep(1); setHouseSystem('W'); }}
                            className="group relative bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white p-6 rounded-2xl shadow-lg transition-all transform hover:scale-105 hover:shadow-2xl"
                        >
                            <div className="absolute inset-0 bg-black/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative z-10">
                                <div className="flex justify-center mb-4">
                                    <div className="p-4 bg-white/20 rounded-full">
                                        <TrendingUp className="w-10 h-10" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold mb-2">💰 专业交易者</h3>
                                <p className="text-sm text-white/90 mb-4">
                                    专注财富格局、风险管理与交易策略分析
                                </p>
                                <div className="text-xs text-white/80 space-y-1">
                                    <div>📈 财富量级评估</div>
                                    <div>⚖️ 风险管理能力</div>
                                    <div>🎯 交易风格匹配</div>
                                </div>
                            </div>
                        </button>

                        {/* 综合人生模式 */}
                        <button
                            onClick={() => { setMode('normal'); setStep(1); setHouseSystem('P'); }}
                            className="group relative bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white p-6 rounded-2xl shadow-lg transition-all transform hover:scale-105 hover:shadow-2xl"
                        >
                            <div className="absolute inset-0 bg-black/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative z-10">
                                <div className="flex justify-center mb-4">
                                    <div className="p-4 bg-white/20 rounded-full">
                                        <Heart className="w-10 h-10" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold mb-2">🌟 综合人生</h3>
                                <p className="text-sm text-white/90 mb-4">
                                    全面分析性格、情感、事业、健康等人生领域
                                </p>
                                <div className="text-xs text-white/80 space-y-1">
                                    <div>💖 情感婚姻分析</div>
                                    <div>💼 事业发展方向</div>
                                    <div>🏥 健康生活建议</div>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {/* 步骤指示器 */}
            {mode !== 'choose' && (
                <div className="flex items-center justify-center gap-2 mb-8">
                {[1, 2].map((s) => (
                    <React.Fragment key={s}>
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step === s
                                ? 'bg-indigo-600 text-white scale-110'
                                : step > s
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-200 text-gray-500'
                                }`}
                        >
                            {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                        </div>
                        {s < 2 && <div className={`w-16 h-1 rounded ${step > s ? 'bg-green-500' : 'bg-gray-200'}`} />}
                    </React.Fragment>
                ))}
            </div>
            )}

            {/* 返回模式选择按钮 */}
            {mode !== 'choose' && (
                <button
                    onClick={() => { setMode('choose'); setStep(1); setError(null); }}
                    className="mb-6 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                    ← 返回选择模式
                </button>
            )}

            {/* 步骤 1: 输入占星信息 */}
            {step === 1 && mode !== 'choose' && (
                <div className="space-y-6">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold font-serif-sc text-gray-800 mb-2">
                            输入出生信息
                        </h2>
                        <p className="text-gray-500 text-sm">
                            填写出生信息后即可一键生成 {mode === 'trader' ? '交易员财富' : '人生'}分析报告
                        </p>
                    </div>

                    {/* 档案快速加载区域 */}
                    {currentUser && profiles.length > 0 && (
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200 mb-4">
                            <div className="flex items-center gap-2 mb-3">
                                <BookOpen className="w-4 h-4 text-purple-600" />
                                <span className="text-sm font-bold text-purple-800">我的档案 ({profiles.length})</span>
                                {isLoadingProfiles && <Loader2 className="w-3 h-3 animate-spin text-purple-600" />}
                            </div>

                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {profiles.map(profile => (
                                    <div
                                        key={profile.id}
                                        className={`group flex items-center justify-between p-3 rounded-lg border-2 transition-all cursor-pointer ${
                                            String(selectedProfileId) === String(profile.id)
                                                ? 'bg-purple-100 border-purple-400'
                                                : 'bg-white border-purple-200 hover:border-purple-300 hover:bg-purple-50'
                                        }`}
                                        onClick={() => handleLoadFromProfile(String(profile.id))}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-gray-800 truncate text-sm">
                                                {profile.profile_name || '未命名'}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {profile.birth_year}-{profile.birth_month}-{profile.birth_day} {profile.birth_hour}:{String(profile.birth_minute).padStart(2, '0')}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 ml-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditProfile(profile);
                                                }}
                                                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                                title="编辑档案"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={(e) => handleDeleteProfile(String(profile.id), e)}
                                                disabled={isDeletingProfile}
                                                className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                                                title="删除档案"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <p className="text-xs text-gray-500 mt-3">
                                💡 提示：点击档案快速加载，点击"查看基础星盘"后会自动保存新档案
                            </p>

                            {/* 档案操作成功提示 */}
                            {showSaveSuccess && (
                                <div className="mt-3 p-2 bg-green-100 border border-green-300 rounded-lg flex items-center gap-2 text-green-800 text-sm">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>操作成功！</span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">姓名 (可选)</label>
                            <input
                                type="text"
                                name="name"
                                value={astroInfo.name}
                                onChange={handleAstroChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="姓名"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">性别</label>
                            <select
                                name="gender"
                                value={astroInfo.gender}
                                onChange={handleAstroChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="Male">男</option>
                                <option value="Female">女</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-2 mb-3 text-blue-800 text-sm font-bold">
                            <Sparkles className="w-4 h-4" />
                            <span>出生日期时间 (阳历/公历)</span>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">年</label>
                                <input
                                    type="number"
                                    name="birthYear"
                                    value={astroInfo.birthYear}
                                    onChange={handleAstroChange}
                                    placeholder="1990"
                                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-bold text-center"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">月</label>
                                <input
                                    type="number"
                                    name="birthMonth"
                                    value={astroInfo.birthMonth}
                                    onChange={handleAstroChange}
                                    placeholder="6"
                                    min="1"
                                    max="12"
                                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-bold text-center"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">日</label>
                                <input
                                    type="number"
                                    name="birthDay"
                                    value={astroInfo.birthDay}
                                    onChange={handleAstroChange}
                                    placeholder="15"
                                    min="1"
                                    max="31"
                                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-bold text-center"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">时 (0-23)</label>
                                <input
                                    type="number"
                                    name="birthHour"
                                    value={astroInfo.birthHour}
                                    onChange={handleAstroChange}
                                    placeholder="14"
                                    min="0"
                                    max="23"
                                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-bold text-center"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">分 (0-59)</label>
                                <input
                                    type="number"
                                    name="birthMinute"
                                    value={astroInfo.birthMinute}
                                    onChange={handleAstroChange}
                                    placeholder="30"
                                    min="0"
                                    max="59"
                                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-bold text-center"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                        <div className="flex items-center gap-2 mb-3 text-green-800 text-sm font-bold">
                            <Sparkles className="w-4 h-4" />
                            <span>出生地点与坐标</span>
                        </div>

                        {/* 省市区选择器 */}
                        <div className="mb-3">
                            <ChinaCitySelector key={citySelectorKey} onSelect={handleCitySelectorSelect} />
                            <div className="mt-2 text-center">
                                <button
                                    type="button"
                                    onClick={() => setShowMapPicker(true)}
                                    className="text-xs text-blue-600 hover:text-blue-800 underline flex items-center gap-1 mx-auto"
                                >
                                    <MapPin className="w-3 h-3" />
                                    <span>找不到出生地？点击地图选择</span>
                                </button>
                            </div>
                        </div>

                        {/* 经纬度和时区输入 */}
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">纬度</label>
                                <input
                                    type="number"
                                    step="0.0001"
                                    name="latitude"
                                    value={astroInfo.latitude}
                                    onChange={handleAstroChange}
                                    placeholder="39.9042"
                                    className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">经度</label>
                                <input
                                    type="number"
                                    step="0.0001"
                                    name="longitude"
                                    value={astroInfo.longitude}
                                    onChange={handleAstroChange}
                                    placeholder="116.4074"
                                    className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">时区 (UTC)</label>
                                <input
                                    type="number"
                                    step="0.5"
                                    name="timezone"
                                    value={astroInfo.timezone}
                                    onChange={handleAstroChange}
                                    placeholder="8.0"
                                    className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white text-sm"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-green-600/70 mt-2">💡 也可以手动输入精确的经纬度和时区</p>
                    </div>

                    {/* 分宫制选择器 */}
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                        <div className="flex items-center gap-2 mb-3 text-purple-800 text-sm font-bold">
                            <Sparkles className="w-4 h-4" />
                            <span>分宫制系统 (House System)</span>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-2">
                                选择分宫制
                                <span className="ml-2 text-xs font-normal text-purple-600">
                                    {mode === 'trader' ? '(交易员版本默认：整宫制)' : '(普通版本默认：普拉西度)'}
                                </span>
                            </label>
                            <select
                                value={houseSystem}
                                onChange={(e) => setHouseSystem(e.target.value)}
                                className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white font-bold"
                            >
                                <option value="P">Placidus - 普拉西度制（最常用）</option>
                                <option value="W">Whole Sign - 整宫制</option>
                                <option value="K">Koch - 科赫制</option>
                                <option value="E">Equal - 等宫制</option>
                                <option value="B">Alcabitius - 阿尔卡比修斯制</option>
                                <option value="R">Regiomontanus - 雷格蒙塔努斯制</option>
                                <option value="C">Campanus - 坎帕纳斯制</option>
                            </select>
                        </div>
                        <div className="mt-2 text-xs text-purple-600/80 bg-white/50 p-2 rounded">
                            💡 不同分宫制会影响宫位的划分方式。{mode === 'trader' ? '交易员版本推荐使用整宫制(W)。' : '普通版本推荐使用普拉西度制(P)。'}
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-start gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg border border-red-200">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <div className="text-sm whitespace-pre-line">{error}</div>
                        </div>
                    )}

                    <button
                        onClick={handleViewChart}
                        disabled={!isStep1Valid}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3.5 rounded-xl shadow-lg transform transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <Sparkles className="w-5 h-5" />
                        <span>查看基础星盘</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* 步骤 2: 基础星盘信息 */}
            {step === 2 && mode !== 'choose' && basicChart && (
                <div className="space-y-6">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold font-serif-sc text-gray-800 mb-2">基础星盘信息</h2>
                        <p className="text-gray-500 text-sm">根据您的出生信息计算的基础星盘配置</p>
                    </div>

                    {/* 出生信息确认 */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <div className="text-sm text-gray-700 space-y-1">
                            <div><span className="font-bold">姓名：</span>{astroInfo.name}</div>
                            <div><span className="font-bold">性别：</span>{astroInfo.gender === 'Male' ? '男' : '女'}</div>
                            <div><span className="font-bold">出生日期：</span>{astroInfo.birthYear}年{astroInfo.birthMonth}月{astroInfo.birthDay}日</div>
                            <div><span className="font-bold">出生时间：</span>{astroInfo.birthHour}时{astroInfo.birthMinute}分</div>
                            {astroInfo.birthPlace && (
                                <div><span className="font-bold">出生地点：</span>{astroInfo.birthPlace}</div>
                            )}
                            <div>
                                <span className="font-bold">分宫制：</span>
                                {houseSystem === 'P' && 'Placidus (普拉西度制)'}
                                {houseSystem === 'W' && 'Whole Sign (整宫制)'}
                                {houseSystem === 'K' && 'Koch (科赫制)'}
                                {houseSystem === 'E' && 'Equal (等宫制)'}
                                {houseSystem === 'B' && 'Alcabitius (阿尔卡比修斯制)'}
                                {houseSystem === 'R' && 'Regiomontanus (雷格蒙塔努斯制)'}
                                {houseSystem === 'C' && 'Campanus (坎帕纳斯制)'}
                            </div>
                        </div>
                    </div>

                    {/* 昼夜盘 */}
                    <div className="bg-gradient-to-br from-yellow-50 to-blue-50 p-5 rounded-xl border-2 border-yellow-200">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="text-3xl">{basicChart.isDiurnal ? '☀️' : '🌙'}</div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">
                                    {basicChart.isDiurnal ? '昼盘 (Day Chart)' : '夜盘 (Night Chart)'}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {basicChart.isDiurnal ? '太阳在地平线以上' : '太阳在地平线以下'}
                                </p>
                            </div>
                        </div>
                        <div className="text-xs text-gray-500 bg-white/50 p-2 rounded">
                            💡 昼盘利于太阳、木星、土星；夜盘利于月亮、金星、火星
                        </div>
                    </div>

                    {/* 主要行星位置 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 太阳 */}
                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">☉</span>
                                <h4 className="font-bold text-gray-800">太阳 (Sun)</h4>
                            </div>
                            <div className="space-y-1 text-sm">
                                <div><span className="text-gray-600">星座：</span><span className="font-bold">{basicChart.sunSign}</span></div>
                                <div><span className="text-gray-600">宫位：</span><span className="font-bold">第 {basicChart.sunHouse} 宫</span></div>
                                <div><span className="text-gray-600">状态：</span><span className="font-bold">{basicChart.sunStatus}</span></div>
                            </div>
                        </div>

                        {/* 月亮 */}
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">☽</span>
                                <h4 className="font-bold text-gray-800">月亮 (Moon)</h4>
                            </div>
                            <div className="space-y-1 text-sm">
                                <div><span className="text-gray-600">星座：</span><span className="font-bold">{basicChart.moonSign}</span></div>
                                <div className="text-xs text-gray-500 mt-2">情绪与潜意识的反应模式</div>
                            </div>
                        </div>
                    </div>

                    {/* 四轴点 */}
                    <div className="bg-purple-50 p-5 rounded-xl border-2 border-purple-200">
                        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <span className="text-xl">✨</span>
                            四轴点 (Angular Houses)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="bg-white p-3 rounded-lg">
                                <div className="text-xs text-gray-500 mb-1">上升点 (ASC)</div>
                                <div className="font-bold text-purple-700">{basicChart.ascendant}</div>
                                <div className="text-xs text-gray-500 mt-1">自我呈现、外在形象</div>
                            </div>
                            <div className="bg-white p-3 rounded-lg">
                                <div className="text-xs text-gray-500 mb-1">天顶 (MC)</div>
                                <div className="font-bold text-purple-700">{basicChart.mc}</div>
                                <div className="text-xs text-gray-500 mt-1">事业方向、公众形象</div>
                            </div>
                        </div>
                    </div>

                    {/* 说明 */}
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-amber-800">
                                <p className="font-bold mb-1">⚠️ 简化计算说明</p>
                                <p className="text-xs">上升星座、月亮星座等信息为估算值。精确计算需要出生地的经纬度坐标和专业天文历表。以上信息仅供参考，完整的AI分析将基于您提供的所有信息进行。</p>
                            </div>
                        </div>
                    </div>

                    {/* 生成限制提示 */}
                    {limitStatus && (
                        <div className={`p-4 rounded-xl border-2 ${
                            limitStatus.allowed
                                ? 'bg-green-50 border-green-200'
                                : 'bg-red-50 border-red-200'
                        }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {limitStatus.allowed ? (
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5 text-red-600" />
                                    )}
                                    <div>
                                        <p className={`text-sm font-bold ${
                                            limitStatus.allowed ? 'text-green-800' : 'text-red-800'
                                        }`}>
                                            今日剩余生成次数：
                                            <span className="text-lg mx-1">{limitStatus.remaining}/{limitStatus.limit}</span>
                                        </p>
                                        {!limitStatus.allowed && (
                                            <p className="text-xs text-red-600 mt-1">
                                                将在 {new Date(limitStatus.resetAt).toLocaleString('zh-CN', {
                                                    month: '2-digit',
                                                    day: '2-digit',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })} 重置
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {isLoadingLimit && (
                                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                )}
                            </div>
                        </div>
                    )}

                    {/* 操作按钮 */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => setStep(1)}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-all"
                        >
                            ← 修改信息
                        </button>
                        <button
                            onClick={handleAutoGenerate}
                            disabled={isLoading || (limitStatus && !limitStatus.allowed)}
                            className="flex-2 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>AI 分析中... {loadingTime}秒</span>
                                </>
                            ) : (
                                <>
                                    <Zap className="w-5 h-5" />
                                    <span>继续生成完整分析</span>
                                </>
                            )}
                        </button>
                    </div>

                    {error && (
                        <div className="flex items-start gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg border border-red-200">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <div className="text-sm whitespace-pre-line">{error}</div>
                        </div>
                    )}
                </div>
            )}

            {/* 步骤 2: 复制提示词（仅手动模式） */}
            {step === 2 && mode === 'manual' && (
                <div className="space-y-6">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold font-serif-sc text-gray-800 mb-2">第二步：复制提示词</h2>
                        <p className="text-gray-500 text-sm">将提示词粘贴到 AI 对话框（如 ChatGPT、Claude 等）</p>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border-2 border-indigo-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-indigo-800">
                                <MessageSquare className="w-5 h-5" />
                                <span className="font-bold">完整提示词已准备</span>
                            </div>
                            <button
                                onClick={copyFullPrompt}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-md hover:shadow-lg"
                            >
                                {copied ? (
                                    <>
                                        <CheckCircle className="w-4 h-4" />
                                        <span>已复制</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4" />
                                        <span>复制提示词</span>
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="bg-white/80 p-4 rounded-lg text-sm text-gray-600 space-y-2">
                            <p>📋 包含内容：</p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                                <li>系统指令（交易员财富占星分析规则）</li>
                                <li>您的出生信息（{astroInfo.birthYear}年{astroInfo.birthMonth}月{astroInfo.birthDay}日 {astroInfo.birthHour}:{astroInfo.birthMinute}）</li>
                                <li>行运阶段参数</li>
                                <li>JSON 格式要求</li>
                            </ul>
                        </div>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                        <div className="flex items-start gap-3">
                            <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-amber-800">
                                <p className="font-bold mb-1">使用说明：</p>
                                <ol className="list-decimal list-inside space-y-1 text-xs">
                                    <li>点击上方按钮复制完整提示词</li>
                                    <li>打开您喜欢的 AI 对话工具（ChatGPT、Claude、Gemini 等）</li>
                                    <li>粘贴提示词并发送</li>
                                    <li>等待 AI 生成 JSON 格式的分析结果（约 3-5 分钟）</li>
                                    <li>复制 AI 返回的 JSON 数据</li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setStep(1)}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-all"
                        >
                            上一步
                        </button>
                        <button
                            onClick={() => setStep(3)}
                            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            <span>下一步：导入结果</span>
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* 步骤 3: 导入 JSON（仅手动模式） */}
            {step === 3 && mode === 'manual' && (
                <div className="space-y-6">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold font-serif-sc text-gray-800 mb-2">第三步：导入 AI 分析结果</h2>
                        <p className="text-gray-500 text-sm">粘贴 AI 返回的 JSON 数据</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                <Upload className="inline w-4 h-4 mr-1" />
                                AI 返回的 JSON 数据
                            </label>
                            <textarea
                                value={jsonInput}
                                onChange={(e) => setJsonInput(e.target.value)}
                                placeholder='粘贴 AI 返回的完整 JSON 数据，例如：&#10;{&#10;  "chartPoints": [...],&#10;  "summary": "...",&#10;  ...&#10;}'
                                className="w-full h-64 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono text-xs custom-scrollbar"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                💡 支持直接粘贴包含 markdown 代码块的内容，系统会自动提取 JSON
                            </p>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg border border-red-200">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm">{error}</p>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setStep(2)}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-all"
                        >
                            上一步
                        </button>
                        <button
                            onClick={handleImport}
                            disabled={!jsonInput.trim()}
                            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <CheckCircle className="w-5 h-5" />
                            <span>导入并生成报告</span>
                        </button>
                    </div>
                </div>
            )}

            {/* 验证弹窗 */}
            {showVerifyModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.654-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                {mode === 'trader' ? '验证会员身份' : '免费获取完整分析'}
                            </h3>
                            <p className="text-gray-600 text-sm">
                                {mode === 'trader'
                                    ? '交易员模式需要验证 Telegram 频道会员身份'
                                    : '请先关注我们的 Telegram 频道，获取更多占星知识与更新通知'
                                }
                            </p>
                        </div>

                        <div className="space-y-4">
                            {/* 🔥 交易员模式：Telegram 登录验证 */}
                            {mode === 'trader' ? (
                                <>
                                    {/* 步骤①：前往加入频道 */}
                                    <button
                                        onClick={handleClickFollow}
                                        disabled={isTgBound}
                                        className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                                            hasClickedFollow || isTgBound
                                                ? 'bg-green-100 text-green-700 border-2 border-green-500'
                                                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg'
                                        }`}
                                    >
                                        {hasClickedFollow || isTgBound ? (
                                            <>
                                                <CheckCircle className="w-5 h-5" />
                                                <span>✅ 已前往加入频道</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.654-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                                                </svg>
                                                <span>① 前往加入频道</span>
                                            </>
                                        )}
                                    </button>

                                    {/* 步骤②：使用 Telegram 登录验证账号 */}
                                    {hasClickedFollow && !isTgLoggedIn && (
                                        <div className="space-y-3">
                                            <label className="block text-sm font-bold text-gray-700 text-center">
                                                ② 使用 Telegram 登录
                                            </label>

                                            {/* Telegram 自动登录 */}
                                            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                                                <div className="mb-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                                                    <p className="text-xs text-amber-800 leading-relaxed">
                                                        <strong>ℹ️ 重要提示：</strong><br/>
                                                        下方会出现一个<strong className="text-blue-600">蓝色的 Telegram 登录按钮</strong>，点击后会弹出授权窗口。<br/>
                                                        <strong className="text-red-600">不需要输入手机号，不需要收验证码！</strong><br/>
                                                        如果 5 秒后还没出现按钮，请刷新页面。
                                                    </p>
                                                </div>

                                                <TelegramLoginButton
                                                    botUsername="aaastromoonbot"
                                                    buttonSize="large"
                                                    cornerRadius={10}
                                                    requestAccess={true}
                                                    dataOnauth={handleTelegramLogin}
                                                />

                                                <p className="text-xs text-gray-500 mt-3 text-center">
                                                    💡 应该看到一个蓝色的 "Log in with Telegram" 按钮
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Telegram 账号已确认提示 */}
                                    {isTgLoggedIn && (
                                        <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                                <span className="text-green-800 font-bold">✅ Telegram 账号已确认！</span>
                                            </div>
                                            <div className="text-sm text-gray-700 pl-7">
                                                {tgUsername && <p>用户名：{tgUsername}</p>}
                                                <p>ID：{tgUserId}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* 步骤③：验证并绑定 */}
                                    {isTgLoggedIn && hasClickedFollow && !isTgBound && (
                                        <button
                                            onClick={handleTelegramBind}
                                            disabled={isTgVerifying}
                                            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isTgVerifying ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    <span>验证中...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle className="w-5 h-5" />
                                                    <span>③ 验证并绑定</span>
                                                </>
                                            )}
                                        </button>
                                    )}

                                    {/* 绑定成功提示 */}
                                    {isTgBound && (
                                        <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4 flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                            <span className="text-green-800 font-bold">✅ Telegram 账号验证成功！</span>
                                        </div>
                                    )}

                                    {/* 错误提示 */}
                                    {tgError && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-red-700">{tgError}</p>
                                        </div>
                                    )}

                                    {/* 继续生成按钮 */}
                                    {isTgBound && (
                                        <button
                                            onClick={handleVerify}
                                            disabled={isVerifying}
                                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isVerifying ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    <span>生成中...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Zap className="w-5 h-5" />
                                                    <span>④ 开始生成报告</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </>
                            ) : (
                                /* 普通模式：保持原有流程 */
                                <>
                                    {/* 前往关注按钮 */}
                                    <button
                                        onClick={handleClickFollow}
                                        className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                                            hasClickedFollow
                                                ? 'bg-green-100 text-green-700 border-2 border-green-500'
                                                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg'
                                        }`}
                                    >
                                        {hasClickedFollow ? (
                                            <>
                                                <CheckCircle className="w-5 h-5" />
                                                <span>已前往关注</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.654-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                                                </svg>
                                                <span>前往关注频道</span>
                                            </>
                                        )}
                                    </button>

                                    {/* 验证按钮 */}
                                    <button
                                        onClick={handleVerify}
                                        disabled={!hasClickedFollow || isVerifying}
                                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isVerifying ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>验证中...</span>
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-5 h-5" />
                                                <span>验证并继续</span>
                                            </>
                                        )}
                                    </button>
                                </>
                            )}

                            {/* 取消按钮 */}
                            <button
                                onClick={() => setShowVerifyModal(false)}
                                disabled={isVerifying || isTgVerifying}
                                className="w-full text-gray-500 hover:text-gray-700 font-medium py-2 transition-all disabled:opacity-50"
                            >
                                取消
                            </button>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <p className="text-xs text-gray-500 text-center">
                                💡 {mode === 'trader' ? '交易员模式专享功能，需验证会员身份' : '关注频道后可获取最新占星分析技巧和行运提醒'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* 编辑档案弹窗 */}
            {showEditModal && editingProfile && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 p-4 flex items-center justify-between rounded-t-2xl">
                            <div className="flex items-center gap-2 text-white">
                                <Edit2 className="w-5 h-5" />
                                <h2 className="text-xl font-bold">编辑档案</h2>
                            </div>
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditingProfile(null);
                                }}
                                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                            {/* 姓名和性别 */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">姓名</label>
                                    <input
                                        type="text"
                                        value={editingProfile.profile_name || ''}
                                        onChange={(e) => setEditingProfile({...editingProfile, profile_name: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">性别</label>
                                    <select
                                        value={editingProfile.gender}
                                        onChange={(e) => setEditingProfile({...editingProfile, gender: e.target.value as 'male' | 'female' | 'other'})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="male">男</option>
                                        <option value="female">女</option>
                                        <option value="other">其他</option>
                                    </select>
                                </div>
                            </div>

                            {/* 出生日期 */}
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <div className="text-sm font-bold text-blue-800 mb-3">出生日期时间</div>
                                <div className="grid grid-cols-3 gap-3 mb-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">年</label>
                                        <input
                                            type="number"
                                            value={editingProfile.birth_year}
                                            onChange={(e) => setEditingProfile({...editingProfile, birth_year: parseInt(e.target.value)})}
                                            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">月</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="12"
                                            value={editingProfile.birth_month}
                                            onChange={(e) => setEditingProfile({...editingProfile, birth_month: parseInt(e.target.value)})}
                                            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">日</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="31"
                                            value={editingProfile.birth_day}
                                            onChange={(e) => setEditingProfile({...editingProfile, birth_day: parseInt(e.target.value)})}
                                            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">时 (0-23)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="23"
                                            value={editingProfile.birth_hour}
                                            onChange={(e) => setEditingProfile({...editingProfile, birth_hour: parseInt(e.target.value)})}
                                            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">分 (0-59)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="59"
                                            value={editingProfile.birth_minute}
                                            onChange={(e) => setEditingProfile({...editingProfile, birth_minute: parseInt(e.target.value)})}
                                            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 出生地点 */}
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">出生地点</label>
                                <input
                                    type="text"
                                    value={editingProfile.birth_place || ''}
                                    onChange={(e) => setEditingProfile({...editingProfile, birth_place: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="如：北京"
                                />
                            </div>

                            {/* 经纬度和时区 */}
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">纬度</label>
                                    <input
                                        type="number"
                                        step="0.0001"
                                        value={editingProfile.birth_latitude || ''}
                                        onChange={(e) => setEditingProfile({...editingProfile, birth_latitude: parseFloat(e.target.value)})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">经度</label>
                                    <input
                                        type="number"
                                        step="0.0001"
                                        value={editingProfile.birth_longitude || ''}
                                        onChange={(e) => setEditingProfile({...editingProfile, birth_longitude: parseFloat(e.target.value)})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">时区</label>
                                    <input
                                        type="text"
                                        value={editingProfile.timezone || '8.0'}
                                        onChange={(e) => setEditingProfile({...editingProfile, timezone: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 bg-gray-50 p-4 flex gap-3 rounded-b-2xl border-t border-gray-200">
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditingProfile(null);
                                }}
                                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                            >
                                取消
                            </button>
                            <button
                                onClick={() => handleSaveEditProfile(editingProfile)}
                                disabled={isSavingProfile}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSavingProfile ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>保存中...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        <span>保存修改</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 地图选择器模态框 */}
            <LocationMapPicker
                isOpen={showMapPicker}
                onClose={() => setShowMapPicker(false)}
                onSelect={handleMapLocationSelect}
                initialPosition={
                    astroInfo.latitude && astroInfo.longitude
                        ? {
                            lat: parseFloat(astroInfo.latitude),
                            lng: parseFloat(astroInfo.longitude),
                            placeName: astroInfo.birthPlace
                          }
                        : undefined
                }
            />
        </div>
    );
};

export default ImportDataMode;
