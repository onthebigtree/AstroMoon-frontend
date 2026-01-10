// 性生活类型配置

export interface SexLifeTypeInfo {
  id: string;
  name: string;
  subtitle: string;
  archetype: string;
  label: string;
  description: string;
  astroConfig: string;
  color: string;
  gradient: string;
  emoji: string;
}

export const SEX_LIFE_TYPES: Record<string, SexLifeTypeInfo> = {
  'THEORY_MASTER': {
    id: 'THEORY_MASTER',
    name: '嘴强王者',
    subtitle: '理论大师',
    archetype: '纸上谈兵的赵括 + 爱吹牛的韦小宝',
    label: 'PPT造爱专家',
    description: '你对"性"的了解全靠脑补和阅片。前戏能聊宇宙起源，事后能做复盘报告，理论知识丰富得像个妇科大夫，但真刀真枪上阵时，你的实操能力大概只有你嘴皮子功夫的10%。别名：床上的演说家。',
    astroConfig: '风象特重（双子/水瓶），火星落陷',
    color: '#3B82F6',
    gradient: 'from-blue-400 via-blue-500 to-indigo-600',
    emoji: '🎤'
  },
  'TEDDY_DOG': {
    id: 'TEDDY_DOG',
    name: '人形泰迪',
    subtitle: '走地打桩机',
    archetype: '猪八戒 + 泰迪',
    label: '下半身思考者',
    description: '你的大脑只是个装饰品，脊髓才是你的指挥中心。你的审美宽容度令人惊叹，只要是活的、异性（甚至不限），你都能产生大胆的想法。你的热情来得快去得也快，就像一只发情的泰迪，主打一个"量大管饱，不挑食"。',
    astroConfig: '火星状态极佳，金火刑克，火海相位',
    color: '#EF4444',
    gradient: 'from-red-400 via-red-500 to-rose-600',
    emoji: '🐕'
  },
  'TIME_MANAGER': {
    id: 'TIME_MANAGER',
    name: '时间管理大师',
    subtitle: '中央空调',
    archetype: '西门庆 + 洪世贤',
    label: '绝命毒师 / 顶级海王',
    description: '你不是花心，你只是心碎成了很多片，每一片都爱上了不同的人。你的性魅力带有剧毒，擅长用套路和技巧让人上瘾。你享受的不是性本身，而是"狩猎"和"征服"的快感。建议你的伴侣常备速效救心丸，或者直接把你上交给国家去搞外交。',
    astroConfig: '金冥相位，海王星重，天蝎/双鱼特质重',
    color: '#8B5CF6',
    gradient: 'from-purple-400 via-purple-500 to-violet-600',
    emoji: '🦈'
  },
  'DIGITAL_MONK': {
    id: 'DIGITAL_MONK',
    name: '电子木鱼',
    subtitle: '性缩力天花板',
    archetype: '唐僧 + 法海',
    label: '出家预备役',
    description: '你是行走的灭火器，任何暧昧的火苗到你这儿都能瞬间熄灭。面对诱惑，你稳得像个入定的老僧，甚至想给对方讲道理。跟你谈恋爱就像在守活寡，这种"禁欲感"乍一看挺高级，久了只会让人怀疑你是不是有什么难言之隐。',
    astroConfig: '土星重，摩羯/处女特质，金土刑克',
    color: '#6B7280',
    gradient: 'from-gray-400 via-gray-500 to-slate-600',
    emoji: '🪷'
  },
  'DRAMA_QUEEN': {
    id: 'DRAMA_QUEEN',
    name: '苦情剧戏精',
    subtitle: '自我感动型',
    archetype: '琼瑶剧主角',
    label: '眼泪发电站',
    description: '你追求的不是肉体的欢愉，而是"灵肉合一"的史诗感。如果前戏没有足够的情绪铺垫（比如哭一场、吵一架），你就无法进入状态。你太麻烦了，跟你上床像是在演话剧，对方不仅要出力，还得配合你的内心戏，心好累。',
    astroConfig: '月亮/金星受克，巨蟹/双鱼特质',
    color: '#EC4899',
    gradient: 'from-pink-400 via-pink-500 to-rose-600',
    emoji: '🎭'
  }
};

// 获取性生活类型信息
export function getSexLifeTypeInfo(typeId: string): SexLifeTypeInfo | null {
  return SEX_LIFE_TYPES[typeId] || null;
}

// 获取所有性生活类型
export function getAllSexLifeTypes(): SexLifeTypeInfo[] {
  return Object.values(SEX_LIFE_TYPES);
}
