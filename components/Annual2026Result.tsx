
import React from 'react';
import MonthlyKLineChart from './MonthlyKLineChart';
import { Annual2026Result as Annual2026ResultType, MonthlyKLinePoint } from '../types';
import { Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';

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

// Monthly analysis table
const MonthlyTable: React.FC<{ data: MonthlyKLinePoint[] }> = ({ data }) => {
  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendColor = (trend?: string) => {
    switch (trend) {
      case 'up':
        return 'bg-green-50 text-green-700';
      case 'down':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gradient-to-r from-indigo-100 to-purple-100">
            <th className="px-4 py-3 text-left font-semibold text-gray-700">月份</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-700">趋势</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-700">评分</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">主题</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">详细分析</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
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
                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${getTrendColor(item.trend)}`}>
                  {getTrendIcon(item.trend)}
                </div>
              </td>
              <td className="px-4 py-3 text-center">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
                  item.score >= 70 ? 'bg-green-100 text-green-700' :
                  item.score >= 50 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {item.score}
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
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Annual2026Result: React.FC<Annual2026ResultProps> = ({ result, userName }) => {
  const { chartData, analysis } = result;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-100 to-teal-100 rounded-full mb-4">
          <Calendar className="w-5 h-5 text-teal-600" />
          <span className="text-teal-700 font-medium">2026年年运报告</span>
        </div>
        {userName && (
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {userName}的2026年年运
          </h2>
        )}
        {analysis.summary && (
          <p className="text-gray-600 max-w-2xl mx-auto">
            {analysis.summary}
          </p>
        )}
      </div>

      {/* Monthly K-Line Chart */}
      <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
        <MonthlyKLineChart data={chartData} />
      </div>

      {/* Markdown Report */}
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <MarkdownRenderer content={analysis.markdownReport} />
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { title: analysis.traderVitalityTitle || '年度核心', score: analysis.traderVitalityScore, color: 'from-purple-500 to-indigo-500' },
          { title: analysis.wealthPotentialTitle || '事业财富', score: analysis.wealthPotentialScore, color: 'from-amber-500 to-orange-500' },
          { title: analysis.fortuneLuckTitle || '情感关系', score: analysis.fortuneLuckScore, color: 'from-pink-500 to-rose-500' },
          { title: analysis.leverageRiskTitle || '健康身心', score: analysis.leverageRiskScore, color: 'from-green-500 to-emerald-500' },
          { title: analysis.platformTeamTitle || '贵人机遇', score: analysis.platformTeamScore, color: 'from-blue-500 to-cyan-500' },
          { title: analysis.tradingStyleTitle || '行动建议', score: analysis.tradingStyleScore, color: 'from-violet-500 to-purple-500' },
        ].map((item, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${item.color} rounded-xl p-4 text-white shadow-lg`}
          >
            <div className="text-xs opacity-80 mb-1">{item.title}</div>
            <div className="text-2xl font-bold">{item.score}</div>
          </div>
        ))}
      </div>

      {/* Key Months */}
      {(analysis.keyMonths || analysis.peakMonths || analysis.riskMonths) && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">关键月份提醒</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {analysis.keyMonths && (
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="text-sm text-gray-500 mb-1">关键月份</div>
                <div className="font-medium text-gray-800">{analysis.keyMonths}</div>
              </div>
            )}
            {analysis.peakMonths && (
              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
                <div className="text-sm text-green-600 mb-1">高光期</div>
                <div className="font-medium text-gray-800">{analysis.peakMonths}</div>
              </div>
            )}
            {analysis.riskMonths && (
              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-red-500">
                <div className="text-sm text-red-600 mb-1">谨慎期</div>
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
            流月运势详解
          </h3>
          <p className="text-sm text-gray-500 mt-1">点击查看每月详细分析</p>
        </div>
        <MonthlyTable data={chartData} />
      </div>
    </div>
  );
};

export default Annual2026Result;
