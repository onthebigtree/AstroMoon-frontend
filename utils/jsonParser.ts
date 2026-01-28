/**
 * 健壮的 JSON 提取和解析工具
 * 处理 AI 返回的各种格式问题
 */

/**
 * 从文本中提取 JSON 内容
 * 处理 markdown 代码块、多余文本等
 */
export function extractJSON(text: string): string {
  console.log('🔍 开始提取 JSON，原始长度:', text.length);

  let content = text.trim();

  // 1. 移除 markdown 代码块标记
  // 匹配 ```json ... ``` 或 ``` ... ```
  const codeBlockMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) {
    console.log('✂️ 检测到 markdown 代码块，提取内容');
    content = codeBlockMatch[1].trim();
  }

  // 2. 查找第一个 { 和最后一个 }
  const firstBrace = content.indexOf('{');
  const lastBrace = content.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    console.log('✂️ 提取 JSON 对象范围');
    content = content.substring(firstBrace, lastBrace + 1);
  }

  // 3. 移除可能的 BOM 标记
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.substring(1);
  }

  console.log('✅ JSON 提取完成，长度:', content.length);
  return content;
}

/**
 * 检测并修复未闭合的字符串
 * 这是处理 AI 生成被截断最常见的问题
 */
function fixUnterminatedStrings(content: string): string {
  let fixed = content;
  let inString = false;
  let lastQuoteIndex = -1;
  let escapeNext = false;

  // 遍历字符串，追踪引号状态
  for (let i = 0; i < fixed.length; i++) {
    const char = fixed[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (char === '\\') {
      escapeNext = true;
      continue;
    }

    if (char === '"') {
      if (inString) {
        // 字符串结束
        inString = false;
      } else {
        // 字符串开始
        inString = true;
        lastQuoteIndex = i;
      }
    }
  }

  // 如果遍历结束时还在字符串内，说明有未闭合的字符串
  if (inString && lastQuoteIndex !== -1) {
    console.log('🔧 检测到未闭合的字符串，位置:', lastQuoteIndex);
    // 在末尾添加闭合引号
    fixed += '"';
  }

  return fixed;
}

/**
 * 智能截断：移除不完整的尾部内容
 * 当 JSON 被截断时，尝试找到最后一个完整的元素
 */
function truncateIncompleteData(content: string): string {
  console.log('✂️ 尝试智能截断不完整的数据');

  // 策略 1: 查找最后一个完整的对象或数组元素
  // 找到最后一个完整的 } 或 ] 后面可能跟着逗号
  const lastCompleteMatch = content.match(/([}\]])\s*,?\s*([}\]]|$)/g);
  if (lastCompleteMatch) {
    const lastMatch = lastCompleteMatch[lastCompleteMatch.length - 1];
    const lastIndex = content.lastIndexOf(lastMatch);
    if (lastIndex > content.length * 0.5) { // 只有当截断点在后半部分时才应用
      const truncated = content.substring(0, lastIndex + 1);
      console.log('✂️ 截断到最后一个完整元素，长度从', content.length, '到', truncated.length);
      return truncated;
    }
  }

  // 策略 2: 查找最后一个逗号前的内容
  const lastCommaIndex = content.lastIndexOf(',');
  if (lastCommaIndex > content.length * 0.8) { // 只在末尾 20% 范围内查找
    const truncated = content.substring(0, lastCommaIndex);
    console.log('✂️ 截断到最后一个逗号，长度从', content.length, '到', truncated.length);
    return truncated;
  }

  return content;
}

/**
 * 修复常见的 JSON 格式问题
 */
export function fixJSON(content: string): string {
  console.log('🔧 开始修复 JSON...');

  let fixed = content;

  // 0. 首先尝试修复未闭合的字符串（最常见的截断问题）
  try {
    fixed = fixUnterminatedStrings(fixed);
  } catch (err) {
    console.warn('⚠️ 字符串修复失败，继续其他修复步骤');
  }

  // 1. 修复未闭合的数组
  const openBrackets = (fixed.match(/\[/g) || []).length;
  const closeBrackets = (fixed.match(/\]/g) || []).length;
  if (openBrackets > closeBrackets) {
    console.log('🔧 修复未闭合的数组，补充', openBrackets - closeBrackets, '个 ]');
    fixed += ']'.repeat(openBrackets - closeBrackets);
  }

  // 2. 修复未闭合的对象
  const openBraces = (fixed.match(/\{/g) || []).length;
  const closeBraces = (fixed.match(/\}/g) || []).length;
  if (openBraces > closeBraces) {
    console.log('🔧 修复未闭合的对象，补充', openBraces - closeBraces, '个 }');
    fixed += '}'.repeat(openBraces - closeBraces);
  }

  // 3. 修复末尾多余的逗号（JSON 不允许末尾逗号）
  fixed = fixed.replace(/,(\s*[}\]])/g, '$1');

  // 4. 移除控制字符（换行符、制表符除外）
  fixed = fixed.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

  // 5. 修复单引号为双引号（JSON 只允许双引号）
  // 注意：这个比较激进，可能会误改字符串内容，暂时注释
  // fixed = fixed.replace(/'/g, '"');

  console.log('✅ JSON 修复完成');
  return fixed;
}

/**
 * 解析 JSON 并提供详细错误信息
 */
export function parseJSON<T = any>(content: string): T {
  try {
    return JSON.parse(content);
  } catch (err: any) {
    // 提取错误位置信息
    const posMatch = err.message.match(/position (\d+)/);
    const position = posMatch ? parseInt(posMatch[1]) : 0;

    // 显示错误附近的内容
    const start = Math.max(0, position - 100);
    const end = Math.min(content.length, position + 100);
    const snippet = content.substring(start, end);

    console.error('❌ JSON 解析失败');
    console.error('错误信息:', err.message);
    console.error('错误位置:', position);
    console.error('错误附近内容:', snippet);

    throw new Error(`JSON 解析失败: ${err.message}\n位置: ${position}\n附近内容: ${snippet.substring(0, 50)}...`);
  }
}

/**
 * 解析结果接口，包含元数据
 */
export interface ParseResult<T = any> {
  data: T;
  metadata: {
    strategy: 'direct' | 'standard_fix' | 'smart_truncate' | 'aggressive_truncate';
    wasIncomplete: boolean;
    originalLength: number;
    parsedLength?: number;
    warningMessage?: string;
  };
}

/**
 * 完整的解析流程：提取 → 修复 → 解析
 * 增强版：支持多层降级策略，返回元数据标记是否使用了降级策略
 */
export function robustParseJSON<T = any>(text: string): T {
  console.log('🚀 开始健壮 JSON 解析流程');

  const result = robustParseJSONWithMetadata<T>(text);

  // 如果使用了降级策略，在数据对象中添加标记
  if (result.metadata.wasIncomplete) {
    (result.data as any)._incomplete = true;
    (result.data as any)._strategy = result.metadata.strategy;
    (result.data as any)._warning = result.metadata.warningMessage;
  }

  return result.data;
}

/**
 * 完整的解析流程（带元数据）
 * 返回解析结果和使用的策略信息
 */
export function robustParseJSONWithMetadata<T = any>(text: string): ParseResult<T> {
  console.log('🚀 开始健壮 JSON 解析流程');

  // 第一步：提取 JSON
  let content = extractJSON(text);
  const originalLength = content.length;

  // 第二步：尝试直接解析
  try {
    const result = parseJSON<T>(content);
    console.log('✅ 直接解析成功');
    return {
      data: result,
      metadata: {
        strategy: 'direct',
        wasIncomplete: false,
        originalLength,
      }
    };
  } catch (err) {
    console.log('⚠️ 直接解析失败，尝试修复...');
  }

  // 第三步：标准修复后再解析
  try {
    const fixed = fixJSON(content);
    const result = parseJSON<T>(fixed);
    console.log('✅ 标准修复后解析成功');

    // 检查是否修复了字符串（暗示有截断）
    const hadUnterminatedString = content !== fixed && fixed.length > content.length;

    return {
      data: result,
      metadata: {
        strategy: 'standard_fix',
        wasIncomplete: hadUnterminatedString,
        originalLength,
        parsedLength: fixed.length,
        warningMessage: hadUnterminatedString
          ? 'JSON 数据被截断，已尝试修复。建议重新生成以获得完整报告。'
          : undefined
      }
    };
  } catch (err: any) {
    console.log('⚠️ 标准修复失败，尝试智能截断...');
  }

  // 第四步：智能截断后再尝试（降级策略 1）
  try {
    let truncated = truncateIncompleteData(content);
    const truncatedLength = truncated.length;
    truncated = fixJSON(truncated);
    const result = parseJSON<T>(truncated);
    console.log('✅ 智能截断后解析成功');
    console.warn('⚠️ 注意：部分数据被截断，结果可能不完整');

    return {
      data: result,
      metadata: {
        strategy: 'smart_truncate',
        wasIncomplete: true,
        originalLength,
        parsedLength: truncatedLength,
        warningMessage: `报告生成不完整，已截断 ${Math.round((1 - truncatedLength / originalLength) * 100)}% 的内容。您的星星将被退回，请重新生成。`
      }
    };
  } catch (err: any) {
    console.log('⚠️ 智能截断失败，尝试激进截断...');
  }

  // 第五步：激进截断 - 查找最后一个完整的 JSON 对象（降级策略 2）
  try {
    // 从后往前查找，找到第一个看起来完整的 JSON
    let bestAttempt = content;
    for (let i = content.length - 1; i > content.length * 0.3; i--) {
      const substr = content.substring(0, i);
      const openBraces = (substr.match(/\{/g) || []).length;
      const closeBraces = (substr.match(/\}/g) || []).length;

      // 如果括号平衡或只差一点，尝试修复
      if (Math.abs(openBraces - closeBraces) <= 3) {
        try {
          const fixed = fixJSON(substr);
          const result = parseJSON<T>(fixed);
          console.log('✅ 激进截断成功，截断到位置:', i);
          console.warn('⚠️ 警告：使用了激进截断，数据完整性可能受影响');

          return {
            data: result,
            metadata: {
              strategy: 'aggressive_truncate',
              wasIncomplete: true,
              originalLength,
              parsedLength: i,
              warningMessage: `报告生成严重不完整，已截断 ${Math.round((1 - i / originalLength) * 100)}% 的内容。您的星星将被退回，请重新生成。`
            }
          };
        } catch {
          // 继续尝试更短的位置
          continue;
        }
      }
    }
  } catch (err: any) {
    console.log('⚠️ 激进截断也失败了');
  }

  // 第六步：所有策略都失败，抛出详细错误
  console.error('❌ 所有修复策略均失败');

  // 提取错误位置信息
  const firstError = (() => {
    try {
      JSON.parse(content);
    } catch (e: any) {
      return e.message;
    }
    return '未知错误';
  })();

  throw new Error(
    `JSON 解析失败，已尝试所有修复策略。\n\n` +
    `原始错误：${firstError}\n\n` +
    `JSON 长度：${content.length} 字符\n` +
    `前 100 字符：${content.substring(0, 100)}\n` +
    `后 100 字符：${content.substring(Math.max(0, content.length - 100))}\n\n` +
    `建议：\n` +
    `1. AI 生成可能被截断，请重试生成\n` +
    `2. 检查 AI 返回内容是否完整\n` +
    `3. 将内容复制到 JSON 验证工具（jsonlint.com）检查\n` +
    `4. 如果问题持续，请联系技术支持`
  );
}

/**
 * 验证返回数据的结构
 */
export function validateAstroData(data: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // 检查必需字段
  if (!data.chartPoints) {
    errors.push('缺少 chartPoints 字段');
  } else if (!Array.isArray(data.chartPoints)) {
    errors.push('chartPoints 必须是数组');
  } else if (data.chartPoints.length < 10) {
    errors.push(`chartPoints 数量太少（${data.chartPoints.length} < 10）`);
  } else {
    // 检查每个点的必需字段
    const requiredFields = ['age', 'score', 'phase', 'reason'];
    const firstPoint = data.chartPoints[0];
    const missingFields = requiredFields.filter(field => !(field in firstPoint));
    if (missingFields.length > 0) {
      errors.push(`chartPoints 元素缺少字段: ${missingFields.join(', ')}`);
    }
  }

  // 检查分析字段
  if (!data.summary) {
    errors.push('缺少 summary 字段');
  }

  if (!data.traderVitality && !data.personality) {
    errors.push('缺少分析字段（traderVitality 或 personality）');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
