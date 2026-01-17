import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';
import { Mail, Lock, LogIn, AlertCircle, Moon, CheckCircle, Eye, EyeOff, UserPlus, MailCheck } from 'lucide-react';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [showUnverified, setShowUnverified] = useState(false);

  const { currentUser, signUp, signIn, resetPassword: resetPwd, loginWithGoogle, sendVerificationEmail, logout } = useAuth();

  // 检查用户是否已验证邮箱
  useEffect(() => {
    if (currentUser && !currentUser.emailVerified && currentUser.providerData[0]?.providerId === 'password') {
      setShowUnverified(true);
    } else {
      setShowUnverified(false);
    }
  }, [currentUser]);

  // 验证邮箱格式
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 验证密码强度
  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return t('errors.passwordMinLength');
    }
    return null;
  };

  // 处理注册
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password || !confirmPassword) {
      setError(t('errors.fillAllFields'));
      return;
    }

    if (!validateEmail(email)) {
      setError(t('errors.invalidEmail'));
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError(t('errors.passwordMismatch'));
      return;
    }

    try {
      setLoading(true);
      await signUp(email, password);
      setSuccess(t('success.signUpSuccess'));
      // 清空表单
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Sign up error:', err);
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError(t('errors.emailAlreadyInUse'));
          break;
        case 'auth/invalid-email':
          setError(t('errors.invalidEmailFormat'));
          break;
        case 'auth/weak-password':
          setError(t('errors.weakPassword'));
          break;
        case 'auth/operation-not-allowed':
          setError(t('errors.operationNotAllowed'));
          break;
        default:
          setError(err.message || t('errors.signUpFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  // 处理登录
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError(t('errors.enterEmailPassword'));
      return;
    }

    if (!validateEmail(email)) {
      setError(t('errors.invalidEmail'));
      return;
    }

    try {
      setLoading(true);
      await signIn(email, password);
      // 登录成功后会自动跳转（由路由处理）
    } catch (err: any) {
      console.error('Sign in error:', err);
      switch (err.code) {
        case 'auth/user-not-found':
          setError(t('errors.userNotFound'));
          break;
        case 'auth/wrong-password':
          setError(t('errors.wrongPassword'));
          break;
        case 'auth/invalid-email':
          setError(t('errors.invalidEmailFormat'));
          break;
        case 'auth/user-disabled':
          setError(t('errors.userDisabled'));
          break;
        case 'auth/too-many-requests':
          setError(t('errors.tooManyRequests'));
          break;
        case 'auth/invalid-credential':
          setError(t('errors.invalidCredential'));
          break;
        default:
          setError(err.message || t('errors.signInFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  // 处理重置密码
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError(t('errors.enterEmail'));
      return;
    }

    if (!validateEmail(email)) {
      setError(t('errors.invalidEmail'));
      return;
    }

    try {
      setLoading(true);
      await resetPwd(email);
      setSuccess(t('login.resetLinkSent'));
    } catch (err: any) {
      console.error('Reset password error:', err);
      switch (err.code) {
        case 'auth/user-not-found':
          setError(t('errors.userNotFound'));
          break;
        case 'auth/invalid-email':
          setError(t('errors.invalidEmailFormat'));
          break;
        default:
          setError(err.message || t('errors.resetFailed'));
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
          setError(t('errors.popupClosed'));
          break;
        case 'auth/popup-blocked':
          setError(t('errors.popupBlocked'));
          break;
        case 'auth/cancelled-popup-request':
          setError(t('errors.loginCancelled'));
          break;
        default:
          setError(err.message || t('errors.googleLoginFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  // 重新发送验证邮件
  const handleResendVerification = async () => {
    try {
      setError('');
      setLoading(true);
      await sendVerificationEmail();
      setSuccess(t('success.verificationResent'));
    } catch (err: any) {
      console.error('Resend verification error:', err);
      setError(err.message || t('errors.verificationFailed'));
    } finally {
      setLoading(false);
    }
  };

  // 退出登录
  const handleLogout = async () => {
    try {
      await logout();
      setShowUnverified(false);
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  };

  // 如果用户已登录但邮箱未验证，显示验证提示
  if (showUnverified && currentUser) {
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
            <div className="flex items-center justify-center gap-4">
              <p className="text-gray-600">{t('login.verifyEmail')}</p>
              <LanguageSwitcher />
            </div>
          </div>

          {/* Verification Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                <MailCheck className="w-10 h-10 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">{t('login.pleaseVerify')}</h3>
              <p className="text-gray-600 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: t('login.verificationSent', { email: currentUser.email }) }} />
              <p className="text-gray-600 text-sm leading-relaxed">
                {t('login.verifyInstructions')}
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <p className="text-sm text-blue-800 font-medium mb-2">💡 {t('login.tips')}</p>
                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                  <li>{t('login.checkSpam')}</li>
                  <li>{t('login.emailDelay')}</li>
                  <li>{t('login.returnAfterVerify')}</li>
                </ul>
              </div>

              {success && (
                <div className="flex items-start gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-lg border border-green-200">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{success}</p>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg border border-red-200">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handleResendVerification}
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('login.sending') : t('login.resendVerification')}
              </button>

              <button
                onClick={() => window.location.reload()}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-all font-medium"
              >
                {t('login.alreadyVerified')}
              </button>

              <button
                onClick={handleLogout}
                className="w-full text-gray-600 text-sm hover:text-gray-900 transition-colors py-2"
              >
                {t('login.logoutBtn')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center justify-center gap-4">
            <p className="text-gray-600">
              {mode === 'signin' ? t('login.loginAccount') : mode === 'signup' ? t('login.createAccount') : t('login.resetPassword')}
            </p>
            <LanguageSwitcher />
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Mode Tabs */}
          {mode !== 'reset' && (
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => {
                  setMode('signin');
                  setError('');
                  setSuccess('');
                }}
                className={`flex-1 py-2 rounded-md font-medium transition-all ${
                  mode === 'signin'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t('login.signIn')}
              </button>
              <button
                onClick={() => {
                  setMode('signup');
                  setError('');
                  setSuccess('');
                }}
                className={`flex-1 py-2 rounded-md font-medium transition-all ${
                  mode === 'signup'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t('login.signUp')}
              </button>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-start gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-lg border border-green-200">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg border border-red-200">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Sign Up Form */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('login.email')} *
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('login.password')} *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder={t('login.atLeast6Chars')}
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('login.confirmPassword')} *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder={t('login.reenterPassword')}
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                {loading ? t('login.signingUp') : t('login.signUpBtn')}
              </button>
            </form>
          )}

          {/* Sign In Form */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('login.email')}
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('login.password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder={t('login.yourPassword')}
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => {
                    setMode('reset');
                    setError('');
                    setSuccess('');
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  {t('login.forgotPassword')}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                {loading ? t('login.loggingIn') : t('login.signIn')}
              </button>
            </form>
          )}

          {/* Reset Password Form */}
          {mode === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('login.email')}
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
                  {t('login.resetInstructions')}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('login.sending') : t('login.resetLink')}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError('');
                  setSuccess('');
                }}
                className="w-full text-gray-600 text-sm hover:text-gray-900 transition-colors py-2"
              >
                {t('login.backToLogin')}
              </button>
            </form>
          )}

          {/* Divider */}
          {mode !== 'reset' && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">{t('login.or')}</span>
              </div>
            </div>
          )}

          {/* Google Login Button */}
          {mode !== 'reset' && (
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
              {t('login.googleLogin', { action: mode === 'signin' ? t('login.signIn') : t('login.signUp') })}
            </button>
          )}

          {/* Info */}
          {mode === 'signup' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <p className="text-xs text-blue-800 leading-relaxed">
                {t('login.emailVerificationInfo')}
              </p>
            </div>
          )}

          {mode === 'signin' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left">
              <p className="text-xs text-amber-800 leading-relaxed">
                {t('login.securityTip')}
              </p>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-gray-500 mt-6">
          {t('login.termsAgreement')}
        </p>
      </div>
    </div>
  );
};

export default Login;
