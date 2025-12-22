
import React, { useState, useMemo } from 'react';
import LifeKLineChart from './components/LifeKLineChart';
import AnalysisResult from './components/AnalysisResult';
import ImportDataMode from './components/ImportDataMode';
import Login from './components/Login';
import ReportHistory from './components/ReportHistory';
import WealthLevelShare from './components/WealthLevelShare';
import { useAuth } from './contexts/AuthContext';
import { LifeDestinyResult } from './types';
import { Report } from './services/api/types';
import { Sparkles, AlertCircle, Download, Printer, Trophy, FileDown, Moon, LogOut, History, TrendingUp } from 'lucide-react';

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [result, setResult] = useState<LifeDestinyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [showHistory, setShowHistory] = useState(false);
  const [showWealthShare, setShowWealthShare] = useState(false);

  // 处理导入数据
  const handleDataImport = (data: LifeDestinyResult) => {
    setResult(data);
    setUserName('');
    setError(null);
  };

  // 处理选择历史报告
  const handleSelectReport = async (report: Report) => {
    try {
      console.log('📖 加载历史报告:', report.report_title);
      setError(null);

      // 检查报告数据是否完整
      if (!report.full_report || !report.full_report.content) {
        console.log('⚠️ 报告列表数据不完整，尝试获取完整报告...');

        // 动态导入 getReport 函数
        const { getReport } = await import('./services/api');
        const fullReport = await getReport(report.id);

        if (!fullReport.full_report || !fullReport.full_report.content) {
          throw new Error('报告数据不完整或已损坏');
        }

        report = fullReport;
      }

      // 解析报告内容
      const reportContent = typeof report.full_report.content === 'string'
        ? JSON.parse(report.full_report.content)
        : report.full_report.content;

      console.log('✅ 报告内容已解析:', reportContent);

      // 设置结果数据
      setResult(reportContent);
      setUserName(report.profile_name || '');
      setError(null);
    } catch (err: any) {
      console.error('❌ 加载报告失败:', err);
      setError(`加载报告失败：${err.message}`);
    }
  };

  // 导出为 JSON 文件
  const handleExportJson = () => {
    if (!result) return;

    const exportData = {
      bazi: result.analysis.bazi,
      summary: result.analysis.summary,
      summaryScore: result.analysis.summaryScore,
      personality: result.analysis.personality,
      personalityScore: result.analysis.personalityScore,
      industry: result.analysis.industry,
      industryScore: result.analysis.industryScore,
      fengShui: result.analysis.fengShui,
      fengShuiScore: result.analysis.fengShuiScore,
      wealth: result.analysis.wealth,
      wealthScore: result.analysis.wealthScore,
      marriage: result.analysis.marriage,
      marriageScore: result.analysis.marriageScore,
      health: result.analysis.health,
      healthScore: result.analysis.healthScore,
      family: result.analysis.family,
      familyScore: result.analysis.familyScore,
      crypto: result.analysis.crypto,
      cryptoScore: result.analysis.cryptoScore,
      cryptoYear: result.analysis.cryptoYear,
      cryptoStyle: result.analysis.cryptoStyle,
      chartPoints: result.chartData,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `命理分析_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveHtml = () => {
    if (!result) return;

    // 获取当前精确时间 (到秒)
    const now = new Date();
    const timeString = now.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    // 1. 获取图表 SVG (Recharts 生成的是 SVG)
    const chartContainer = document.querySelector('.recharts-surface');
    // 如果找不到 chart，给一个提示文本
    const chartSvg = chartContainer ? chartContainer.outerHTML : '<div style="padding:20px;text-align:center;">图表导出失败，请截图保存</div>';

    // 2. 获取命理分析部分的 HTML
    const analysisContainer = document.getElementById('analysis-result-container');
    const analysisHtml = analysisContainer ? analysisContainer.innerHTML : '';

    // 3. 生成流年详批表格 (替代交互式的 Tooltip)
    // 根据分数判断颜色
    const tableRows = result.chartData.map(item => {
      const scoreColor = item.close >= item.open ? 'text-green-600' : 'text-red-600';
      const trendIcon = item.close >= item.open ? '▲' : '▼';
      return `
        <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
          <td class="p-3 border-r border-gray-100 text-center font-mono">${item.age}岁</td>
          <td class="p-3 border-r border-gray-100 text-center font-bold">${item.year} ${item.ganZhi}</td>
          <td class="p-3 border-r border-gray-100 text-center text-sm">${item.daYun || '-'}</td>
          <td class="p-3 border-r border-gray-100 text-center font-bold ${scoreColor}">
            ${item.score} <span class="text-xs">${trendIcon}</span>
          </td>
          <td class="p-3 text-sm text-gray-700 text-justify leading-relaxed">${item.reason}</td>
        </tr>
      `;
    }).join('');

    const detailedTableHtml = `
      <div class="mt-12 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
           <div class="w-1 h-5 bg-indigo-600 rounded-full"></div>
           <h3 class="text-xl font-bold text-gray-800 font-serif-sc">流年详批全表</h3>
           <span class="text-xs text-gray-500 ml-2">(由于离线网页无法交互，特此列出所有年份详情)</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-100 text-gray-600 text-sm font-bold uppercase tracking-wider">
                <th class="p-3 border-r border-gray-200 text-center w-20">年龄</th>
                <th class="p-3 border-r border-gray-200 text-center w-28">流年</th>
                <th class="p-3 border-r border-gray-200 text-center w-28">大运</th>
                <th class="p-3 border-r border-gray-200 text-center w-20">评分</th>
                <th class="p-3">运势批断与建议</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // 4. 组装完整的 HTML 文件
    const fullHtml = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${userName || '用户'} - Astro Moon 占星报告</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&family=Inter:wght@400;600&display=swap');
    body { font-family: 'Inter', sans-serif; background-color: #f8f9fa; }
    .font-serif-sc { font-family: 'Noto Serif SC', serif; }
    /* Ensure SVG fits */
    svg { width: 100% !important; height: auto !important; }
  </style>
</head>
<body class="bg-gray-50 min-h-screen p-4 md:p-12">
  <div class="max-w-6xl mx-auto space-y-10">
    
    <!-- Header -->
    <div class="text-center border-b border-gray-200 pb-8">
      <h1 class="text-4xl font-bold font-serif-sc text-gray-900 mb-2">${userName ? userName + '的' : ''}Astro Moon 占星报告</h1>
      <p class="text-gray-500 text-sm">生成时间：${timeString}</p>
    </div>

    <!-- Chart Section -->
    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div class="flex items-center gap-2 mb-6">
        <div class="w-1 h-6 bg-indigo-600 rounded-full"></div>
        <h3 class="text-xl font-bold text-gray-800 font-serif-sc">流年大运走势图</h3>
      </div>
      <!-- Injected SVG Container -->
      <div class="w-full overflow-hidden flex justify-center py-4">
        ${chartSvg}
      </div>
      <p class="text-center text-xs text-gray-400 mt-2">注：图表K线颜色根据运势涨跌绘制，数值越高代表运势越强。</p>
    </div>

    <!-- Analysis Cards -->
    <div class="space-y-8">
       ${analysisHtml}
    </div>

    <!-- Detailed Table -->
    ${detailedTableHtml}

    <!-- Footer -->
    <div class="text-center text-gray-400 text-sm py-12 border-t border-gray-200 mt-12">
      <p>&copy; ${now.getFullYear()} Astro Moon | 仅供娱乐与文化研究，请勿迷信</p>
    </div>

  </div>
</body>
</html>
    `;

    // 5. 触发下载
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${userName || 'User'}_AstroMoon_Report_${now.getTime()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 计算人生巅峰
  const peakYearItem = useMemo(() => {
    if (!result || !result.chartData.length) return null;
    return result.chartData.reduce((prev, current) => (prev.high > current.high) ? prev : current);
  }, [result]);

  // 如果用户未登录，显示登录页面
  if (!currentUser) {
    return <Login />;
  }

  // 处理登出
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      {/* Header */}
      <header className="w-full bg-white border-b border-gray-200 py-3 sm:py-4 md:py-6 sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-1.5 sm:p-2 rounded-lg shadow-lg">
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h1 className="text-base sm:text-xl md:text-2xl font-serif-sc font-bold text-gray-900 tracking-wide">Astro Moon</h1>
              <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide sm:tracking-widest">Astrology & Life Analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
            <div className="text-xs sm:text-sm text-gray-600 hidden md:block max-w-[150px] lg:max-w-none truncate">
              {currentUser.email}
            </div>
            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
              title="历史报告"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">历史</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              title="退出登录"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">退出</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12 flex flex-col gap-12">

        {/* If no result, show intro and form */}
        {!result && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 animate-fade-in">
            <div className="text-center max-w-2xl flex flex-col items-center">
              <h2 className="text-4xl md:text-5xl font-serif-sc font-bold text-gray-900 mb-6">
                占星财富分析 <br />
                <span className="text-indigo-600">交易员专属星盘</span>
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                结合<strong>西方古典占星，金融占星与金融交易心理学</strong>，
                为交易员提供专业的财富格局分析与行运K线图。
              </p>
              <p className="text-gray-700 text-base leading-relaxed mb-6 font-medium">
                <strong>全网第一位财运指标发明人。——月亮牌手 | The Moon Dojo</strong>
              </p>
            </div>

            {/* 导入模式组件 */}
            <ImportDataMode onDataImport={handleDataImport} />

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg border border-red-100 max-w-md w-full animate-bounce-short">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-bold">{error}</p>
              </div>
            )}
          </div>
        )}

        {/* Results View */}
        {result && (
          <div className="animate-fade-in space-y-12">

            <div className="flex flex-col md:flex-row justify-between items-end md:items-center border-b border-gray-200 pb-4 gap-4">
              <h2 className="text-2xl font-bold font-serif-sc text-gray-800">
                {userName ? `${userName}的` : ''}Astro Moon 占星报告
              </h2>

              <div className="flex flex-wrap gap-3 no-print">
                <button
                  onClick={handleExportJson}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white border border-emerald-600 rounded-lg hover:bg-emerald-700 transition-all font-medium text-sm shadow-sm"
                >
                  <FileDown className="w-4 h-4" />
                  导出JSON
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white border border-indigo-600 rounded-lg hover:bg-indigo-700 transition-all font-medium text-sm shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  保存PDF
                </button>
                <button
                  onClick={handleSaveHtml}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white border border-indigo-600 rounded-lg hover:bg-indigo-700 transition-all font-medium text-sm shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  保存网页
                </button>
                <button
                  onClick={() => setResult(null)}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all font-medium text-sm"
                >
                  ← 重新排盘
                </button>
              </div>
            </div>

            {/* 财富量级潜力按钮 */}
            {result.analysis.wealthLevel && (
              <div className="flex justify-center no-print">
                <button
                  onClick={() => setShowWealthShare(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:via-yellow-600 hover:to-amber-700 transition-all font-bold text-base shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <TrendingUp className="w-5 h-5" />
                  一键生成我的财富量级潜力
                </button>
              </div>
            )}

            {/* The Chart */}
            <section className="space-y-4 break-inside-avoid">
              <div className="flex flex-col gap-1">
                <h3 className="text-xl font-bold text-gray-700 flex items-center gap-2">
                  <span className="w-1 h-6 bg-indigo-600 rounded-full"></span>
                  流年大运走势图 (100年)
                </h3>
                {peakYearItem && (
                  <p className="text-sm font-bold text-indigo-800 bg-indigo-50 border border-indigo-100 rounded px-2 py-1 inline-flex items-center gap-2 self-start mt-1">
                    <Trophy className="w-3 h-3 text-amber-500" />
                    人生巅峰年份：{peakYearItem.year}年 ({peakYearItem.ganZhi}) - {peakYearItem.age}岁，评分 <span className="text-amber-600 text-lg">{peakYearItem.high}</span>
                  </p>
                )}
              </div>

              <p className="text-sm text-gray-500 mb-2 no-print">
                <span className="text-green-600 font-bold">绿色K线</span> 代表运势上涨（吉），
                <span className="text-red-600 font-bold">红色K线</span> 代表运势下跌（凶）。
                <span className="text-red-500 font-bold">★</span> 标记为全盘最高运势点。
              </p>
              <LifeKLineChart data={result.chartData} />
            </section>

            {/* The Text Report */}
            {/* Added ID for HTML extraction */}
            <section id="analysis-result-container">
              <AnalysisResult analysis={result.analysis} />
            </section>

            {/* Print Only: Detailed Table to substitute interactive tooltips */}
            <div className="hidden print:block mt-8 break-before-page">
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-indigo-600 rounded-full"></div>
                <h3 className="text-xl font-bold text-gray-800 font-serif-sc">流年详批全表</h3>
              </div>
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 font-bold uppercase tracking-wider">
                    <th className="p-2 border border-gray-200 text-center w-16">年龄</th>
                    <th className="p-2 border border-gray-200 text-center w-24">流年</th>
                    <th className="p-2 border border-gray-200 text-center w-24">大运</th>
                    <th className="p-2 border border-gray-200 text-center w-16">评分</th>
                    <th className="p-2 border border-gray-200">运势批断</th>
                  </tr>
                </thead>
                <tbody>
                  {result.chartData.map((item) => (
                    <tr key={item.age} className="border-b border-gray-100 break-inside-avoid">
                      <td className="p-2 border border-gray-100 text-center font-mono">{item.age}</td>
                      <td className="p-2 border border-gray-100 text-center font-bold">{item.year} {item.ganZhi}</td>
                      <td className="p-2 border border-gray-100 text-center">{item.daYun || '-'}</td>
                      <td className={`p-2 border border-gray-100 text-center font-bold ${item.close >= item.open ? 'text-green-600' : 'text-red-600'}`}>
                        {item.score}
                      </td>
                      <td className="p-2 border border-gray-100 text-gray-700 text-justify text-xs leading-relaxed">
                        {item.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-8 pt-4 border-t border-gray-200 flex justify-center items-center text-xs text-gray-500">
                <span>生成时间：{new Date().toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bg-gray-900 text-gray-400 py-8 mt-auto no-print">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Astro Moon | 仅供参考研究，投资需谨慎</p>
        </div>
      </footer>

      {/* Report History Modal */}
      <ReportHistory
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onSelectReport={handleSelectReport}
      />

      {/* Wealth Level Share Modal */}
      {result && result.analysis.wealthLevel && (
        <WealthLevelShare
          isOpen={showWealthShare}
          onClose={() => setShowWealthShare(false)}
          wealthLevel={result.analysis.wealthLevel}
          userName={userName}
        />
      )}
    </div>
  );
};

export default App;
