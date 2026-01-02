import React, { useEffect, useState } from 'react';
import { getUserCredits, type UserCredits } from '../services/api';
import { Plus } from 'lucide-react';
import BuyStarsModal from './BuyStarsModal';

export interface StarBalanceRef {
  refresh: () => Promise<void>;
}

/**
 * 星星余额显示组件
 */
export const StarBalance = React.forwardRef<StarBalanceRef>((props, ref) => {
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBuyModal, setShowBuyModal] = useState(false);

  const loadCredits = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserCredits();
      setCredits(data);
    } catch (err) {
      console.error('Failed to load credits:', err);
      setError(err instanceof Error ? err.message : '获取星星余额失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCredits();
  }, []);

  // 暴露刷新方法，供父组件调用
  React.useImperativeHandle(
    ref,
    () => ({
      refresh: loadCredits,
    }),
    []
  );

  if (loading) {
    return (
      <div className="star-balance loading">
        <span>加载中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="star-balance error">
        <span>⚠️ {error}</span>
      </div>
    );
  }

  if (!credits) {
    return null;
  }

  return (
    <>
      <div className="star-balance">
        <div className="star-display">
          <span className="star-icon">⭐</span>
          <span className="star-count">{credits.remaining_stars}</span>
          <span className="star-label">颗星星</span>
        </div>
        <button
          onClick={() => setShowBuyModal(true)}
          className="buy-button"
          title="购买星星"
        >
          <Plus size={16} />
        </button>
      </div>

      <BuyStarsModal
        isOpen={showBuyModal}
        onClose={() => setShowBuyModal(false)}
        onSuccess={loadCredits}
      />

      <style jsx>{`
        .star-balance {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }

        .star-balance.loading,
        .star-balance.error {
          background: #f0f0f0;
          color: #666;
        }

        .star-balance.error {
          background: #fee;
          color: #c33;
        }

        .star-display {
          display: flex;
          align-items: center;
          gap: 6px;
          color: white;
          font-weight: 500;
        }

        .star-icon {
          font-size: 20px;
          animation: sparkle 2s ease-in-out infinite;
        }

        .star-count {
          font-size: 18px;
          font-weight: 700;
          min-width: 20px;
          text-align: center;
        }

        .star-label {
          font-size: 14px;
          opacity: 0.9;
        }

        @keyframes sparkle {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
        }

        .star-balance:hover .star-icon {
          animation: sparkle 0.6s ease-in-out infinite;
        }

        .buy-button {
          display: flex;
          align-items: center;
          justify-center;
          width: 24px;
          height: 24px;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
        }

        .buy-button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }
      `}</style>
    </>
  );
});

StarBalance.displayName = 'StarBalance';

export default StarBalance;
