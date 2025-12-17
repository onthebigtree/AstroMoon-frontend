interface RetryOptions {
  maxRetries: number;
  initialDelay: number;
  onRetry?: (error: Error, attempt: number, delay: number) => void;
}

/**
 * 重试包装器
 * @param fn 要执行的异步函数
 * @param options 重试选项
 * @returns 函数执行结果
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  const { maxRetries, initialDelay, onRetry } = options;
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // 不重试的情况
      if (
        error.code === 'CORS_ERROR' ||
        error.code === 'NETWORK_ERROR' ||
        error.status === 408 || // Timeout
        error.status === 401 || // Unauthorized
        error.status === 403    // Forbidden
      ) {
        throw error;
      }

      // 如果还有重试机会
      if (attempt < maxRetries) {
        const delay = initialDelay * Math.pow(2, attempt); // 指数退避
        if (onRetry) {
          onRetry(error, attempt + 1, delay);
        }
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}
