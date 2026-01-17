import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Calendar, Loader2, AlertCircle, History } from 'lucide-react';
import { getReports, type Report } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

interface ReportHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectReport: (report: Report) => void | Promise<void>;
}

const ReportHistory: React.FC<ReportHistoryProps> = ({ isOpen, onClose, onSelectReport }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadReports();
    }
  }, [isOpen]);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError('');
      const reportList = await getReports();
      setReports(reportList);
    } catch (err: any) {
      console.error('加载报告列表失败:', err);
      setError(err.message || t('historyPage.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectReport = async (report: Report) => {
    try {
      setLoading(true);
      setError('');
      await onSelectReport(report);
      onClose();
    } catch (err: any) {
      console.error('选择报告失败:', err);
      setError(err.message || t('errors.loadReportFailed'));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const locale = language === 'zh' ? 'zh-CN' : 'en-US';
    return new Date(dateStr).toLocaleString(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <History className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{t('historyPage.title')}</h2>
              <p className="text-sm text-gray-500">{t('historyPage.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
              <p className="text-gray-500">{t('historyPage.loading')}</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200 flex items-start gap-2 max-w-md">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">{t('historyPage.loadFailed')}</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
              <button
                onClick={loadReports}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {language === 'zh' ? '重试' : 'Retry'}
              </button>
            </div>
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-600 mb-2">{t('historyPage.noHistory')}</p>
              <p className="text-sm text-gray-400">{t('historyPage.noHistoryDesc')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => handleSelectReport(report)}
                  className="group bg-white border border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 mb-2 truncate group-hover:text-indigo-600 transition-colors">
                      {report.report_title || t('historyPage.unnamed')}
                    </h3>

                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(report.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="flex items-center justify-between text-sm">
            <p className="text-gray-500">
              {t('historyPage.totalReports', { count: reports.length })}
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
            >
              {language === 'zh' ? '关闭' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportHistory;
