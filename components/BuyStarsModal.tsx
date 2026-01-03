import React, { useState, useEffect } from 'react';
import { X, Star, Sparkles, Check, ExternalLink, Loader2, CreditCard } from 'lucide-react';
import type { Product, CreatePaymentRequest, PaymentInvoice } from '../services/api/types';
import { getProducts, createPayment, getPaymentStatus } from '../services/api';

interface BuyStarsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void; // 支付成功后的回调
}

export function BuyStarsModal({ isOpen, onClose, onSuccess }: BuyStarsModalProps) {
  const [products, setProducts] = useState<Record<string, Product> | null>(null);
  const [selectedProductType, setSelectedProductType] = useState<'stars_10' | 'stars_30' | 'stars_100' | null>(null);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [invoiceId, setInvoiceId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // 加载产品列表
  useEffect(() => {
    if (isOpen && !products) {
      loadProducts();
    }
  }, [isOpen]);

  const loadProducts = async () => {
    try {
      const response = await getProducts();
      setProducts(response.products);
    } catch (err: any) {
      console.error('加载产品失败:', err);
      setError('加载产品失败，请刷新重试');
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
        payCurrency: 'usdcbase', // 默认使用 USDT TRC20
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
      setError(err.message || '创建支付失败，请稍后重试');
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

        console.log('支付状态:', invoice.status);

        if (invoice.status === 'finished') {
          clearInterval(intervalId);
          alert(`支付成功！已添加 ${invoice.stars_amount} 颗星星到你的账户 ⭐`);
          onSuccess?.();
          handleClose();
        } else if (invoice.status === 'failed' || invoice.status === 'expired') {
          clearInterval(intervalId);
          setError(invoice.status === 'failed' ? '支付失败' : '支付已过期');
        }
      } catch (err) {
        console.error('查询支付状态失败:', err);
      }
    }, 5000); // 每5秒查询一次

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
        alert(`支付成功！已添加 ${invoice.stars_amount} 颗星星到你的账户 ⭐`);
        onSuccess?.();
        handleClose();
      } else if (invoice.status === 'confirming') {
        alert('支付确认中，请稍后再查看');
      } else if (invoice.status === 'waiting') {
        alert('等待支付，请完成付款后再查询');
      } else if (invoice.status === 'failed') {
        setError('支付失败，请重新尝试');
      } else if (invoice.status === 'expired') {
        setError('支付已过期，请重新创建订单');
      }
    } catch (err: any) {
      console.error('查询支付状态失败:', err);
      setError(err.message || '查询失败，请稍后重试');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleClose = () => {
    setSelectedProductType(null);
    setPaymentUrl(null);
    setInvoiceId(null);
    setError(null);
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
              <h2 className="text-2xl font-bold text-white">购买星星</h2>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-purple-100 mt-2">选择套餐，使用加密货币购买星星</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* 加载中 */}
          {!products && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              <span className="ml-3 text-gray-600">加载中...</span>
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
                      🔥 热门
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
                        <span className="text-gray-600">颗星星</span>
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

          {/* 支付链接已创建 */}
          {paymentUrl && (
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <ExternalLink className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">支付页面已打开</h3>
                  <p className="text-sm text-gray-600">请在新窗口完成支付</p>
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
                  重新打开支付页面
                </a>

                <button
                  onClick={handleCheckStatus}
                  disabled={isCheckingStatus}
                  className="block w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isCheckingStatus ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      查询中...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      我已完成支付
                    </>
                  )}
                </button>
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                <strong>提示：</strong>支付完成后，系统会自动检测并添加星星。你也可以点击"我已完成支付"按钮手动查询状态。
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

          {/* 操作按钮 */}
          {!paymentUrl && products && (
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={handleCreatePayment}
                disabled={!selectedProductType || isCreatingPayment}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2"
              >
                {isCreatingPayment ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    创建中...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    创建支付订单
                  </>
                )}
              </button>
            </div>
          )}

          {/* 支付说明 */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
            <h4 className="font-semibold text-gray-900 mb-2">💳 支持的支付方式</h4>
            <ul className="space-y-1">
              <li>• 支持 BTC、ETH、USDT、USDC 等 300+ 种加密货币</li>
              <li>• 由 NOWPayments 提供安全支付服务</li>
              <li>• 支付确认后自动添加星星到账户</li>
              <li>• 安全可靠，订单实时追踪</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuyStarsModal;
