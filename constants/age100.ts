/**
 * 100 岁 K 线标准描述文案
 * 无论 AI 返回什么内容，都会被替换为这个文案
 */
export const AGE_100_DESCRIPTION = `100岁的绿K就像币圈项目下架前的"谢幕阳线"，是它在阳间留下的最后一抹倔强，它以极致的繁华清零重启（拔吊投胎，开启新生）转世投胎。看懂它，就看懂了人生/币圈一半的荒诞。`;

/**
 * 替换 chartData 中 100 岁的 reason 为标准文案
 * @param chartData K 线数据数组
 * @returns 替换后的 chartData
 */
export function replaceAge100Reason<T extends { age: number; reason: string }>(chartData: T[]): T[] {
  return chartData.map(item => {
    if (item.age === 100) {
      console.log('🔄 替换 100 岁的 reason 文案');
      return {
        ...item,
        reason: AGE_100_DESCRIPTION
      };
    }
    return item;
  });
}
