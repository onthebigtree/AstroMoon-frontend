// 2026 赤马红羊年星座运势配置

export interface ZodiacFortuneInfo {
  id: string;
  name: string;
  emoji: string;
  tier: 'T0' | 'T1' | 'T2' | 'T3' | 'T4';
  tierName: string;
  tierEmoji: string;
  subtitle: string;
  description: string;
  comment: string;
  gradient: string;
  dateRange: string;
}

// 星座日期范围（用于根据出生日期判断星座）
export const ZODIAC_DATE_RANGES: { sign: string; startMonth: number; startDay: number; endMonth: number; endDay: number }[] = [
  { sign: 'aries', startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
  { sign: 'taurus', startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
  { sign: 'gemini', startMonth: 5, startDay: 21, endMonth: 6, endDay: 21 },
  { sign: 'cancer', startMonth: 6, startDay: 22, endMonth: 7, endDay: 22 },
  { sign: 'leo', startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
  { sign: 'virgo', startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
  { sign: 'libra', startMonth: 9, startDay: 23, endMonth: 10, endDay: 23 },
  { sign: 'scorpio', startMonth: 10, startDay: 24, endMonth: 11, endDay: 22 },
  { sign: 'sagittarius', startMonth: 11, startDay: 23, endMonth: 12, endDay: 21 },
  { sign: 'capricorn', startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
  { sign: 'aquarius', startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
  { sign: 'pisces', startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
];

// 根据月日获取星座
export function getZodiacSignByDate(month: number, day: number): string | null {
  for (const range of ZODIAC_DATE_RANGES) {
    // 处理跨年的摩羯座
    if (range.sign === 'capricorn') {
      if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
        return 'capricorn';
      }
    } else {
      if (
        (month === range.startMonth && day >= range.startDay) ||
        (month === range.endMonth && day <= range.endDay) ||
        (month > range.startMonth && month < range.endMonth)
      ) {
        return range.sign;
      }
    }
  }
  return null;
}

export const ZODIAC_FORTUNES_2026: Record<string, ZodiacFortuneInfo> = {
  // T0：夯 (版本之子)
  'leo': {
    id: 'leo',
    name: '狮子座',
    emoji: '🦁',
    tier: 'T0',
    tierName: '夯 (版本之子)',
    tierEmoji: '🔴',
    subtitle: '行走的显眼包',
    description: '下半年木星进命宫，你就是行走的"显眼包"。虽然你平时就觉得自己是宇宙中心，但2026年宇宙居然真的点头承认了。',
    comment: '运气好到令人发指，嚣张得理直气壮。这一年你不需要带脑子，带个收款码就行。',
    gradient: 'from-red-500 via-orange-500 to-yellow-500',
    dateRange: '7.23 - 8.22',
  },
  'aquarius': {
    id: 'aquarius',
    name: '水瓶座',
    emoji: '♒',
    tier: 'T0',
    tierName: '夯 (版本之子)',
    tierEmoji: '🔴',
    subtitle: '从中二到领袖',
    description: '冥王星彻底坐镇，你要么毁灭世界，要么统治世界。那种"众人皆醉我独醒"的中二病在今年变成了真正的领袖气质。',
    comment: '虽然你还是那个听不懂人话的外星人，但今年地球人被迫学会了你的语言。',
    gradient: 'from-red-500 via-orange-500 to-yellow-500',
    dateRange: '1.20 - 2.18',
  },

  // T1：顶级 (天选打工人)
  'cancer': {
    id: 'cancer',
    name: '巨蟹座',
    emoji: '🦀',
    tier: 'T1',
    tierName: '顶级 (天选打工人)',
    tierEmoji: '🟠',
    subtitle: '哭着收钱',
    description: '上半年木星旺位，贵人运多到像搞批发的。哪怕你在家躺着哭，都有人敲门给你送钱，生怕你饿着。',
    comment: '除了情绪不稳定，其他都稳得一批。你是唯一一个靠"哭"都能哭出业绩的奇葩。',
    gradient: 'from-orange-400 via-amber-500 to-yellow-500',
    dateRange: '6.22 - 7.22',
  },
  'gemini': {
    id: 'gemini',
    name: '双子座',
    emoji: '👯‍♀️',
    tier: 'T1',
    tierName: '顶级 (天选打工人)',
    tierEmoji: '🟠',
    subtitle: '疯得恰到好处',
    description: '天王星进驻，你的精神分裂终于派上用场了。世界越乱你越嗨，别人在焦虑，你在蹦迪，混乱是你的阶梯。',
    comment: '疯得恰到好处。你的脑洞今年能变现，虽然身边人觉得你该吃药，但银行卡余额证明你是对的。',
    gradient: 'from-orange-400 via-amber-500 to-yellow-500',
    dateRange: '5.21 - 6.21',
  },

  // T2：人上人 (狠人俱乐部)
  'capricorn': {
    id: 'capricorn',
    name: '摩羯座',
    emoji: '♑',
    tier: 'T2',
    tierName: '人上人 (狠人俱乐部)',
    tierEmoji: '🟡',
    subtitle: '没有感情的杀手',
    description: '土星虽然换座搞事情，但你天生就是受虐狂。别人遇到困难睡大觉，你遇到困难直接把困难干碎。这一年全是硬仗，但你赢麻了。',
    comment: '没有感情的杀手。你的快乐建立在竞争对手的痛苦之上，脸上笑嘻嘻，心里在算计怎么收购对方公司。',
    gradient: 'from-yellow-400 via-amber-400 to-orange-400',
    dateRange: '12.22 - 1.19',
  },
  'scorpio': {
    id: 'scorpio',
    name: '天蝎座',
    emoji: '♏',
    tier: 'T2',
    tierName: '人上人 (狠人俱乐部)',
    tierEmoji: '🟡',
    subtitle: '闷声发大财',
    description: '9宫运势强劲，虽然内心戏依然足足有80集连续剧，但行动力爆表。属于那种表面云淡风轻，背地里卷死所有人的老六。',
    comment: '闷声发大财的典型。别人在朋友圈晒惨，你在默默数钱。除了腹黑，没别的毛病。',
    gradient: 'from-yellow-400 via-amber-400 to-orange-400',
    dateRange: '10.24 - 11.22',
  },

  // T3：NPC (凑数路人甲)
  'virgo': {
    id: 'virgo',
    name: '处女座',
    emoji: '♍',
    tier: 'T3',
    tierName: 'NPC (凑数路人甲)',
    tierEmoji: '🟢',
    subtitle: '系统维护员',
    description: '生活平淡如水，每天都在修补别人的烂摊子。你是世界背景板里那个最勤劳的贴图，虽然重要，但剧情跟你没啥关系。',
    comment: '系统维护员。这一年你最大的成就就是——没有出事。活着，但没完全活。',
    gradient: 'from-green-400 via-emerald-400 to-teal-400',
    dateRange: '8.23 - 9.22',
  },
  'taurus': {
    id: 'taurus',
    name: '金牛座',
    emoji: '♉',
    tier: 'T3',
    tierName: 'NPC (凑数路人甲)',
    tierEmoji: '🟢',
    subtitle: '重在参与',
    description: '天王星终于走了，你只想抱着钱睡觉。发财轮不到你，倒霉也轮不到你，主打一个"重在参与，谢谢惠顾"。',
    comment: '该吃吃该喝喝，遇事别往心里搁。你在2026年的存在感，约等于奶茶里的珍珠——有你没你都能喝。',
    gradient: 'from-green-400 via-emerald-400 to-teal-400',
    dateRange: '4.20 - 5.20',
  },
  'pisces': {
    id: 'pisces',
    name: '双鱼座',
    emoji: '♓',
    tier: 'T3',
    tierName: 'NPC (凑数路人甲)',
    tierEmoji: '🟢',
    subtitle: '大病初愈',
    description: '土星刚走，海王星又要换座，整个人处于"我是谁我在哪"的懵逼状态。现实太骨感，你选择断网。',
    comment: '大病初愈的康复期患者。别问前程，问就是"随缘"。你的运势全靠意念支撑。',
    gradient: 'from-green-400 via-emerald-400 to-teal-400',
    dateRange: '2.19 - 3.20',
  },

  // T4：拉 (人间凑数)
  'aries': {
    id: 'aries',
    name: '白羊座',
    emoji: '♈',
    tier: 'T4',
    tierName: '拉 (人间凑数)',
    tierEmoji: '⚪',
    subtitle: '惨王之王',
    description: '土星进命宫（第一宫），就像背着五指山跑马拉松。这一年你会深刻理解什么叫"喝凉水都塞牙"，除了硬抗，别无选择。',
    comment: '冤种竟是我自己。你以为是本命年？不，是土星教你做人年。建议全文背诵《莫生气》。',
    gradient: 'from-gray-300 via-gray-400 to-gray-500',
    dateRange: '3.21 - 4.19',
  },
  'libra': {
    id: 'libra',
    name: '天秤座',
    emoji: '⚖️',
    tier: 'T4',
    tierName: '拉 (人间凑数)',
    tierEmoji: '⚪',
    subtitle: '端水翻车',
    description: '土星对冲，人际关系全面崩盘。分手、离婚、被合伙人背刺，你就像个夹心饼干，两头受气，中间还碎了。',
    comment: '端水大师终于把碗砸了。这一年你谁都讨好不了，最后发现只有自己是那个小丑。',
    gradient: 'from-gray-300 via-gray-400 to-gray-500',
    dateRange: '9.23 - 10.23',
  },
  'sagittarius': {
    id: 'sagittarius',
    name: '射手座',
    emoji: '♐',
    tier: 'T4',
    tierName: '拉 (人间凑数)',
    tierEmoji: '⚪',
    subtitle: '灵魂在外肉体坐牢',
    description: '木星虽然给力，但土星刑克让你"想浪浪不起来"。就像被锁在办公室里的哈士奇，除了拆家和叹气，啥也干不了。',
    comment: '一种"差不多是个废人"的无力感。你的灵魂在外，肉体在坐牢。别折腾了，躺下吧。',
    gradient: 'from-gray-300 via-gray-400 to-gray-500',
    dateRange: '11.23 - 12.21',
  },
};

// Tier 配置
export const TIER_CONFIG = {
  'T0': {
    name: '夯 (版本之子)',
    emoji: '🔴',
    description: '2026年宇宙亲儿子/女儿，运势爆表',
    gradient: 'from-red-500 via-orange-500 to-yellow-500',
  },
  'T1': {
    name: '顶级 (天选打工人)',
    emoji: '🟠',
    description: '天选之人，轻松躺赢',
    gradient: 'from-orange-400 via-amber-500 to-yellow-500',
  },
  'T2': {
    name: '人上人 (狠人俱乐部)',
    emoji: '🟡',
    description: '实力派选手，硬仗照样赢',
    gradient: 'from-yellow-400 via-amber-400 to-orange-400',
  },
  'T3': {
    name: 'NPC (凑数路人甲)',
    emoji: '🟢',
    description: '平淡无奇，但也平安无事',
    gradient: 'from-green-400 via-emerald-400 to-teal-400',
  },
  'T4': {
    name: '拉 (人间凑数)',
    emoji: '⚪',
    description: '2026年苦主，建议躺平',
    gradient: 'from-gray-300 via-gray-400 to-gray-500',
  },
};

// 获取星座运势信息
export function getZodiacFortuneInfo(signId: string): ZodiacFortuneInfo | null {
  return ZODIAC_FORTUNES_2026[signId] || null;
}

// 获取所有星座运势
export function getAllZodiacFortunes(): ZodiacFortuneInfo[] {
  return Object.values(ZODIAC_FORTUNES_2026);
}

// 获取星座列表（用于选择器）
export function getZodiacList(): { id: string; name: string; emoji: string; dateRange: string }[] {
  return Object.values(ZODIAC_FORTUNES_2026).map(z => ({
    id: z.id,
    name: z.name,
    emoji: z.emoji,
    dateRange: z.dateRange,
  }));
}
