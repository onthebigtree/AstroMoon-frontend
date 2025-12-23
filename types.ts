
export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
}

export interface UserInput {
  name?: string;
  gender: Gender;

  // 出生日期时间 (阳历/公历)
  birthYear: string;        // 出生年份 (如 1990)
  birthMonth: string;       // 出生月份 (1-12)
  birthDay: string;         // 出生日 (1-31)
  birthHour: string;        // 出生时 (0-23)
  birthMinute: string;      // 出生分 (0-59)

  // 出生地点信息
  birthPlace?: string;      // 出生城市/地区 (可选)
  birthLongitude?: string;  // 出生地经度 (可选)
  birthLatitude?: string;   // 出生地纬度 (可选)
  timezone?: string;        // 时区 (可选，系统可自动判定)

  // 占星盘核心数据 (可选，如果用户已有星盘数据)
  sunSign?: string;         // 太阳星座
  sunHouse?: string;        // 太阳宫位
  sunDegree?: string;       // 太阳度数
  moonSign?: string;        // 月亮星座
  moonHouse?: string;       // 月亮宫位
  moonDegree?: string;      // 月亮度数
  ascSign?: string;         // 上升星座
  ascDegree?: string;       // 上升度数

  // 行运参数 (类似大运的长周期概念)
  startAge: string;         // 起运年龄 (虚岁)
  firstPhaseLabel: string;  // 第一阶段行运标签 (如 "木星主导扩张期")
  phaseDirection?: 'forward' | 'backward'; // 阶段方向：顺行/逆行

  // API Configuration Fields
  modelName: string;        // 使用的模型名称
  apiBaseUrl: string;
  apiKey: string;
}

export interface KLinePoint {
  age: number;             // 年龄 (虚岁 1-100)
  year: number;            // 公历年份
  phase: string;           // 阶段行运标签 (10年一变，类似大运)
  yearTransit?: string;    // 当年的行运概述 (推运/过运/回归等综合)
  open: number;            // K线开盘价
  close: number;           // K线收盘价
  high: number;            // K线最高价
  low: number;             // K线最低价
  score: number;           // 当年综合评分 (0-100)
  trend?: 'up' | 'down' | 'flat'; // 与前一年相比的趋势
  theme?: string[];        // 关键词标签 (如 ["资金放大", "高波动"])
  reason: string;          // 详细的流年分析与建议 (60-150字)

  // 为了向后兼容保留 ganZhi 和 daYun (可选)
  ganZhi?: string;         // 流年干支 (八字系统遗留)
  daYun?: string;          // 大运干支 (八字系统遗留)
}

export interface AnalysisData {
  // 基础信息 (可保留 bazi 以便向后兼容，或改为 birthChart 星盘信息)
  bazi?: string[];           // [太阳, 月亮, 上升, ...] 或保留八字四柱
  birthChart?: string;       // 星盘简要描述

  // 综合分析
  summary: string;           // 交易员财富格局总评
  summaryScore: number;      // 0-100 综合评分

  // 核心分析模块（标题根据模式动态设置）
  traderVitalityTitle?: string;        // 维度标题
  traderVitality: string;              // 内容分析
  traderVitalityScore: number;         // 0-100

  wealthPotentialTitle?: string;       // 维度标题
  wealthPotential: string;             // 内容分析
  wealthPotentialScore: number;        // 0-100

  fortuneLuckTitle?: string;           // 维度标题
  fortuneLuck: string;                 // 内容分析
  fortuneLuckScore: number;            // 0-100

  leverageRiskTitle?: string;          // 维度标题
  leverageRisk: string;                // 内容分析
  leverageRiskScore: number;           // 0-100

  platformTeamTitle?: string;          // 维度标题
  platformTeam: string;                // 内容分析
  platformTeamScore: number;           // 0-100

  tradingStyleTitle?: string;          // 维度标题
  tradingStyle: string;                // 内容分析
  tradingStyleScore: number;           // 0-100

  intimacyEnergyTitle?: string;        // 维度标题
  intimacyEnergy?: string;             // 亲密能量与深度连接能力分析
  intimacyEnergyScore?: number;        // 0-100

  sexualCharmTitle?: string;           // 维度标题
  sexualCharm?: string;                // 性魅力与吸引力分析
  sexualCharmScore?: number;           // 0-100

  favorableDirectionsTitle?: string;   // 维度标题
  favorableDirections?: string;        // 适宜发展方位分析
  favorableDirectionsScore?: number;   // 0-100

  // 关键年份与周期
  keyYears?: string;              // 关键财富年份列表
  peakPeriods?: string;           // 潜在高速盈利期
  riskPeriods?: string;           // 高风险波动期

  // 为向后兼容保留的字段 (可选)
  personality?: string;
  personalityScore?: number;
  industry?: string;
  industryScore?: number;
  fengShui?: string;
  fengShuiScore?: number;
  wealth?: string;
  wealthScore?: number;
  marriage?: string;
  marriageScore?: number;
  health?: string;
  healthScore?: number;
  family?: string;
  familyScore?: number;
  crypto?: string;
  cryptoScore?: number;
  cryptoYear?: string;
  cryptoStyle?: string;

  // 财富量级潜力评级
  wealthLevel?: string;  // A10 | A9 | A8 | A7 | A6 | A5 | A4 | A3 | A2 | A1 | 等级标识
}

export interface LifeDestinyResult {
  chartData: KLinePoint[];
  analysis: AnalysisData;
}

// 星盘计算相关类型
export interface ChartCalculationRequest {
  birth_datetime: string;      // ISO 格式: "1963-02-17T13:40:00"
  latitude: number;
  longitude: number;
  timezone_offset: number;     // 时区偏移，如 -5.0 表示 UTC-5
  house_system: string;        // 宫位系统，默认 "B" (Placidus)
  gender: 'male' | 'female';
}

// 新 API 返回的数据结构
export interface ChartCalculationResponse {
  code: number;
  msg: string;
  data: {
    meta: {
      is_day_chart: boolean;
      calculation_engine: string;
      gender: string;
      case_id: string | null;
      location: string | null;
      birth_time: string;
    };
    bodies: {
      Sun: PlanetData;
      Moon: PlanetData;
      Mercury: PlanetData;
      Venus: PlanetData;
      Mars: PlanetData;
      Jupiter: PlanetData;
      Saturn: PlanetData;
      Uranus: PlanetData;
      Neptune: PlanetData;
      Pluto: PlanetData;
      North_Node: PlanetData;
      South_Node: PlanetData;
      Lilith: PlanetData;
      ASC: PlanetData;
      MC: PlanetData;
      DES: PlanetData;
      IC: PlanetData;
    };
    aspects: AspectData[];
    dignity_data: Record<string, DignityData>;
    arabic_parts: {
      Fortune: ArabicPartData;
      Spirit: ArabicPartData;
      Love: ArabicPartData;
      Marriage: ArabicPartData;
      Sickness: ArabicPartData;
    };
    houses: {
      whole_sign_cusps: Record<string, number>;
      alchabitius_cusps: Record<string, number>;
    };
  };
}

export interface PlanetData {
  longitude: number;
  sign: string;
  sign_degree: number;
  speed: number;
  is_retrograde: boolean;
  solar_status: string;
  house_placement: {
    whole_sign: number;
    alchabitius: {
      raw: number;
      effective: number;
      is_shifted: boolean;
      note: string | null;
    };
  };
  dignity_rulers: {
    term: string;
    face: string;
  } | null;
}

export interface AspectData {
  body_a: string;
  body_b: string;
  type: string;
  orb: number;
  is_applying: boolean;
}

export interface DignityData {
  score: number;
  dignity: string;
  sign: number;
}

export interface ArabicPartData {
  formula_used: string;
  longitude: number;
  sign: string;
  sign_degree: number;
  house_placement: {
    whole_sign: number;
    alchabitius: {
      raw: number;
      effective: number;
      is_shifted: boolean;
      note: string | null;
    };
  };
}
