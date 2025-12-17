
import React, { useState } from 'react';
import { LifeDestinyResult } from '../types';
import { CheckCircle, AlertCircle, Sparkles, ArrowRight, Zap, Loader2, TrendingUp, Heart } from 'lucide-react';
import { TRADER_SYSTEM_INSTRUCTION, NORMAL_LIFE_SYSTEM_INSTRUCTION } from '../constants';
import { generateWithAPI } from '../services/apiService';

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

// 常用城市坐标映射表
const CITY_COORDINATES: Record<string, { latitude: number; longitude: number }> = {
    '北京': { latitude: 39.9042, longitude: 116.4074 },
    '上海': { latitude: 31.2304, longitude: 121.4737 },
    '广州': { latitude: 23.1291, longitude: 113.2644 },
    '深圳': { latitude: 22.5431, longitude: 114.0579 },
    '成都': { latitude: 30.5728, longitude: 104.0668 },
    '杭州': { latitude: 30.2741, longitude: 120.1551 },
    '重庆': { latitude: 29.4316, longitude: 106.9123 },
    '西安': { latitude: 34.3416, longitude: 108.9398 },
    '天津': { latitude: 39.0842, longitude: 117.2010 },
    '南京': { latitude: 32.0603, longitude: 118.7969 },
    '武汉': { latitude: 30.5928, longitude: 114.3055 },
    '香港': { latitude: 22.3193, longitude: 114.1694 },
    '台北': { latitude: 25.0330, longitude: 121.5654 },
    // 默认坐标（如果找不到城市，使用广州）
    'default': { latitude: 23.1291, longitude: 113.2644 }
};

const ImportDataMode: React.FC<ImportDataModeProps> = ({ onDataImport }) => {
    const [mode, setMode] = useState<Mode>('choose');
    const [step, setStep] = useState<Step>(1);
    const [basicChart, setBasicChart] = useState<BasicChartInfo | null>(null);
    const [astroInfo, setAstroInfo] = useState({
        name: '测试用户',
        gender: 'Male',
        birthYear: '1990',
        birthMonth: '6',
        birthDay: '15',
        birthHour: '14',
        birthMinute: '30',
        birthPlace: '广州',
    });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingTime, setLoadingTime] = useState(0);

    // API 配置已在后端服务器，前端不需要配置

    // 调用后端 API 计算基础星盘信息
    const calculateBasicChart = async (): Promise<BasicChartInfo> => {
        const year = parseInt(astroInfo.birthYear);
        const month = parseInt(astroInfo.birthMonth);
        const day = parseInt(astroInfo.birthDay);
        const hour = parseInt(astroInfo.birthHour);
        const minute = parseInt(astroInfo.birthMinute);

        // 获取城市坐标
        const cityName = astroInfo.birthPlace?.trim() || '';
        let coordinates = CITY_COORDINATES[cityName] || CITY_COORDINATES['default'];

        // 模糊匹配城市名（处理"广州市"、"北京"等）
        if (!CITY_COORDINATES[cityName]) {
            for (const city in CITY_COORDINATES) {
                if (cityName.includes(city) || city.includes(cityName)) {
                    coordinates = CITY_COORDINATES[city];
                    break;
                }
            }
        }

        try {
            // 调用后端星盘计算 API
            // 🔥 在生产环境使用相对路径（通过 Vercel Serverless Function 代理），避免 CORS
            const isDev = import.meta.env.DEV;
            const backendUrl = isDev ? (import.meta.env.VITE_BACKEND_URL || 'http://43.134.98.27:3782') : '';
            const url = backendUrl ? `${backendUrl}/api/calculate-chart` : '/api/calculate-chart';

            console.log('🔮 调用后端星盘计算 API:', url);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    year,
                    month,
                    day,
                    hour,
                    minute,
                    latitude: coordinates.latitude,
                    longitude: coordinates.longitude,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '星盘计算失败');
            }

            const result = await response.json();
            console.log('✅ 星盘计算成功:', result);

            return {
                isDiurnal: result.isDiurnal,
                sunSign: result.sunSign,
                moonSign: result.moonSign,
                ascendant: result.ascendant,
                mc: result.mc,
                sunHouse: result.sunHouse,
                sunStatus: result.sunStatus,
                sunDegree: result.sunDegree,
                moonDegree: result.moonDegree,
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
【基础星盘信息（已计算）】
盘性 (Sect)：${basicChart.isDiurnal ? '昼盘 (Day Chart) - 太阳在地平线以上' : '夜盘 (Night Chart) - 太阳在地平线以下'}
太阳 (Sun)：${basicChart.sunSign}，第 ${basicChart.sunHouse} 宫，${basicChart.sunStatus}
月亮 (Moon)：${basicChart.moonSign}
上升点 (Ascendant)：${basicChart.ascendant}
天顶 (MC)：${basicChart.mc}

💡 以上信息为初步计算结果，请结合出生日期时间${astroInfo.birthPlace ? '和地点' : ''}进行更精确的星盘推算和分析。
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

${astroInfo.birthPlace ? `【出生地点】\n出生城市/地区：${astroInfo.birthPlace}\n` : ''}${chartInfo}
【行运阶段参数】
1. 起运年龄：1 岁 (虚岁)。
2. 第一阶段行运标签：木星主导扩张期。
3. 阶段排序方向：顺行 (Forward)。

请严格按照系统指令的 JSON 格式输出，不要添加 markdown 标记。`;
    };

    // 复制完整提示词
    const copyFullPrompt = async () => {
        const fullPrompt = `=== 系统指令 (System Prompt) ===\n\n${ASTRO_TRADER_SYSTEM_INSTRUCTION}\n\n=== 用户提示词 (User Prompt) ===\n\n${generateUserPrompt()}`;

        try {
            await navigator.clipboard.writeText(fullPrompt);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('复制失败', err);
        }
    };

    // 解析 JSON 内容的辅助函数
    const parseJSONContent = (jsonContent: string): LifeDestinyResult => {
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

        console.log('🔧 修复后尝试解析 JSON...');

        let data;
        try {
            data = JSON.parse(content);
            console.log('✅ JSON 解析成功');
        } catch (err: any) {
            console.error('❌ JSON 解析失败:', err.message);
            console.error('❌ 错误位置附近的内容:', content.slice(Math.max(0, err.message.match(/\d+/)?.[0] - 100), err.message.match(/\d+/)?.[0] + 100));

            // 尝试修复被截断的 JSON
            console.log('🔧 尝试修复被截断的 JSON...');

            // 如果是数组未闭合，尝试添加 ]
            if (content.lastIndexOf('[') > content.lastIndexOf(']')) {
                content += ']';
            }

            // 如果是对象未闭合，尝试添加 }
            const openBraces = (content.match(/\{/g) || []).length;
            const closeBraces = (content.match(/\}/g) || []).length;
            if (openBraces > closeBraces) {
                content += '}'.repeat(openBraces - closeBraces);
            }

            try {
                data = JSON.parse(content);
                console.log('✅ 修复后 JSON 解析成功');
            } catch (err2) {
                throw new Error(`JSON 解析失败：${err.message}\n\n建议：请将完整内容复制到 JSON 验证工具检查格式`);
            }
        }

        // 校验数据
        if (!data.chartPoints || !Array.isArray(data.chartPoints)) {
            throw new Error('数据格式不正确：缺少 chartPoints 数组');
        }

        if (data.chartPoints.length < 10) {
            throw new Error('数据不完整：chartPoints 数量太少');
        }

        // 转换为应用所需格式
        return {
            chartData: data.chartPoints,
            analysis: {
                birthChart: data.birthChart || "星盘信息未提供",
                summary: data.summary || "交易员财富格局总评",
                summaryScore: data.summaryScore || 85,
                traderVitality: data.traderVitality || "交易生命力与抗压指数分析",
                traderVitalityScore: data.traderVitalityScore || 88,
                wealthPotential: data.wealthPotential || "财富量级与来源结构分析",
                wealthPotentialScore: data.wealthPotentialScore || 82,
                fortuneLuck: data.fortuneLuck || "运气与天选财富分析",
                fortuneLuckScore: data.fortuneLuckScore || 90,
                leverageRisk: data.leverageRisk || "杠杆与风险管理能力",
                leverageRiskScore: data.leverageRiskScore || 75,
                platformTeam: data.platformTeam || "平台与团队红利",
                platformTeamScore: data.platformTeamScore || 80,
                tradingStyle: data.tradingStyle || "适合的交易风格与策略",
                tradingStyleScore: data.tradingStyleScore || 85,
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
            const result = parseJSONContent(jsonInput);
            onDataImport(result);
        } catch (err: any) {
            setError(`解析失败：${err.message}`);
        }
    };

    // 自动生成
    const handleAutoGenerate = async () => {
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

            // 调用后端 API（API Key 已在后端，安全隐藏）
            const content = await generateWithAPI({
                userPrompt,
                systemPrompt,
            });

            // 简单解析 JSON
            try {
                const data = JSON.parse(content.trim());
                const result = {
                    chartData: data.chartPoints,
                    analysis: {
                        birthChart: data.birthChart || "星盘信息未提供",
                        summary: data.summary || "人生格局总评",
                        summaryScore: data.summaryScore || 85,
                        traderVitality: data.traderVitality || "生命力分析",
                        traderVitalityScore: data.traderVitalityScore || 88,
                        wealthPotential: data.wealthPotential || "财富潜力分析",
                        wealthPotentialScore: data.wealthPotentialScore || 82,
                        fortuneLuck: data.fortuneLuck || "运势分析",
                        fortuneLuckScore: data.fortuneLuckScore || 90,
                        leverageRisk: data.leverageRisk || "风险管理分析",
                        leverageRiskScore: data.leverageRiskScore || 75,
                        platformTeam: data.platformTeam || "支持系统分析",
                        platformTeamScore: data.platformTeamScore || 80,
                        tradingStyle: data.tradingStyle || "风格建议",
                        tradingStyleScore: data.tradingStyleScore || 85,
                        keyYears: data.keyYears,
                        peakPeriods: data.peakPeriods,
                        riskPeriods: data.riskPeriods,
                    },
                };
                onDataImport(result);
            } catch (parseErr) {
                throw new Error('JSON 解析失败，请检查返回格式');
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

    const isStep1Valid = astroInfo.birthYear && astroInfo.birthMonth && astroInfo.birthDay && astroInfo.birthHour;
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
                            onClick={() => { setMode('trader'); setStep(1); }}
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

                        {/* 普通人生模式 */}
                        <button
                            onClick={() => { setMode('normal'); setStep(1); }}
                            className="group relative bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white p-6 rounded-2xl shadow-lg transition-all transform hover:scale-105 hover:shadow-2xl"
                        >
                            <div className="absolute inset-0 bg-black/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative z-10">
                                <div className="flex justify-center mb-4">
                                    <div className="p-4 bg-white/20 rounded-full">
                                        <Heart className="w-10 h-10" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold mb-2">🌟 普通人生</h3>
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
                            <span>出生地点 (可选)</span>
                        </div>
                        <input
                            type="text"
                            name="birthPlace"
                            value={astroInfo.birthPlace}
                            onChange={handleAstroChange}
                            placeholder="如：香港、上海、纽约"
                            className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white"
                        />
                        <p className="text-xs text-green-600/70 mt-1">如果不提供，AI 将使用默认参数进行分析</p>
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
                            disabled={isLoading}
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
        </div>
    );
};

export default ImportDataMode;
