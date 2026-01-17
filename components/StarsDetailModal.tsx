import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Star, Sparkles, Loader2, RefreshCw, Check, ExternalLink, ArrowDownCircle, ArrowUpCircle, ShoppingBag, Receipt, MessageCircle, Gift } from 'lucide-react';
import type { Product, CreatePaymentRequest, Transaction } from '../services/api/types';
import { getProducts, createPayment, getPaymentStatus, getTransactions, redeemCode } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

interface StarsDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStars?: number | null;
  onRefreshStars?: () => Promise<void> | void;
}

type TabType = 'recharge' | 'history';

export function StarsDetailModal({ isOpen, onClose, currentStars, onRefreshStars }: StarsDetailModalProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('recharge');
  const [products, setProducts] = useState<Record<string, Product> | null>(null);
  const [selectedProductType, setSelectedProductType] = useState<'stars_10' | 'stars_30' | 'stars_100' | null>(null);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [invoiceId, setInvoiceId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isRefreshingBalance, setIsRefreshingBalance] = useState(false);

  // 交易历史相关状态
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'recharge' | 'consumption'>('all');

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

  // 切换到历史标签时加载交易记录
  useEffect(() => {
    if (isOpen && activeTab === 'history') {
      loadTransactions();
    }
  }, [isOpen, activeTab, filterType]);

  const loadProducts = async () => {
    try {
      const response = await getProducts();
      setProducts(response.products);
    } catch (err: any) {
      console.error('加载产品失败:', err);
      setError(t('starsCenter.loadProductsFailed') || '加载产品失败，请刷新重试');
    }
  };

  const loadTransactions = async () => {
    try {
      setLoadingTransactions(true);
      const response = await getTransactions({ type: filterType, page: 1, limit: 10 });
      setTransactions(response.transactions);
    } catch (err: any) {
      console.error('加载交易记录失败:', err);
    } finally {
      setLoadingTransactions(false);
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
      console.error('刷新积分余额失败:', err);
    } finally {
      if (withLoading) {
        setIsRefreshingBalance(false);
      }
    }
  };

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
      console.error('创建支付失败:', err);
      setError(err.message || t('starsCenter.createPaymentFailed'));
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const startPollingPaymentStatus = (id: number) => {
    const intervalId = setInterval(async () => {
      try {
        const response = await getPaymentStatus(id);
        if (response.invoice.status === 'finished') {
          clearInterval(intervalId);
          await refreshStarsBalance();
          setPaymentUrl(null);
          setInvoiceId(null);
          setSelectedProductType(null);
        } else if (response.invoice.status === 'failed' || response.invoice.status === 'expired') {
          clearInterval(intervalId);
          const statusText = response.invoice.status === 'failed' ? t('starsCenter.paymentFailed') : t('starsCenter.paymentExpired');
          setError(statusText + t('starsCenter.pleaseRetry'));
        }
      } catch (err) {
        console.error('查询支付状态失败:', err);
      }
    }, 5000);

    setTimeout(() => clearInterval(intervalId), 300000);
  };

  const handleRedeemCode = async () => {
    if (!redeemCodeInput.trim()) {
      setError(t('starsCenter.enterRedeemCode'));
      return;
    }

    setIsRedeeming(true);
    setError(null);
    setRedeemSuccess(null);

    try {
      const response = await redeemCode({ code: redeemCodeInput.trim() });

      console.log('✅ 兑换成功:', response);
      const balanceText = language === 'zh'
        ? `${response.message} 当前余额：${response.currentBalance} 积分`
        : `${response.message} Current balance: ${response.currentBalance} Stars`;
      setRedeemSuccess(balanceText);
      setRedeemCodeInput(''); // 清空输入框

      // 刷新积分余额
      if (onRefreshStars) {
        await refreshStarsBalance(false);
      }

      // 刷新交易记录（如果在历史标签页）
      if (activeTab === 'history') {
        await loadTransactions();
      }
    } catch (err: any) {
      console.error('❌ 兑换失败:', err);

      // 处理不同的错误类型
      const errorMessage = err.message || err.error || t('starsCenter.redeemFailed');
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
    setActiveTab('recharge');
    onClose();
  };

  const formatDate = (dateStr: string) => {
    const locale = language === 'zh' ? 'zh-CN' : 'en-US';
    return new Date(dateStr).toLocaleString(locale, {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getReasonText = (reason?: string) => {
    const reasonMap: Record<string, string> = {
      report_generation: t('starsCenter.generateReport'),
      profile_create: t('starsCenter.createProfile'),
    };
    return reason ? (reasonMap[reason] || reason) : (language === 'zh' ? '消费' : 'Consumption');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-yellow-300" />
              <div>
                <h2 className="text-2xl font-bold text-white">{t('starsCenter.title')}</h2>
                <p className="text-purple-100 text-sm mt-1">{t('starsCenter.subtitle')}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Stars Balance */}
        <div className="p-6 bg-gradient-to-br from-yellow-50 to-purple-50 border-b border-purple-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-full p-3 shadow-md border border-yellow-200">
                <Star className="w-8 h-8 text-yellow-500 fill-yellow-400" />
              </div>
              <div>
                <div className="text-sm text-gray-600">{t('starsCenter.currentBalance')}</div>
                <div className="text-3xl font-bold text-gray-900">
                  {isRefreshingBalance ? <Loader2 className="w-6 h-6 animate-spin inline-block" /> : (currentStars ?? '--')}
                  <span className="text-lg text-gray-500 ml-2">{language === 'zh' ? '积分' : 'Stars'}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">{t('starsCenter.balanceDesc')}</div>
              </div>
            </div>
            {onRefreshStars && (
              <button
                onClick={() => refreshStarsBalance(true)}
                disabled={isRefreshingBalance}
                className="flex items-center gap-2 px-4 py-2 bg-white text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-50 disabled:opacity-60 transition-colors shadow-sm"
              >
                {isRefreshingBalance ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">{language === 'zh' ? '刷新' : 'Refresh'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          <button
            onClick={() => setActiveTab('recharge')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'recharge'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            {t('starsCenter.rechargeTab')}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'history'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Receipt className="w-4 h-4" />
            {t('starsCenter.historyTab')}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'recharge' && (
            <>
              {/* 错误提示 */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* 加载中 */}
              {!products && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                  <span className="ml-3 text-gray-600">{t('starsCenter.loading')}</span>
                </div>
              )}

              {/* 兑换码区域 */}
              {!paymentUrl && (
                <div className="mb-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Gift className="w-5 h-5 text-green-600" />
                    <h3 className="font-bold text-gray-900">{t('starsCenter.useRedeemCode')}</h3>
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
                      placeholder={t('starsCenter.redeemPlaceholder')}
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
                          {t('starsCenter.redeeming')}
                        </>
                      ) : (
                        <>
                          <Gift className="w-4 h-4" />
                          {t('starsCenter.redeem')}
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

              {/* 套餐列表 */}
              {products && !paymentUrl && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {Object.entries(products).map(([productType, product]) => (
                      <button
                        key={productType}
                        onClick={() => handleSelectProduct(productType as any)}
                        className={`relative p-6 rounded-xl border-2 transition-all text-left ${
                          selectedProductType === productType
                            ? 'border-purple-500 bg-purple-50 shadow-lg'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        {product.popular && (
                          <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                            {language === 'zh' ? '热门' : 'Popular'}
                          </div>
                        )}
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{product.name}</h3>
                        <div className="flex items-center gap-2 mb-3">
                          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                          <span className="text-2xl font-bold text-purple-600">{product.stars}</span>
                          <span className="text-sm text-gray-500">{language === 'zh' ? '积分' : 'Stars'}</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-2">
                          ${product.price}
                        </div>
                        <p className="text-sm text-gray-600">{product.description}</p>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleCreatePayment}
                    disabled={!selectedProductType || isCreatingPayment}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                  >
                    {isCreatingPayment ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t('starsCenter.creatingOrder')}
                      </span>
                    ) : (
                      t('starsCenter.createOrder')
                    )}
                  </button>

                  {/* 客服联系 */}
                  <div className="mt-4 flex items-center justify-center">
                    <a
                      href="https://t.me/moonmaid"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-purple-600 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{t('starsCenter.contactSupport')}</span>
                    </a>
                  </div>

                  {/* 退款说明 */}
                  <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <h4 className="text-sm font-bold text-amber-800 mb-2">{t('starsCenter.purchaseNotice')}</h4>
                    <ul className="text-xs text-amber-700 space-y-1">
                      <li>• {t('starsCenter.notice1')}</li>
                      <li>• {t('starsCenter.notice2')}</li>
                      <li>• <strong>{t('starsCenter.notice3')}</strong></li>
                      <li>• {t('starsCenter.notice4')}</li>
                    </ul>
                  </div>
                </>
              )}

              {/* 支付中 */}
              {paymentUrl && (
                <div className="text-center py-8">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-4">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">{t('starsCenter.waitingPayment')}</p>
                    <p className="text-sm text-gray-600 mb-4">
                      {t('starsCenter.paymentWindowOpened')}
                    </p>
                    <a
                      href={paymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {t('starsCenter.reopenPayment')}
                    </a>
                  </div>
                  {/* 支付中也显示客服联系 */}
                  <a
                    href="https://t.me/moonmaid"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-purple-600"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {t('starsCenter.paymentIssue')}
                  </a>
                </div>
              )}
            </>
          )}

          {activeTab === 'history' && (
            <>
              {/* Filter Tabs */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterType === 'all'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {language === 'zh' ? '全部' : 'All'}
                </button>
                <button
                  onClick={() => setFilterType('recharge')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterType === 'recharge'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {language === 'zh' ? '充值' : 'Recharge'}
                </button>
                <button
                  onClick={() => setFilterType('consumption')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterType === 'consumption'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {language === 'zh' ? '消费' : 'Consumption'}
                </button>
              </div>

              {/* Transactions List */}
              {loadingTransactions ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                  <span className="ml-3 text-gray-600">{t('starsCenter.loading')}</span>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12">
                  <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">{t('starsCenter.noRecords')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          transaction.type === 'recharge' ? 'bg-green-50' : 'bg-orange-50'
                        }`}>
                          {transaction.type === 'recharge' ? (
                            <ArrowUpCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <ArrowDownCircle className="w-5 h-5 text-orange-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {transaction.type === 'recharge' ? t('starsCenter.rechargeStars') : getReasonText(transaction.reason)}
                          </p>
                          <p className="text-xs text-gray-500">{formatDate(transaction.timestamp)}</p>
                        </div>
                      </div>
                      <div className={`text-lg font-bold ${
                        transaction.type === 'recharge' ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {transaction.stars > 0 ? '+' : ''}{transaction.stars}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default StarsDetailModal;
