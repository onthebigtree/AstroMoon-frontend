import { NORMAL_LIFE_SYSTEM_INSTRUCTION } from '../constants';
import { withRetry } from '../utils/retry.ts';
import type { ChartCalculationRequest, ChartCalculationResponse } from '../types';

interface GenerateRequest {
    userPrompt: string;
    systemPrompt?: string;
}

/**
 * 计算星盘数据
 * @param request 出生时间和地点信息
 * @returns 星盘计算结果
 */
export const calculateChart = async (request: ChartCalculationRequest): Promise<ChartCalculationResponse> => {
    // 🔥 使用新的统一 API 端点 /chart/unified
    // 在开发环境直接调用，在生产环境使用 Vercel Serverless Function 代理
    const isDev = import.meta.env.DEV;
    const backendUrl = isDev ? (import.meta.env.VITE_BACKEND_URL || 'http://43.134.98.27:8000') : '';
    const url = backendUrl ? `${backendUrl}/chart/unified` : '/api/calculate-chart';

    console.log('🔮 计算星盘数据 (统一API):', url);
    console.log('📊 请求参数:', request);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: '未知错误' }));
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ 星盘计算成功:', data);
        return data;
    } catch (error: any) {
        console.error('❌ 星盘计算失败:', error);
        throw new Error(`星盘计算失败: ${error.message}`);
    }
};

export const generateWithAPI = async ({ userPrompt, systemPrompt }: GenerateRequest): Promise<string> => {
    // 🔥 安全策略：通过后端服务调用 AI API，隐藏 API Key
    // 🔥 在 Vercel 上使用相对路径，自动路由到 Serverless Function 代理，避免 CORS
    const isDev = import.meta.env.DEV;
    const backendUrl = isDev ? (import.meta.env.VITE_BACKEND_URL || 'http://43.134.98.27:3782') : '';
    const url = backendUrl ? `${backendUrl}/api/generate` : '/api/generate';

    console.log('🔐 使用后端代理（API Key 安全隐藏）:', url);
    console.log('📊 环境信息:', { backendUrl, isDev: import.meta.env.DEV });

    const headers: Record<string, string> = {
        'Accept': 'text/event-stream',
        'Content-Type': 'application/json; charset=utf-8',
    };

    // 后端接口格式
    const payload = {
        systemPrompt: (systemPrompt || NORMAL_LIFE_SYSTEM_INSTRUCTION) + '\n\n请务必只返回纯JSON格式数据，不要包含任何markdown代码块标记。',
        userPrompt: userPrompt,
    };

    // 🔄 使用重试策略包装整个请求流程
    return withRetry(async () => {
        try {
            console.log('📤 发送请求到:', url);
            console.log('📋 请求头:', headers);
            console.log('📦 请求体长度:', JSON.stringify(payload).length, '字符');
            console.log('⏱️  AI 生成预计需要 3-5 分钟，请耐心等待...');

            // 创建一个 AbortController 用于超时控制（10 分钟）
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 600000); // 10 分钟超时

            // 调用后端服务（API Key 已在后端，前端不传递）
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload),
                signal: controller.signal,
            }).finally(() => {
                clearTimeout(timeoutId);
            });

            console.log('📥 响应状态:', response.status, response.statusText);

            if (!response.ok) {
                // 尝试获取详细的错误信息
                const contentType = response.headers.get('content-type');
                let errorMessage = `API 请求失败: ${response.status} ${response.statusText}`;

                try {
                    if (contentType && contentType.includes('application/json')) {
                        const errorData = await response.json();
                        console.log('❌ 错误详情:', errorData);
                        errorMessage = errorData.error?.message || errorData.message || errorData.error || errorMessage;
                    } else {
                        const errorText = await response.text();
                        console.log('❌ 错误文本:', errorText);
                        if (errorText && errorText.length < 200) {
                            errorMessage += `\n${errorText}`;
                        }
                    }
                } catch (parseError) {
                    console.log('❌ 无法解析错误响应:', parseError);
                }

                // 创建包含状态码的错误对象，用于重试判断
                const error: any = new Error(errorMessage);
                error.status = response.status;
                throw error;
            }

            // 🔥 处理流式响应（SSE）
            console.log('📡 接收流式响应...');
            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('无法读取响应流');
            }

            const decoder = new TextDecoder();
            let buffer = '';
            let fullContent = '';
            let finishReason: string | null = null;

            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    console.log('✅ 流式响应接收完成');
                    break;
                }

                // 将字节转换为文本并添加到缓冲区
                buffer += decoder.decode(value, { stream: true });

                // 按行处理
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // 保留不完整的行

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed || trimmed === 'data: [DONE]') continue;

                    if (trimmed.startsWith('data: ')) {
                        try {
                            const json = JSON.parse(trimmed.slice(6));
                            const content = json.choices?.[0]?.delta?.content || '';
                            const reason = json.choices?.[0]?.finish_reason;

                            if (content) {
                                fullContent += content;
                                // 每收到一些内容就打印一次进度
                                if (fullContent.length % 500 === 0) {
                                    console.log(`📊 已接收 ${fullContent.length} 字符...`);
                                }
                            }

                            // 记录完成原因
                            if (reason) {
                                finishReason = reason;
                                console.log('🏁 完成原因:', reason);
                            }
                        } catch (e) {
                            // 忽略解析错误的行
                            console.warn('⚠️ 跳过无法解析的行:', trimmed.slice(0, 100));
                        }
                    }
                }
            }

            // 检查是否因为长度限制而截断
            if (finishReason === 'length') {
                console.warn('⚠️ 警告：生成因 max_tokens 限制而被截断！');
                console.warn('💡 建议：增加 max_tokens 或简化提示词');
                throw new Error('生成被截断：已达到 max_tokens 限制。请尝试：\n1. 增加 max_tokens 设置\n2. 或使用手动模式（可以使用更大 token 限制的 AI）');
            }

            console.log('✅ 完整内容长度:', fullContent.length);
            console.log('✅ 内容前 500 字符:', fullContent.slice(0, 500));
            console.log('✅ 内容后 500 字符:', fullContent.slice(-500));

            // 🔍 调试用：打印完整 JSON（可以复制到 JSON 验证工具）
            console.group('📋 完整 JSON 内容（点击展开）');
            console.log(fullContent);
            console.groupEnd();

            if (!fullContent) {
                throw new Error('API 返回内容为空');
            }

            return fullContent;
        } catch (error: any) {
            console.error('API 调用错误:', error);

            // 检查是否是超时错误（不重试）
            if (error.name === 'AbortError') {
                const err: any = new Error('请求超时（10分钟）。AI 生成时间较长，建议稍后重试。');
                err.status = 408; // Request Timeout
                throw err;
            }

            // 检测是否是 CORS 错误（不重试）
            if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
                const isDev = import.meta.env.DEV;
                if (isDev) {
                    const err: any = new Error('网络请求失败。请确保开发服务器正在运行（npm run dev）并刷新页面重试。');
                    err.code = 'NETWORK_ERROR';
                    throw err;
                } else {
                    const err: any = new Error('CORS 跨域错误：浏览器安全策略阻止了请求。解决方案：\n1. 使用支持 CORS 的 API 服务\n2. 或切换到"手动复制"模式');
                    err.code = 'CORS_ERROR';
                    throw err;
                }
            }

            throw error;
        }
    }, {
        maxRetries: 3,
        initialDelay: 2000, // 前端重试间隔稍长（2秒起）
        onRetry: (error, attempt, delay) => {
            console.log(`🔄 准备重试请求 (第 ${attempt} 次失败)...`);
        }
    });
};
