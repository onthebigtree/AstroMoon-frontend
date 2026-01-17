
import React from 'react';
import { Annual2026Result as Annual2026ResultType, MonthlyKLinePoint } from '../types';
import { Calendar } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Annual2026ResultProps {
  result: Annual2026ResultType;
  userName?: string;
}

// Simple Markdown renderer for the report
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  // Convert markdown to HTML-like structure
  const renderMarkdown = (text: string) => {
    // Split by lines
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: string[] = [];

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-2 mb-4 text-gray-700">
            {currentList.map((item, idx) => (
              <li key={idx} dangerouslySetInnerHTML={{ __html: parseInlineStyles(item) }} />
            ))}
          </ul>
        );
        currentList = [];
      }
    };

    const parseInlineStyles = (line: string): string => {
      // Bold: **text** or __text__
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      line = line.replace(/__(.*?)__/g, '<strong>$1</strong>');
      // Italic: *text* or _text_
      line = line.replace(/\*(.*?)\*/g, '<em>$1</em>');
      line = line.replace(/_(.*?)_/g, '<em>$1</em>');
      return line;
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Empty line
      if (!trimmedLine) {
        flushList();
        return;
      }

      // H2: ## Title
      if (trimmedLine.startsWith('## ')) {
        flushList();
        elements.push(
          <h2 key={index} className="text-2xl font-bold text-gray-800 mt-6 mb-4 flex items-center gap-2">
            <span dangerouslySetInnerHTML={{ __html: parseInlineStyles(trimmedLine.slice(3)) }} />
          </h2>
        );
        return;
      }

      // H3: ### Title
      if (trimmedLine.startsWith('### ')) {
        flushList();
        elements.push(
          <h3 key={index} className="text-xl font-semibold text-gray-700 mt-5 mb-3">
            <span dangerouslySetInnerHTML={{ __html: parseInlineStyles(trimmedLine.slice(4)) }} />
          </h3>
        );
        return;
      }

      // Blockquote: > text
      if (trimmedLine.startsWith('> ')) {
        flushList();
        elements.push(
          <blockquote key={index} className="border-l-4 border-indigo-400 pl-4 py-2 my-4 bg-indigo-50 rounded-r-lg italic text-gray-700">
            <span dangerouslySetInnerHTML={{ __html: parseInlineStyles(trimmedLine.slice(2)) }} />
          </blockquote>
        );
        return;
      }

      // List item: * text or - text
      if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
        currentList.push(trimmedLine.slice(2));
        return;
      }

      // Horizontal rule: ---
      if (trimmedLine === '---') {
        flushList();
        elements.push(<hr key={index} className="my-6 border-gray-200" />);
        return;
      }

      // Regular paragraph
      flushList();
      elements.push(
        <p key={index} className="text-gray-700 leading-relaxed mb-3">
          <span dangerouslySetInnerHTML={{ __html: parseInlineStyles(trimmedLine) }} />
        </p>
      );
    });

    flushList();
    return elements;
  };

  return (
    <div className="prose prose-indigo max-w-none">
      {renderMarkdown(content)}
    </div>
  );
};

// 根据分数或趋势获取运势状态
const getFortuneStatus = (item: MonthlyKLinePoint, isZh: boolean): { label: string; color: string; bgColor: string } => {
  // 优先使用 trend 字段判断
  if (item.trend === 'up') {
    return { label: isZh ? '好运' : 'Good', color: 'text-green-700', bgColor: 'bg-green-100' };
  } else if (item.trend === 'down') {
    return { label: isZh ? '谨慎' : 'Caution', color: 'text-red-700', bgColor: 'bg-red-100' };
  }
  // 如果没有 trend 或是 flat，使用分数判断
  if (item.score >= 75) {
    return { label: isZh ? '好运' : 'Good', color: 'text-green-700', bgColor: 'bg-green-100' };
  } else if (item.score <= 65) {
    return { label: isZh ? '谨慎' : 'Caution', color: 'text-red-700', bgColor: 'bg-red-100' };
  }
  return { label: isZh ? '普通' : 'Normal', color: 'text-yellow-700', bgColor: 'bg-yellow-100' };
};

// Monthly analysis table
const MonthlyTable: React.FC<{ data: MonthlyKLinePoint[]; isZh: boolean }> = ({ data, isZh }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gradient-to-r from-indigo-100 to-purple-100">
            <th className="px-4 py-3 text-left font-semibold text-gray-700">{isZh ? '月份' : 'Month'}</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-700">{isZh ? '运势' : 'Fortune'}</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">{isZh ? '主题' : 'Theme'}</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">{isZh ? '详细分析' : 'Analysis'}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => {
            const fortune = getFortuneStatus(item, isZh);
            return (
              <tr
                key={item.month}
                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                }`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{item.quarter}</span>
                    <span className="font-medium text-gray-800">{item.monthName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${fortune.bgColor} ${fortune.color}`}>
                    {fortune.label}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {item.theme?.map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                    {item.reason}
                  </p>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const Annual2026Result: React.FC<Annual2026ResultProps> = ({ result, userName }) => {
  const { language } = useLanguage();
  const isZh = language === 'zh';
  const { chartData, analysis } = result;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-100 to-teal-100 rounded-full mb-4">
          <Calendar className="w-5 h-5 text-teal-600" />
          <span className="text-teal-700 font-medium">{isZh ? '2026年年运报告' : '2026 Annual Fortune Report'}</span>
        </div>
        {userName && (
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {isZh ? `${userName}的2026年年运` : `${userName}'s 2026 Fortune`}
          </h2>
        )}
        {analysis.summary && (
          <p className="text-gray-600 max-w-2xl mx-auto">
            {analysis.summary}
          </p>
        )}
      </div>

      {/* Markdown Report */}
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <MarkdownRenderer content={analysis.markdownReport} />
      </div>

      {/* Key Months */}
      {(analysis.keyMonths || analysis.peakMonths || analysis.riskMonths) && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">{isZh ? '关键月份提醒' : 'Key Months Reminder'}</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {analysis.keyMonths && (
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="text-sm text-gray-500 mb-1">{isZh ? '关键月份' : 'Key Months'}</div>
                <div className="font-medium text-gray-800">{analysis.keyMonths}</div>
              </div>
            )}
            {analysis.peakMonths && (
              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
                <div className="text-sm text-green-600 mb-1">{isZh ? '高光期' : 'Peak Period'}</div>
                <div className="font-medium text-gray-800">{analysis.peakMonths}</div>
              </div>
            )}
            {analysis.riskMonths && (
              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-red-500">
                <div className="text-sm text-red-600 mb-1">{isZh ? '谨慎期' : 'Caution Period'}</div>
                <div className="font-medium text-gray-800">{analysis.riskMonths}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Monthly Analysis Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            {isZh ? '流月运势详解' : 'Monthly Fortune Details'}
          </h3>
        </div>
        <MonthlyTable data={chartData} isZh={isZh} />
      </div>
    </div>
  );
};

export default Annual2026Result;
