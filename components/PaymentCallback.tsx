import React, { useEffect, useState } from 'react';
import { getPaymentStatusByOrder, getStarBalance } from '../services/api';
import type { PaymentInvoice } from '../services/api';
import { CheckCircle, Loader2, XCircle, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface PaymentCallbackProps {
  onComplete: () => void;
  onStarsUpdated?: (newBalance: number) => void;
}

type PaymentStatus = 'loading' | 'success' | 'waiting' | 'error';

const PaymentCallback: React.FC<PaymentCallbackProps> = ({ onComplete, onStarsUpdated }) => {
  const { language } = useLanguage();
  const isZh = language === 'zh';
  const [status, setStatus] = useState<PaymentStatus>('loading');
  const [invoice, setInvoice] = useState<PaymentInvoice | null>(null);
  const [error, setError] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(0);

  useEffect(() => {
    // 解析 URL 参数
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment'); // 'success' 或 'cancelled'
    const orderId = urlParams.get('orderId'); // 'astro_123_1234567890'

    if (!orderId) {
      setStatus('error');
      setError(isZh ? '缺少订单 ID' : 'Missing order ID');
      return;
    }

    if (paymentStatus === 'cancelled') {
      setStatus('error');
      setError(isZh ? '支付已取消' : 'Payment cancelled');
      return;
    }

    // 开始查询订单状态
    checkOrderStatus(orderId);
  }, []);

  /**
   * 查询订单状态
   */
  const checkOrderStatus = async (orderId: string) => {
    try {
      const response = await getPaymentStatusByOrder(orderId);

      if (!response.success) {
        setStatus('error');
        setError(isZh ? '查询订单失败' : 'Failed to query order');
        return;
      }

      const invoiceData = response.invoice;
      setInvoice(invoiceData);

      // 根据订单状态显示不同的 UI
      if (invoiceData.status === 'finished') {
        // 支付成功
        setStatus('success');
        await refreshStarBalance();
      } else if (invoiceData.status === 'waiting' || invoiceData.status === 'confirming') {
        // 还在等待确认，开始轮询
        setStatus('waiting');
        startPolling(orderId);
      } else if (invoiceData.status === 'failed' || invoiceData.status === 'expired') {
        // 支付失败或过期
        setStatus('error');
        setError(invoiceData.status === 'failed' ? (isZh ? '支付失败' : 'Payment failed') : (isZh ? '支付已过期' : 'Payment expired'));
      } else {
        // 其他状态
        setStatus('error');
        setError(isZh ? `未知状态: ${invoiceData.status}` : `Unknown status: ${invoiceData.status}`);
      }
    } catch (err: any) {
      console.error('查询订单状态失败:', err);
      setStatus('error');
      setError(err.message || (isZh ? '查询订单状态失败' : 'Failed to query order status'));
    }
  };

  /**
   * 刷新积分余额
   */
  const refreshStarBalance = async () => {
    try {
      const balanceResponse = await getStarBalance();
      if (balanceResponse.success) {
        onStarsUpdated?.(balanceResponse.stars);
      }
    } catch (err) {
      console.error('刷新余额失败:', err);
    }
  };

  /**
   * 开始轮询订单状态
   */
  const startPolling = (orderId: string) => {
    let attempts = 0;
    const maxAttempts = 60; // 最多轮询 60 次（5 分钟）- 适配区块链确认时间
    const pollInterval = 5000; // 每 5 秒轮询一次

    const intervalId = setInterval(async () => {
      attempts++;
      setCountdown(maxAttempts - attempts);

      if (attempts >= maxAttempts) {
        clearInterval(intervalId);
        setStatus('error');
        setError(isZh ? '订单确认超时，请稍后在订单历史中查看' : 'Order confirmation timeout, please check order history later');
        return;
      }

      try {
        const response = await getPaymentStatusByOrder(orderId);
        const invoiceData = response.invoice;
        setInvoice(invoiceData);

        if (invoiceData.status === 'finished') {
          clearInterval(intervalId);
          setStatus('success');
          await refreshStarBalance();
        } else if (invoiceData.status === 'failed' || invoiceData.status === 'expired') {
          clearInterval(intervalId);
          setStatus('error');
          setError(invoiceData.status === 'failed' ? (isZh ? '支付失败' : 'Payment failed') : (isZh ? '支付已过期' : 'Payment expired'));
        }
        // 如果还是 waiting/confirming，继续轮询
      } catch (err: any) {
        console.error('轮询订单状态失败:', err);
        // 不立即报错，继续轮询
      }
    }, pollInterval);

    // 清理函数
    return () => clearInterval(intervalId);
  };

  /**
   * 渲染不同状态的 UI
   */
  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-16 h-16 text-purple-500 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-800">{isZh ? '正在查询订单状态...' : 'Checking order status...'}</h2>
            <p className="text-gray-600">{isZh ? '请稍候' : 'Please wait'}</p>
          </div>
        );

      case 'waiting':
        return (
          <div className="flex flex-col items-center space-y-4">
            <Clock className="w-16 h-16 text-yellow-500 animate-pulse" />
            <h2 className="text-2xl font-bold text-gray-800">{isZh ? '支付正在确认中' : 'Payment confirming'}</h2>
            <p className="text-gray-600">
              {isZh ? '区块链交易需要一定时间确认，请耐心等待...' : 'Blockchain transactions take time to confirm, please wait...'}
            </p>
            {invoice && (
              <div className="bg-gray-100 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{isZh ? '订单号' : 'Order'}:</span>
                  <span className="font-mono text-gray-800">{invoice.order_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{isZh ? '积分数量' : 'Stars'}:</span>
                  <span className="font-semibold text-purple-600">{invoice.stars_amount} ⭐</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{isZh ? '状态' : 'Status'}:</span>
                  <span className="text-yellow-600 capitalize">{invoice.status}</span>
                </div>
              </div>
            )}
            {countdown > 0 && (
              <p className="text-sm text-gray-500">
                {isZh ? `将在 ${countdown} 次后停止自动查询` : `Auto-refresh will stop after ${countdown} attempts`}
              </p>
            )}
          </div>
        );

      case 'success':
        return (
          <div className="flex flex-col items-center space-y-4">
            {/* 成功动画 */}
            <div className="relative">
              <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-25"></div>
              <CheckCircle className="w-20 h-20 text-green-500 relative z-10" />
            </div>

            {/* 成功标题 */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-green-600 mb-2">{isZh ? '充值成功!' : 'Recharge Success!'}</h2>
              {invoice && (
                <p className="text-xl text-gray-700">
                  {isZh ? '已成功充值' : 'Successfully recharged'} <span className="font-bold text-purple-600 text-2xl">{invoice.stars_amount}</span> {isZh ? '积分' : 'Stars'}
                </p>
              )}
            </div>

            {/* 成功提示卡片 */}
            <div className="w-full bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-center gap-2 text-green-700 font-medium">
                <CheckCircle className="w-5 h-5" />
                <span>{isZh ? '积分已到账，可立即使用' : 'Stars credited, ready to use'}</span>
              </div>
              {invoice && (
                <div className="space-y-2 text-sm pt-2 border-t border-green-200">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{isZh ? '订单号' : 'Order'}:</span>
                    <span className="font-mono text-gray-800">{invoice.order_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{isZh ? '支付金额' : 'Amount'}:</span>
                    <span className="font-semibold text-gray-800">
                      {invoice.paid_amount || invoice.price_amount} {invoice.pay_currency.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{isZh ? '完成时间' : 'Completed'}:</span>
                    <span className="text-gray-800">
                      {new Date(invoice.updated_at).toLocaleString(isZh ? 'zh-CN' : 'en-US')}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={onComplete}
              className="mt-4 w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg"
            >
              {isZh ? '开始使用 →' : 'Start Using →'}
            </button>
          </div>
        );

      case 'error':
        return (
          <div className="flex flex-col items-center space-y-4">
            <XCircle className="w-16 h-16 text-red-500" />
            <h2 className="text-2xl font-bold text-gray-800">{isZh ? '支付失败' : 'Payment Failed'}</h2>
            <p className="text-gray-600">{error || (isZh ? '发生未知错误' : 'An unknown error occurred')}</p>
            {invoice && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{isZh ? '订单号' : 'Order'}:</span>
                  <span className="font-mono text-gray-800">{invoice.order_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{isZh ? '状态' : 'Status'}:</span>
                  <span className="text-red-600 capitalize">{invoice.status}</span>
                </div>
              </div>
            )}
            <button
              onClick={onComplete}
              className="mt-4 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              {isZh ? '返回首页' : 'Return Home'}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {renderContent()}
      </div>
    </div>
  );
};

export default PaymentCallback;
