import React, { useState } from 'react';
import { X, Star, Sparkles, Check, ExternalLink, Loader2 } from 'lucide-react';
import { STAR_PACKAGES, type StarPackage, createCoinbasePayment, getPaymentStatus } from '../services/api/payment';

interface BuyStarsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void; // 支付成功后的回调
}

export function BuyStarsModal({ isOpen, onClose, onSuccess }: BuyStarsModalProps) {
  const [selectedPackage, setSelectedPackage] = useState<StarPackage | null>(null);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [chargeId, setChargeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  if (!isOpen) return null;

  const handleSelectPackage = (pkg: StarPackage) => {
    setSelectedPackage(pkg);
    setError(null);
  };

  const handleCreatePayment = async () => {
    if (!selectedPackage) return;

    setIsCreatingPayment(true);
    setError(null);

    try {
      const response = await createCoinbasePayment(selectedPackage.id);
      setPaymentUrl(response.hostedUrl);
      setChargeId(response.chargeId);

      // 自动打开支付页面
      window.open(response.hostedUrl, '_blank');
    } catch (err: any) {
      console.error('创建支付失败:', err);
      setError(err.message || '创建支付失败，请稍后重试');
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!chargeId) return;

    setIsCheckingStatus(true);
    setError(null);

    try {
      const status = await getPaymentStatus(chargeId);

      if (status.status === 'confirmed') {
        alert(`支付成功！已添加 ${status.starsAdded} 颗星星到你的账户 ⭐`);
        onSuccess?.();
        handleClose();
      } else if (status.status === 'pending') {
        alert('支付还在处理中，请稍后再查看');
      } else if (status.status === 'failed') {
        setError('支付失败，请重新尝试');
      } else if (status.status === 'expired') {
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
    setSelectedPackage(null);
    setPaymentUrl(null);
    setChargeId(null);
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
          {/* 套餐列表 */}
          {!paymentUrl && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {STAR_PACKAGES.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => handleSelectPackage(pkg)}
                  className={`relative p-6 rounded-xl border-2 transition-all text-left ${
                    selectedPackage?.id === pkg.id
                      ? 'border-purple-500 bg-purple-50 shadow-lg'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      🔥 热门
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{pkg.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        <span className="text-2xl font-bold text-purple-600">
                          {pkg.stars}
                          {pkg.bonus && (
                            <span className="text-sm text-green-600 ml-1">+{pkg.bonus}</span>
                          )}
                        </span>
                        <span className="text-gray-600">颗星星</span>
                      </div>
                    </div>
                    {selectedPackage?.id === pkg.id && (
                      <Check className="w-6 h-6 text-purple-600" />
                    )}
                  </div>

                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    ${pkg.price}
                    <span className="text-sm font-normal text-gray-500 ml-2">USD</span>
                  </div>

                  {pkg.bonus && (
                    <div className="inline-block bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded">
                      额外赠送 {pkg.bonus} 颗 ⭐
                    </div>
                  )}

                  <div className="mt-3 text-sm text-gray-500">
                    约 ${(pkg.price / (pkg.stars + (pkg.bonus || 0))).toFixed(2)} / 星
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
                <strong>提示：</strong>支付完成后，点击"我已完成支付"按钮查询状态
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
          {!paymentUrl && (
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={handleCreatePayment}
                disabled={!selectedPackage || isCreatingPayment}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2"
              >
                {isCreatingPayment ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    创建中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
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
              <li>• 支持 USDC、USDT、ETH、BTC 等数百种加密货币</li>
              <li>• 由 Coinbase Commerce 提供安全支付</li>
              <li>• 支付确认后自动添加星星到账户</li>
              <li>• 订单有效期 1 小时</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuyStarsModal;
