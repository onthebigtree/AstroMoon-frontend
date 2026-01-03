import React, { useState } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { Shield, AlertCircle } from 'lucide-react';

interface TurnstileVerifyProps {
  onVerify: (token: string) => void;
  onCancel: () => void;
}

const TurnstileVerify: React.FC<TurnstileVerifyProps> = ({ onVerify, onCancel }) => {
  const [error, setError] = useState<string>('');
  const [isVerified, setIsVerified] = useState(false);

  // 从环境变量获取 Cloudflare Turnstile Site Key，未配置时默认使用测试密钥
  const siteKey = (import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA').trim();
  const isTestKey = siteKey === '1x00000000000000000000AA';

  const handleSuccess = (token: string) => {
    console.log('✅ Turnstile 验证成功');
    setIsVerified(true);
    setError('');

    // 延迟 500ms 让用户看到成功状态
    setTimeout(() => {
      onVerify(token);
    }, 500);
  };

  const handleError = () => {
    console.error('❌ Turnstile 验证失败');
    setError('验证失败，请刷新页面重试');
    setIsVerified(false);
  };

  const handleExpire = () => {
    console.warn('⚠️ Turnstile 验证已过期');
    setError('验证已过期，请重新验证');
    setIsVerified(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            人类验证
          </h3>
          <p className="text-gray-600 text-sm">
            请完成下方验证以继续生成占星报告
          </p>
        </div>

        <div className="space-y-4">
          {isTestKey && (
            <div className="flex items-start gap-2 text-amber-700 bg-amber-50 px-4 py-3 rounded-lg border border-amber-200">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold">当前使用 Cloudflare 测试密钥</p>
                <p>请在部署环境中把 <code className="px-1 py-0.5 bg-amber-100 rounded">VITE_TURNSTILE_SITE_KEY</code> 替换为正式站点的 key，确保验证在生产可用。</p>
              </div>
            </div>
          )}
          {/* Cloudflare Turnstile 验证组件 */}
          <div className="flex justify-center">
            <Turnstile
              siteKey={siteKey}
              onSuccess={handleSuccess}
              onError={handleError}
              onExpire={handleExpire}
              options={{
                theme: 'light',
                size: 'normal',
                language: 'zh-CN',
              }}
            />
          </div>

          {/* 成功提示 */}
          {isVerified && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-lg border border-green-200">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium">验证成功！正在跳转...</p>
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg border border-red-200">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* 取消按钮 */}
          <div className="pt-2">
            <button
              onClick={onCancel}
              disabled={isVerified}
              className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              取消
            </button>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <Shield className="w-4 h-4" />
            <span>由 Cloudflare 提供安全保护</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TurnstileVerify;
