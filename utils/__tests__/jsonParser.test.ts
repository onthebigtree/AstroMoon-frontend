/**
 * JSON 解析器测试用例
 * 演示各种 JSON 修复场景
 */

import { robustParseJSON, extractJSON, fixJSON } from '../jsonParser';

describe('JSON Parser - 修复未闭合字符串', () => {
  test('修复简单的未闭合字符串', () => {
    const input = '{"name": "张三", "age": 30, "description": "这是一个未闭合的字符串';

    // 应该自动补全引号和大括号
    const result = robustParseJSON(input);
    expect(result).toHaveProperty('name');
    expect(result).toHaveProperty('age');

    // 应该标记为不完整
    expect((result as any)._incomplete).toBe(true);
    expect((result as any)._strategy).toBe('standard_fix');
    expect((result as any)._warning).toContain('截断');
  });

  test('修复复杂嵌套中的未闭合字符串', () => {
    const input = `{
      "chartData": [
        {"age": 0, "score": 50, "reason": "出生阶段"},
        {"age": 10, "score": 60, "reason": "成长阶段，健康状况良好
      ]
    }`;

    const result = robustParseJSON(input);
    expect(result).toHaveProperty('chartData');
    expect(Array.isArray(result.chartData)).toBe(true);
  });

  test('处理多个未闭合的括号和字符串', () => {
    const input = `{
      "summary": "人生综合分析",
      "chartData": [
        {"age": 0, "score": 50},
        {"age": 10, "score": 60, "reason": "未完成的原因`;

    // 应该能够修复并返回部分数据
    expect(() => robustParseJSON(input)).not.toThrow();
  });
});

describe('JSON Parser - 智能截断', () => {
  test('截断到最后一个完整的对象', () => {
    const input = `{
      "chartData": [
        {"age": 0, "score": 50, "reason": "完整对象"},
        {"age": 10, "score": 60, "reason": "完整对象"},
        {"age": 20, "score": 70, "reas
      ]
    }`;

    const result = robustParseJSON(input);
    expect(result.chartData.length).toBeGreaterThanOrEqual(2);
  });

  test('处理严重截断的 JSON', () => {
    const input = `{
      "summary": "人生运势分析报告",
      "summaryScore": 75,
      "chartData": [
        {"age": 0, "year": 1990, "open": 50, "close": 55, "high": 60, "low": 45}
      ],
      "analysis": {
        "wealth": "财运`;

    // 应该能够提取 summary 和 summaryScore
    const result = robustParseJSON(input);
    expect(result).toHaveProperty('summary');
    expect(result).toHaveProperty('summaryScore');
  });
});

describe('JSON Parser - 提取功能', () => {
  test('从 markdown 代码块中提取 JSON', () => {
    const input = `这是一些说明文字

\`\`\`json
{
  "name": "测试",
  "value": 123
}
\`\`\`

还有一些额外文字`;

    const result = robustParseJSON(input);
    expect(result.name).toBe('测试');
    expect(result.value).toBe(123);
  });

  test('从混杂文本中提取 JSON', () => {
    const input = `AI 生成的内容:

    根据你的出生信息，生成以下报告：

    {"summary": "综合分析", "score": 85}

    希望这个报告对你有帮助。`;

    const result = robustParseJSON(input);
    expect(result.summary).toBe('综合分析');
    expect(result.score).toBe(85);
  });
});

describe('JSON Parser - 真实场景模拟', () => {
  test('模拟 AI 生成被截断的场景（Unterminated string）', () => {
    // 这是用户遇到的真实错误场景
    const input = `{
  "summary": "根据您的出生信息分析...",
  "summaryScore": 72,
  "chartData": [
    {
      "age": 0,
      "year": 1990,
      "open": 50,
      "close": 55,
      "high": 60,
      "low": 45,
      "score": 55,
      "reason": "出生阶段，生命力开始展现",
      "phase": "起步期"
    },
    {
      "age": 10,
      "year": 2000,
      "open": 55,
      "close": 65,
      "high": 70,
      "low": 50,
      "score": 65,
      "reason": "成长阶段，健康状况逐渐好转`,
      // 这里被截断了！

    // 即使有这样的截断，也应该能解析出前面完整的数据
    const result = robustParseJSON(input);
    expect(result).toHaveProperty('summary');
    expect(result).toHaveProperty('chartData');
    expect(result.chartData.length).toBeGreaterThanOrEqual(1);
  });

  test('处理大型报告的截断', () => {
    // 模拟一个很长的报告在中间被截断
    const chartData = Array.from({ length: 50 }, (_, i) => ({
      age: i,
      year: 1990 + i,
      score: 50 + Math.random() * 30,
      reason: `第 ${i} 年的分析`
    }));

    const completeJSON = JSON.stringify({
      summary: '完整的人生运势分析',
      chartData: chartData,
      analysis: {
        wealth: '财运分析内容',
        health: '健康分析内容'
      }
    });

    // 截断到 80% 的位置
    const truncatedJSON = completeJSON.substring(0, Math.floor(completeJSON.length * 0.8));

    // 应该能够解析出大部分数据
    const result = robustParseJSON(truncatedJSON);
    expect(result).toHaveProperty('summary');
    expect(result).toHaveProperty('chartData');
    expect(result.chartData.length).toBeGreaterThan(20); // 至少能解析出一半
  });
});

describe('JSON Parser - 边界情况', () => {
  test('空字符串', () => {
    expect(() => robustParseJSON('')).toThrow();
  });

  test('纯文本无 JSON', () => {
    expect(() => robustParseJSON('这只是一些普通文本，没有 JSON')).toThrow();
  });

  test('完全损坏的 JSON', () => {
    expect(() => robustParseJSON('{{{[[[')).toThrow();
  });

  test('完整正确的 JSON', () => {
    const input = '{"name": "完美", "score": 100}';
    const result = robustParseJSON(input);
    expect(result.name).toBe('完美');
    expect(result.score).toBe(100);

    // 完整的 JSON 不应该被标记为不完整
    expect((result as any)._incomplete).toBeUndefined();
  });
});

describe('JSON Parser - 元数据和不完整标记', () => {
  test('标准修复应该标记为不完整', () => {
    const input = '{"summary": "测试", "data": "未闭合的字符串';
    const result = robustParseJSON(input);

    expect(result).toHaveProperty('summary', '测试');
    expect((result as any)._incomplete).toBe(true);
    expect((result as any)._strategy).toBe('standard_fix');
    expect((result as any)._warning).toBeDefined();
  });

  test('智能截断应该标记为不完整', () => {
    const input = `{
      "chartData": [
        {"age": 0, "score": 50},
        {"age": 10, "score": 60},
        {"age": 20, "sc
      ]
    }`;

    const result = robustParseJSON(input);
    expect((result as any)._incomplete).toBe(true);
    expect(['smart_truncate', 'standard_fix', 'aggressive_truncate']).toContain((result as any)._strategy);
  });

  test('完整 JSON 不应该有元数据标记', () => {
    const input = '{"summary": "完整数据", "chartData": [{"age": 0}]}';
    const result = robustParseJSON(input);

    expect((result as any)._incomplete).toBeUndefined();
    expect((result as any)._strategy).toBeUndefined();
    expect((result as any)._warning).toBeUndefined();
  });

  test('警告消息应该提供有用信息', () => {
    const input = '{"name": "测试", "desc": "截断的内容';
    const result = robustParseJSON(input);

    if ((result as any)._warning) {
      expect((result as any)._warning).toMatch(/(截断|不完整|退回)/);
    }
  });
});
