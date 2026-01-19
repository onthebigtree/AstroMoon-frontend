import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Star, Sparkles, Check, ExternalLink, Loader2, CreditCard, RefreshCw, Gift } from 'lucide-react';
import type { Product, CreatePaymentRequest } from '../services/api/types';
import { getProducts, createPayment, getPaymentStatus, redeemCode } from '../services/api';

interface BuyStarsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void; // 支付成功后的回调
  currentStars?: number | null;
  onRefreshStars?: () => Promise<void> | void;
}

export function BuyStarsModal({ isOpen, onClose, onSuccess, currentStars, onRefreshStars }: BuyStarsModalProps) {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Record<string, Product> | null>(null);
  const [selectedProductType, setSelectedProductType] = useState<'stars_10' | 'stars_30' | 'stars_100' | null>(null);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [invoiceId, setInvoiceId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isRefreshingBalance, setIsRefreshingBalance] = useState(false);

  // 兑换码相关状态
  const [redeemCodeInput, setRedeemCodeInput] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);

  // 加载产品列表
  useEffect(() => {
    if (isOpen && !products) {
      loadProducts();
    }
    if (isOpen && onRefreshStars) {
      refreshStarsBalance(true);
    }
  }, [isOpen]);

  const loadProducts = async () => {
    try {
      const response = await getProducts();
      setProducts(response.products);
    } catch (err: any) {
      console.error('Failed to load products:', err);
      setError(t('buyStars.loadProductsFailed'));
    }
  };

  const refreshStarsBalance = async (withLoading: boolean = false) => {
    if (!onRefreshStars) return;

    if (withLoading) {
      setIsRefreshingBalance(true);
    }

    try {
      await onRefreshStars();
    } catch (err) {
      console.error('Failed to refresh stars balance:', err);
    } finally {
      if (withLoading) {
        setIsRefreshingBalance(false);
      }
    }
  };

  if (!isOpen) return null;

  const handleSelectProduct = (productType: 'stars_10' | 'stars_30' | 'stars_100') => {
    setSelectedProductType(productType);
    setError(null);
  };

  const handleCreatePayment = async () => {
    if (!selectedProductType) return;

    setIsCreatingPayment(true);
    setError(null);

    try {
      const request: CreatePaymentRequest = {
        productType: selectedProductType,
        payCurrency: '', 
      };

      const response = await createPayment(request);
      setPaymentUrl(response.paymentUrl);
      setInvoiceId(response.invoiceId);

      // 自动打开支付页面
      window.open(response.paymentUrl, '_blank');

      // 开始轮询支付状态
      startPollingPaymentStatus(response.invoiceId);
    } catch (err: any) {
      console.error('Failed to create payment:', err);
      setError(err.message || t('buyStars.createPaymentFailed'));
    } finally {
      setIsCreatingPayment(false);
    }
  };

  // 轮询支付状态
  const startPollingPaymentStatus = (id: number) => {
    const intervalId = setInterval(async () => {
      try {
        const statusResponse = await getPaymentStatus(id);
        const invoice = statusResponse.invoice;

        console.log('Payment status:', invoice.status);

        if (invoice.status === 'finished') {
          clearInterval(intervalId);
          alert(t('buyStars.paymentSuccess', { amount: invoice.stars_amount }));
          await refreshStarsBalance();
          onSuccess?.();
          handleClose();
        } else if (invoice.status === 'failed' || invoice.status === 'expired') {
          clearInterval(intervalId);
          setError(invoice.status === 'failed' ? t('buyStars.paymentFailed') : t('buyStars.paymentExpired'));
        }
      } catch (err) {
        console.error('Failed to check payment status:', err);
      }
    }, 5000); // Check every 5 seconds

    // 5分钟后停止轮询
    setTimeout(() => {
      clearInterval(intervalId);
    }, 300000);
  };

  const handleCheckStatus = async () => {
    if (!invoiceId) return;

    setIsCheckingStatus(true);
    setError(null);

    try {
      const statusResponse = await getPaymentStatus(invoiceId);
      const invoice = statusResponse.invoice;

      if (invoice.status === 'finished') {
        alert(t('buyStars.paymentSuccess', { amount: invoice.stars_amount }));
        await refreshStarsBalance();
        onSuccess?.();
        handleClose();
      } else if (invoice.status === 'confirming') {
        alert(t('buyStars.paymentConfirming'));
      } else if (invoice.status === 'waiting') {
        alert(t('buyStars.paymentWaiting'));
      } else if (invoice.status === 'failed') {
        setError(t('buyStars.paymentFailed'));
      } else if (invoice.status === 'expired') {
        setError(t('buyStars.paymentExpiredReorder'));
      }
    } catch (err: any) {
      console.error('Failed to check payment status:', err);
      setError(err.message || t('buyStars.createPaymentFailed'));
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleRedeemCode = async () => {
    if (!redeemCodeInput.trim()) {
      setError(t('buyStars.enterRedeemCode'));
      return;
    }

    setIsRedeeming(true);
    setError(null);
    setRedeemSuccess(null);

    try {
      const response = await redeemCode({ code: redeemCodeInput.trim() });

      console.log('✅ 兑换成功:', response);
      setRedeemSuccess(`${response.message} 当前余额：${response.currentBalance} 积分`);
      setRedeemCodeInput(''); // 清空输入框

      // 刷新积分余额
      if (onRefreshStars) {
        await refreshStarsBalance(false);
      }

      // 成功回调
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (err: any) {
      console.error('Redemption failed:', err);

      // Handle different error types
      const errorMessage = err.message || err.error || t('buyStars.redeemFailed');
      setError(errorMessage);
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleClose = () => {
    setSelectedProductType(null);
    setPaymentUrl(null);
    setInvoiceId(null);
    setError(null);
    setRedeemCodeInput('');
    setRedeemSuccess(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-yellow-300" />
              <h2 className="text-2xl font-bold text-white">{t('buyStars.title')}</h2>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-purple-100 mt-2">{t('buyStars.subtitle')}</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4 bg-purple-50 p-4 rounded-xl border border-purple-100">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-full p-2 shadow-sm border border-yellow-100">
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-400" />
              </div>
              <div>
                <div className="text-xs text-gray-500">{t('buyStars.currentBalance')}</div>
                <div className="text-xl font-bold text-gray-900">
                  {isRefreshingBalance ? '...' : (currentStars ?? '--')}
                </div>
              </div>
            </div>
            {onRefreshStars && (
              <button
                onClick={() => refreshStarsBalance(true)}
                disabled={isRefreshingBalance}
                className="flex items-center gap-2 px-3 py-2 bg-white text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 disabled:opacity-60"
              >
                {isRefreshingBalance ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">{t('buyStars.refresh')}</span>
              </button>
            )}
          </div>

          {/* 兑换码区域 */}
          {!paymentUrl && (
            <div className="mb-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Gift className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-gray-900">{t('buyStars.useRedeemCode')}</h3>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={redeemCodeInput}
                  onChange={(e) => setRedeemCodeInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isRedeeming) {
                      handleRedeemCode();
                    }
                  }}
                  placeholder={t('buyStars.enterCode')}
                  className="flex-1 px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm uppercase"
                  disabled={isRedeeming}
                />
                <button
                  onClick={handleRedeemCode}
                  disabled={isRedeeming || !redeemCodeInput.trim()}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  {isRedeeming ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('buyStars.redeeming')}
                    </>
                  ) : (
                    <>
                      <Gift className="w-4 h-4" />
                      {t('buyStars.redeem')}
                    </>
                  )}
                </button>
              </div>

              {redeemSuccess && (
                <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded-lg flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-green-800">{redeemSuccess}</span>
                </div>
              )}
            </div>
          )}

          {/* Loading */}
          {!products && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              <span className="ml-3 text-gray-600">{t('buyStars.loading')}</span>
            </div>
          )}

          {/* 套餐列表 */}
          {products && !paymentUrl && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {Object.entries(products).map(([productType, product]) => (
                <button
                  key={productType}
                  onClick={() => handleSelectProduct(productType as any)}
                  className={`relative p-6 rounded-xl border-2 transition-all text-left ${
                    selectedProductType === productType
                      ? 'border-purple-500 bg-purple-50 shadow-lg'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                  }`}
                >
                  {product.popular && (
                    <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      🔥 {t('buyStars.popular')}
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        <span className="text-2xl font-bold text-purple-600">
                          {product.stars}
                        </span>
                        <span className="text-gray-600">{t('buyStars.starsUnit')}</span>
                      </div>
                    </div>
                    {selectedProductType === productType && (
                      <Check className="w-6 h-6 text-purple-600" />
                    )}
                  </div>

                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    ${product.price}
                    <span className="text-sm font-normal text-gray-500 ml-2">USD</span>
                  </div>

                  <div className="mt-3 text-sm text-gray-500">
                    {product.description}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Payment URL created */}
          {paymentUrl && (
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <ExternalLink className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{t('buyStars.paymentOpened')}</h3>
                  <p className="text-sm text-gray-600">{t('buyStars.completeInNewWindow')}</p>
                </div>
              </div>

              <div className="space-y-3">
                <a
                  href={paymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  {t('buyStars.reopenPayment')}
                </a>

                <button
                  onClick={handleCheckStatus}
                  disabled={isCheckingStatus}
                  className="block w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isCheckingStatus ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('buyStars.checking')}
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      {t('buyStars.iHavePaid')}
                    </>
                  )}
                </button>
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                {t('buyStars.paymentTip')}
              </div>
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <div className="text-red-600 mt-0.5">⚠️</div>
              <div className="flex-1 text-red-700 text-sm">{error}</div>
            </div>
          )}

          {/* Action buttons */}
          {!paymentUrl && products && (
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                {t('buyStars.cancel')}
              </button>
              <button
                onClick={handleCreatePayment}
                disabled={!selectedProductType || isCreatingPayment}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2"
              >
                {isCreatingPayment ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('buyStars.creating')}
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    {t('buyStars.createOrder')}
                  </>
                )}
              </button>
            </div>
          )}

          {/* Payment methods info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
            <h4 className="font-semibold text-gray-900 mb-2">💳 {t('buyStars.paymentMethods')}</h4>
            <ul className="space-y-1">
              <li>• {t('buyStars.paymentMethod1')}</li>
              <li>• {t('buyStars.paymentMethod2')}</li>
              <li>• {t('buyStars.paymentMethod3')}</li>
              <li>• {t('buyStars.paymentMethod4')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuyStarsModal;
