import { NORMAL_LIFE_SYSTEM_INSTRUCTION, TRADER_SYSTEM_INSTRUCTION, ANNUAL_2026_SYSTEM_INSTRUCTION } from '../constants';
import { NORMAL_LIFE_SYSTEM_INSTRUCTION_EN, TRADER_SYSTEM_INSTRUCTION_EN, ANNUAL_2026_SYSTEM_INSTRUCTION_EN } from './prompts-en';

export type Language = 'zh' | 'en';

export interface PromptSet {
  normalLife: string;
  trader: string;
  annual2026: string;
}

// 中文 prompts
const zhPrompts: PromptSet = {
  normalLife: NORMAL_LIFE_SYSTEM_INSTRUCTION,
  trader: TRADER_SYSTEM_INSTRUCTION,
  annual2026: ANNUAL_2026_SYSTEM_INSTRUCTION,
};

// 英文 prompts
const enPrompts: PromptSet = {
  normalLife: NORMAL_LIFE_SYSTEM_INSTRUCTION_EN,
  trader: TRADER_SYSTEM_INSTRUCTION_EN,
  annual2026: ANNUAL_2026_SYSTEM_INSTRUCTION_EN,
};

// 根据语言获取 prompts
export const getPromptsByLanguage = (language: Language): PromptSet => {
  return language === 'en' ? enPrompts : zhPrompts;
};

// 获取指定类型的 prompt
export const getSystemPrompt = (language: Language, type: 'normal' | 'trader' | 'annual2026'): string => {
  const prompts = getPromptsByLanguage(language);
  switch (type) {
    case 'trader':
      return prompts.trader;
    case 'annual2026':
      return prompts.annual2026;
    case 'normal':
    default:
      return prompts.normalLife;
  }
};

// 获取 JSON 输出提示（多语言）
export const getJsonOutputHint = (language: Language): string => {
  return language === 'en'
    ? '\n\nPlease only return pure JSON format data, do not include any markdown code block markers.'
    : '\n\n请务必只返回纯JSON格式数据，不要包含任何markdown代码块标记。';
};
