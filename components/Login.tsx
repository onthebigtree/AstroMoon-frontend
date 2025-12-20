import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, LogIn, AlertCircle, Moon, CheckCircle } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const { sendLoginLink, loginWithGoogle } = useAuth();

  // 倒计时逻辑
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 处理邮件登录
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('请输入邮箱地址');
      return;
    }

    // 基本的邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('请输入有效的邮箱地址');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await sendLoginLink(email);
      setEmailSent(true);
      setCountdown(60); // 60秒倒计时
    } catch (err: any) {
      console.error('Send login link error:', err);

      // Firebase 错误信息处理
      switch (err.code) {
        case 'auth/invalid-email':
          setError('邮箱格式不正确');
          break;
        case 'auth/missing-email':
          setError('请输入邮箱地址');
          break;
        case 'auth/quota-exceeded':
          setError('发送次数过多，请稍后再试');
          break;
        case 'auth/unauthorized-domain':
          setError('当前域名未授权，请联系管理员配置 Firebase 授权域');
          break;
        default:
          setError(err.message || '发送登录链接失败，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  // 处理 Google 登录
  const handleGoogleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
    } catch (err: any) {
      console.error('Google login error:', err);

      switch (err.code) {
        case 'auth/popup-closed-by-user':
          setError('登录窗口已关闭');
          break;
        case 'auth/popup-blocked':
          setError('浏览器阻止了弹出窗口，请允许弹窗后重试');
          break;
        case 'auth/cancelled-popup-request':
          setError('登录已取消');
          break;
        case 'auth/unauthorized-domain':
          setError('当前域名未在 Firebase 授权域列表中，请按以下步骤配置：\n\n1. 访问 Firebase Console\n2. 进入 Authentication → Settings → Authorized domains\n3. 添加当前域名: ' + window.location.hostname);
          break;
        case 'auth/operation-not-allowed':
          setError('Google 登录未启用，请在 Firebase Console 中启用');
          break;
        default:
          setError(err.message || 'Google 登录失败，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  // 重新发送邮件
  const handleResendEmail = async () => {
    if (countdown > 0) return;
    setEmailSent(false);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-lg mb-4">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-2 rounded-lg">
              <Moon className="w-8 h-8" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-serif-sc font-bold text-gray-900">Astro Moon</h1>
              <p className="text-xs text-gray-500 uppercase tracking-widest">Astrology & Life Analysis</p>
            </div>
          </div>
          <p className="text-gray-600">
            {emailSent ? '查看您的邮箱' : '登录您的账户'}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {emailSent ? (
            /* Email Sent Success Message */
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">登录链接已发送！</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                我们已向 <strong className="text-indigo-600">{email}</strong> 发送了一封包含登录链接的邮件。
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                请点击邮件中的链接完成登录。链接有效期为 60 分钟。
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <p className="text-sm text-blue-800 font-medium mb-2">💡 提示：</p>
                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                  <li>请检查您的垃圾邮件文件夹</li>
                  <li>确保在同一浏览器中打开链接</li>
                  <li>如果未收到邮件，请稍后重新发送</li>
                </ul>
              </div>

              <button
                onClick={handleResendEmail}
                disabled={countdown > 0}
                className={`w-full py-3 rounded-lg transition-all font-medium ${
                  countdown > 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {countdown > 0 ? `${countdown}秒后可重新发送` : '重新发送邮件'}
              </button>

              <button
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                  setError('');
                }}
                className="w-full text-gray-600 text-sm hover:text-gray-900 transition-colors py-2"
              >
                使用其他邮箱
              </button>
            </div>
          ) : (
            <>
              {/* Email Login Form */}
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    邮箱地址
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="your@email.com"
                      disabled={loading}
                      autoComplete="email"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    我们将向您的邮箱发送一个安全的登录链接
                  </p>
                </div>

                {error && (
                  <div className="flex items-start gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg border border-red-200">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p className="text-sm whitespace-pre-line">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <LogIn className="w-5 h-5" />
                  {loading ? '发送中...' : '发送登录链接'}
                </button>
              </form>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">或</span>
                </div>
              </div>

              {/* Google Login Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                使用 Google 账号登录
              </button>

              {/* Info */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left">
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong>🔒 安全提示：</strong> 我们使用无密码登录方式，通过发送安全链接到您的邮箱来验证身份。您无需记住密码，更加安全便捷。
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-gray-500 mt-6">
          登录即表示您同意我们的服务条款和隐私政策
        </p>
      </div>
    </div>
  );
};

export default Login;
