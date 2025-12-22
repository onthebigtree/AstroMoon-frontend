// 财富量级潜力等级配置

export interface WealthLevelInfo {
  id: string;
  name: string;
  subtitle: string;
  assetRange: string;
  description: string;
  color: string;
  gradient: string;
  emoji: string;
}

export const WEALTH_LEVELS: Record<string, WealthLevelInfo> = {
  'A10': {
    id: 'A10',
    name: '登神长阶',
    subtitle: 'God-Tier',
    assetRange: '资产 > 10亿',
    description: '你已不在凡间，你的名字就是传奇。对你来说，钱只是一个数字，真正追求的是改变世界。',
    color: '#FFD700',
    gradient: 'from-yellow-400 via-amber-500 to-yellow-600',
    emoji: '👑'
  },
  'A9': {
    id: 'A9',
    name: '氪金巨佬',
    subtitle: 'Pay-to-win Whale',
    assetRange: '资产 > 1亿',
    description: '钞能力是你的被动技能，壕无人性。你跺一跺脚，所在的领域都要抖三抖。',
    color: '#C0C0C0',
    gradient: 'from-gray-300 via-gray-400 to-gray-500',
    emoji: '💎'
  },
  'A8': {
    id: 'A8',
    name: '欧皇附体',
    subtitle: 'RNG God',
    assetRange: '资产 > 1000万',
    description: '人生就像开了挂，运气也是硬实力。别人还在苦苦寻觅，你总能轻松抽到版本答案（SSR）。',
    color: '#CD7F32',
    gradient: 'from-orange-400 via-orange-500 to-orange-600',
    emoji: '🍀'
  },
  'A7': {
    id: 'A7',
    name: '投资奇才',
    subtitle: 'Investment Genius',
    assetRange: '资产 > 600万',
    description: '你对机会的嗅觉堪比雷达，总能精准抄底、高位套现，认知变现的佼佼者。',
    color: '#9B59B6',
    gradient: 'from-purple-400 via-purple-500 to-purple-600',
    emoji: '🧠'
  },
  'A6': {
    id: 'A6',
    name: '搞钱达人',
    subtitle: 'Money-making Master',
    assetRange: '资产 > 300万',
    description: '你是行走的搞钱机器，搞钱是你的本能。在你眼里，处处都是可以挖掘的金矿。',
    color: '#3498DB',
    gradient: 'from-blue-400 via-blue-500 to-blue-600',
    emoji: '💰'
  },
  'A5': {
    id: 'A5',
    name: '人间清醒',
    subtitle: 'Sober Realist',
    assetRange: '资产 > 100万',
    description: '你早已跳出内卷的漩涡，不为财富焦虑，专注于构建属于自己的稳稳的幸福。',
    color: '#2ECC71',
    gradient: 'from-green-400 via-green-500 to-green-600',
    emoji: '🧘'
  },
  'A4': {
    id: 'A4',
    name: '搬砖小能手',
    subtitle: 'Skilled Grinder',
    assetRange: '资产 > 50万',
    description: '靠着勤劳的双手和聪明的头脑，一步一个脚印，为自己的小金库添砖加瓦，未来可期。',
    color: '#F39C12',
    gradient: 'from-yellow-500 via-amber-500 to-yellow-600',
    emoji: '🔨'
  },
  'A3': {
    id: 'A3',
    name: '月光骑士',
    subtitle: 'Moonlight Knight',
    assetRange: '资产 < 10万',
    description: '"钱是赚出来的，不是攒出来的"，你享受当下，钱来得快去得也快，体验生活是你的信条。',
    color: '#95A5A6',
    gradient: 'from-gray-400 via-gray-500 to-gray-600',
    emoji: '🌙'
  },
  'A2': {
    id: 'A2',
    name: '吃土少年',
    subtitle: 'Dirt-eating Youth',
    assetRange: '负债或月光',
    description: '钱包虽然空空，但精神食粮满满。坚信自己是潜力股，正在积蓄能量，等待一个逆风翻盘的机会。',
    color: '#8B4513',
    gradient: 'from-amber-700 via-amber-800 to-amber-900',
    emoji: '🌱'
  },

  // 传统版本（备用）
  'VERY_WEALTHY': {
    id: 'VERY_WEALTHY',
    name: '巨富',
    subtitle: 'Very Wealthy',
    assetRange: '资产 > 10亿',
    description: '财富如山，富可敌国，站在财富金字塔的顶端。',
    color: '#FFD700',
    gradient: 'from-yellow-400 via-amber-500 to-yellow-600',
    emoji: '💎'
  },
  'RATHER_WEALTHY': {
    id: 'RATHER_WEALTHY',
    name: '大富',
    subtitle: 'Rather Wealthy',
    assetRange: '资产 > 1亿',
    description: '财富充裕，生活无忧，享受优质的物质生活。',
    color: '#C0C0C0',
    gradient: 'from-gray-300 via-gray-400 to-gray-500',
    emoji: '💰'
  },
  'WEALTHY': {
    id: 'WEALTHY',
    name: '中富',
    subtitle: 'Wealthy',
    assetRange: '资产 > 1000万',
    description: '财富状况良好，可以实现大部分物质愿望。',
    color: '#CD7F32',
    gradient: 'from-orange-400 via-orange-500 to-orange-600',
    emoji: '💵'
  },
  'MEDIOCRE_WEALTH': {
    id: 'MEDIOCRE_WEALTH',
    name: '小富',
    subtitle: 'Mediocre Wealth',
    assetRange: '资产 > 500万',
    description: '有一定积蓄，生活稳定，小康水平。',
    color: '#4CAF50',
    gradient: 'from-green-400 via-green-500 to-green-600',
    emoji: '💴'
  },
  'NEITHER_WEALTHY_NOR_POOR': {
    id: 'NEITHER_WEALTHY_NOR_POOR',
    name: '小康',
    subtitle: 'Neither Wealthy Nor Poor',
    assetRange: '资产 > 100万',
    description: '收支平衡，生活舒适，衣食无忧。',
    color: '#2196F3',
    gradient: 'from-blue-400 via-blue-500 to-blue-600',
    emoji: '💸'
  },
  'MODERATELY_POOR': {
    id: 'MODERATELY_POOR',
    name: '略贫',
    subtitle: 'Moderately Poor',
    assetRange: '资产 > 50万',
    description: '经济稍显紧张，但基本生活有保障。',
    color: '#FF9800',
    gradient: 'from-orange-400 via-orange-500 to-orange-600',
    emoji: '💳'
  },
  'POOR': {
    id: 'POOR',
    name: '小贫',
    subtitle: 'Poor',
    assetRange: '资产 > 10万',
    description: '财务压力较大，需要谨慎理财。',
    color: '#F44336',
    gradient: 'from-red-400 via-red-500 to-red-600',
    emoji: '💔'
  },
  'POORER': {
    id: 'POORER',
    name: '贫',
    subtitle: 'Poorer',
    assetRange: '资产 > 1万',
    description: '经济困难，生活拮据。',
    color: '#E91E63',
    gradient: 'from-pink-500 via-red-500 to-red-600',
    emoji: '😔'
  },
  'VERY_POOR': {
    id: 'VERY_POOR',
    name: '极贫',
    subtitle: 'Very Poor',
    assetRange: '资产 < 1万',
    description: '财务状况极度紧张，亟需改善。',
    color: '#9C27B0',
    gradient: 'from-purple-600 via-purple-700 to-purple-800',
    emoji: '😰'
  },
  'BEGGARLY': {
    id: 'BEGGARLY',
    name: '穷',
    subtitle: 'Beggarly',
    assetRange: '负债 < 10万',
    description: '负债缠身，需要重新规划财务。',
    color: '#673AB7',
    gradient: 'from-indigo-600 via-indigo-700 to-indigo-800',
    emoji: '😢'
  },
  'MORE_BEGGARLY': {
    id: 'MORE_BEGGARLY',
    name: '很穷',
    subtitle: 'More Beggarly',
    assetRange: '负债 < 50万',
    description: '严重负债，财务危机严重。',
    color: '#3F51B5',
    gradient: 'from-blue-700 via-blue-800 to-blue-900',
    emoji: '😭'
  },
  'VERY_BEGGARLY': {
    id: 'VERY_BEGGARLY',
    name: '极穷',
    subtitle: 'Very Beggarly',
    assetRange: '负债 > 50万',
    description: '极度负债，需要寻求专业帮助。',
    color: '#212121',
    gradient: 'from-gray-800 via-gray-900 to-black',
    emoji: '💀'
  }
};

// 获取财富等级信息
export function getWealthLevelInfo(levelId: string): WealthLevelInfo | null {
  return WEALTH_LEVELS[levelId] || null;
}

// 获取所有财富等级
export function getAllWealthLevels(): WealthLevelInfo[] {
  return Object.values(WEALTH_LEVELS);
}
