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
 * 修复常见的 JSON 格式问题
 */
export function fixJSON(content: string): string {
  console.log('🔧 开始修复 JSON...');

  let fixed = content;

  // 1. 修复未闭合的数组
  const openBrackets = (fixed.match(/\[/g) || []).length;
  const closeBrackets = (fixed.match(/\]/g) || []).length;
  if (openBrackets > closeBrackets) {
    console.log('🔧 修复未闭合的数组');
    fixed += ']'.repeat(openBrackets - closeBrackets);
  }

  // 2. 修复未闭合的对象
  const openBraces = (fixed.match(/\{/g) || []).length;
  const closeBraces = (fixed.match(/\}/g) || []).length;
  if (openBraces > closeBraces) {
    console.log('🔧 修复未闭合的对象');
    fixed += '}'.repeat(openBraces - closeBraces);
  }

  // 3. 修复末尾多余的逗号（JSON 不允许末尾逗号）
  fixed = fixed.replace(/,(\s*[}\]])/g, '$1');

  // 4. 修复单引号为双引号（JSON 只允许双引号）
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
 * 完整的解析流程：提取 → 修复 → 解析
 */
export function robustParseJSON<T = any>(text: string): T {
  console.log('🚀 开始健壮 JSON 解析流程');

  // 第一步：提取 JSON
  let content = extractJSON(text);

  // 第二步：尝试直接解析
  try {
    const result = parseJSON<T>(content);
    console.log('✅ 直接解析成功');
    return result;
  } catch (err) {
    console.log('⚠️ 直接解析失败，尝试修复...');
  }

  // 第三步：修复后再解析
  try {
    const fixed = fixJSON(content);
    const result = parseJSON<T>(fixed);
    console.log('✅ 修复后解析成功');
    return result;
  } catch (err: any) {
    console.error('❌ 修复后仍然失败');
    throw new Error(
      `JSON 解析失败。\n\n` +
      `原因：${err.message}\n\n` +
      `建议：\n` +
      `1. 检查 AI 返回内容是否完整\n` +
      `2. 将内容复制到 JSON 验证工具（如 jsonlint.com）检查\n` +
      `3. 确认 AI 返回的是纯 JSON 格式，没有额外的文字说明`
    );
  }
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
