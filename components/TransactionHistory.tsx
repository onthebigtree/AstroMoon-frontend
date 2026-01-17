import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle, Receipt, ArrowDownCircle, ArrowUpCircle, Filter } from 'lucide-react';
import { getTransactions } from '../services/api/payments';
import type { Transaction } from '../services/api/types';
import { useLanguage } from '../contexts/LanguageContext';

interface TransactionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const isZh = language === 'zh';
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'recharge' | 'consumption'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (isOpen) {
      loadTransactions();
    }
  }, [isOpen, filterType, page]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getTransactions({
        type: filterType,
        page,
        limit: 20
      });
      setTransactions(response.transactions);
      setTotalPages(response.pagination.totalPages);
    } catch (err: any) {
      console.error('加载交易记录失败:', err);
      setError(err.message || (isZh ? '加载交易记录失败' : 'Failed to load transactions'));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const locale = isZh ? 'zh-CN' : 'en-US';
    return new Date(dateStr).toLocaleString(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatStars = (stars: number) => {
    if (stars > 0) {
      return `+${stars}`;
    }
    return stars.toString();
  };

  const getTransactionIcon = (type: string) => {
    if (type === 'recharge') {
      return <ArrowUpCircle className="w-5 h-5 text-green-600" />;
    }
    return <ArrowDownCircle className="w-5 h-5 text-orange-600" />;
  };

  const getTransactionColor = (type: string) => {
    if (type === 'recharge') {
      return 'text-green-600';
    }
    return 'text-orange-600';
  };

  const getStatusText = (transaction: Transaction) => {
    if (transaction.type === 'recharge') {
      const statusMap: Record<string, Record<string, string>> = {
        zh: {
          waiting: '等待支付',
          confirming: '确认中',
          confirmed: '已确认',
          finished: '已完成',
          failed: '失败',
          expired: '已过期',
        },
        en: {
          waiting: 'Waiting',
          confirming: 'Confirming',
          confirmed: 'Confirmed',
          finished: 'Completed',
          failed: 'Failed',
          expired: 'Expired',
        }
      };
      return statusMap[language]?.[transaction.status] || transaction.status;
    }
    return isZh ? '已完成' : 'Completed';
  };

  const getReasonText = (reason?: string) => {
    const reasonMap: Record<string, Record<string, string>> = {
      zh: {
        report_generation: '生成报告',
        profile_create: '创建档案',
      },
      en: {
        report_generation: 'Generate Report',
        profile_create: 'Create Profile',
      }
    };
    return reason ? (reasonMap[language]?.[reason] || reason) : (isZh ? '消费' : 'Consumption');
  };

  const handleFilterChange = (newFilter: 'all' | 'recharge' | 'consumption') => {
    setFilterType(newFilter);
    setPage(1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Receipt className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{isZh ? '交易记录' : 'Transaction History'}</h2>
              <p className="text-sm text-gray-500">{isZh ? '查看积分充值和消费历史' : 'View stars recharge and consumption history'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="px-6 pt-4 pb-2 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <div className="flex gap-2">
              <button
                onClick={() => handleFilterChange('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isZh ? '全部' : 'All'}
              </button>
              <button
                onClick={() => handleFilterChange('recharge')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'recharge'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isZh ? '充值' : 'Recharge'}
              </button>
              <button
                onClick={() => handleFilterChange('consumption')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'consumption'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isZh ? '消费' : 'Consumption'}
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-4" />
              <p className="text-gray-500">{isZh ? '加载中...' : 'Loading...'}</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200 flex items-start gap-2 max-w-md">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">{isZh ? '加载失败' : 'Load Failed'}</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
              <button
                onClick={loadTransactions}
                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                {isZh ? '重试' : 'Retry'}
              </button>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                <Receipt className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-600 mb-2">{isZh ? '暂无交易记录' : 'No Transactions'}</p>
              <p className="text-sm text-gray-400">
                {filterType === 'all' && (isZh ? '还没有任何交易记录' : 'No transaction records yet')}
                {filterType === 'recharge' && (isZh ? '还没有充值记录' : 'No recharge records yet')}
                {filterType === 'consumption' && (isZh ? '还没有消费记录' : 'No consumption records yet')}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    {/* Left side: Icon and details */}
                    <div className="flex items-start gap-3 flex-1">
                      <div className="bg-gray-50 p-2 rounded-lg mt-0.5">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        {transaction.type === 'recharge' ? (
                          <>
                            <h3 className="font-bold text-gray-900 mb-1">
                              {isZh ? '充值积分' : 'Recharge Stars'}
                            </h3>
                            <div className="space-y-1 text-sm text-gray-600">
                              <p>{isZh ? '订单号' : 'Order'}: {transaction.orderId}</p>
                              {transaction.productType && (
                                <p>{isZh ? '套餐' : 'Package'}: {transaction.productType.replace('stars_', '') + (isZh ? ' 积分' : ' Stars')}</p>
                              )}
                              {transaction.priceAmount && (
                                <p>
                                  {isZh ? '金额' : 'Amount'}: ${transaction.priceAmount.toFixed(2)}
                                  {transaction.payCurrency && transaction.paidAmount && (
                                    <span className="ml-1">
                                      ({transaction.paidAmount} {transaction.payCurrency.toUpperCase()})
                                    </span>
                                  )}
                                </p>
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            <h3 className="font-bold text-gray-900 mb-1">
                              {getReasonText(transaction.reason)}
                            </h3>
                            <div className="space-y-1 text-sm text-gray-600">
                              {transaction.resourceType && (
                                <p>{isZh ? '类型' : 'Type'}: {transaction.resourceType}</p>
                              )}
                              {transaction.remainingStars !== undefined && (
                                <p>{isZh ? '剩余' : 'Remaining'}: {transaction.remainingStars} {isZh ? '积分' : 'Stars'}</p>
                              )}
                            </div>
                          </>
                        )}
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <span>{formatDate(transaction.timestamp)}</span>
                          <span>•</span>
                          <span className={
                            transaction.status === 'finished' || transaction.status === 'completed'
                              ? 'text-green-600'
                              : transaction.status === 'failed'
                              ? 'text-red-600'
                              : 'text-yellow-600'
                          }>
                            {getStatusText(transaction)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right side: Stars amount */}
                    <div className="text-right ml-4">
                      <p className={`text-2xl font-bold ${getTransactionColor(transaction.type)}`}>
                        {formatStars(transaction.stars)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{isZh ? '积分' : 'Stars'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Pagination */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="flex items-center justify-between text-sm">
            <p className="text-gray-500">
              {isZh ? '共' : 'Total'} <span className="font-bold text-gray-900">{transactions.length}</span> {isZh ? '条记录' : 'records'}
            </p>
            <div className="flex items-center gap-2">
              {totalPages > 1 && (
                <>
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isZh ? '上一页' : 'Previous'}
                  </button>
                  <span className="text-gray-600">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isZh ? '下一页' : 'Next'}
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="ml-2 px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
              >
                {isZh ? '关闭' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
