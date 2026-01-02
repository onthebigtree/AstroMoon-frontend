import React, { useState, useEffect } from 'react';
import { X, Star, Check, Loader2, ExternalLink } from 'lucide-react';
import { getProducts, createOrder, getOrder, type Product, type CreateOrderRequest } from '../services/api';

interface PurchaseStarsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchaseSuccess: () => void;
}

export function PurchaseStarsModal({ isOpen, onClose, onPurchaseSuccess }: PurchaseStarsModalProps) {
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [pollingStatus, setPollingStatus] = useState<'idle' | 'polling' | 'success' | 'failed'>('idle');

  // 加载产品列表
  useEffect(() => {
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen]);

  // 支付轮询
  useEffect(() => {
    if (!orderId || pollingStatus !== 'polling') return;

    let attempts = 0;
    const maxAttempts = 120; // 10分钟 / 5秒

    const poll = async () => {
      try {
        const result = await getOrder(orderId);
        const order = result.order;

        if (order.status === 'confirmed') {
          setPollingStatus('success');
          setTimeout(() => {
            onPurchaseSuccess();
            handleClose();
          }, 2000);
        } else if (order.status === 'failed' || order.status === 'expired') {
          setPollingStatus('failed');
        }

        attempts++;
        if (attempts >= maxAttempts) {
          setPollingStatus('failed');
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    // 立即检查一次
    poll();

    // 设置定时轮询
    const intervalId = setInterval(poll, 5000);

    return () => clearInterval(intervalId);
  }, [orderId, pollingStatus, onPurchaseSuccess]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const result = await getProducts();
      setProducts(result.products);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (productType: string) => {
    setPurchasing(true);
    try {
      const result = await createOrder({ productType } as CreateOrderRequest);
      setOrderId(result.orderId);
      setPaymentUrl(result.paymentUrl);
      setSelectedProduct(productType);
      setPollingStatus('polling');

      // 打开支付页面
      window.open(result.paymentUrl, '_blank', 'width=800,height=600');
    } catch (error: any) {
      alert('创建订单失败：' + error.message);
      setPurchasing(false);
    }
  };

  const handleClose = () => {
    setOrderId(null);
    setPaymentUrl(null);
    setSelectedProduct(null);
    setPollingStatus('idle');
    setPurchasing(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Star className="w-8 h-8 fill-current" />
            <div>
              <h2 className="text-2xl font-bold">购买星星</h2>
              <p className="text-indigo-100 text-sm">选择适合您的套餐</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : orderId ? (
            // 支付状态显示
            <div className="text-center py-12">
              {pollingStatus === 'polling' && (
                <>
                  <Loader2 className="w-16 h-16 animate-spin text-indigo-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">等待支付确认...</h3>
                  <p className="text-gray-600 mb-4">订单号：{orderId}</p>
                  <p className="text-sm text-gray-500 mb-6">
                    请在新窗口中完成支付。支付成功后，星星将自动到账。
                  </p>
                  {paymentUrl && (
                    <a
                      href={paymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                      <ExternalLink className="w-5 h-5" />
                      重新打开支付页面
                    </a>
                  )}
                </>
              )}

              {pollingStatus === 'success' && (
                <>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-green-600 mb-2">支付成功！</h3>
                  <p className="text-gray-600">星星已到账，正在刷新...</p>
                </>
              )}

              {pollingStatus === 'failed' && (
                <>
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="w-10 h-10 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-red-600 mb-2">支付失败</h3>
                  <p className="text-gray-600 mb-6">订单已过期或被取消</p>
                  <button
                    onClick={handleClose}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    关闭
                  </button>
                </>
              )}
            </div>
          ) : (
            // 产品列表
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(products).map(([key, product]) => (
                <div
                  key={key}
                  className={`relative border-2 rounded-xl p-6 transition hover:shadow-lg ${
                    product.popular
                      ? 'border-indigo-600 shadow-lg scale-105'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  {product.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                      最受欢迎
                    </div>
                  )}

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Star className="w-8 h-8 text-yellow-400 fill-current" />
                      <span className="text-3xl font-bold text-gray-800">
                        {product.stars}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {product.name}
                    </h3>

                    <div className="text-3xl font-bold text-indigo-600 mb-4">
                      ${product.price}
                    </div>

                    <p className="text-sm text-gray-600 mb-6 min-h-[3rem]">
                      {product.description}
                    </p>

                    <button
                      onClick={() => handlePurchase(key)}
                      disabled={purchasing}
                      className={`w-full py-3 rounded-lg font-bold transition ${
                        product.popular
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {purchasing ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          处理中...
                        </span>
                      ) : (
                        '立即购买'
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 说明 */}
          {!orderId && !loading && (
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-bold text-blue-800 mb-2">💡 温馨提示</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 每次AI报告生成消耗1颗星星</li>
                <li>• 星星永久有效，不会过期</li>
                <li>• 支持加密货币支付（BTC、ETH、USDC等）</li>
                <li>• 支付成功后星星立即到账</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PurchaseStarsModal;
