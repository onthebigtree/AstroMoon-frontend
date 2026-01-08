
import React, { useState, useMemo, useEffect } from 'react';
import LifeKLineChart from './components/LifeKLineChart';
import AnalysisResult from './components/AnalysisResult';
import Annual2026ResultComponent from './components/Annual2026Result';
import ImportDataMode from './components/ImportDataMode';
import Login from './components/Login';
import ReportHistory from './components/ReportHistory';
import WealthLevelShare from './components/WealthLevelShare';
import ZodiacFortune2026 from './components/ZodiacFortune2026';
import { BuyStarsModal } from './components/BuyStarsModal';
import PaymentCallback from './components/PaymentCallback';
import TransactionHistory from './components/TransactionHistory';
import StarsDetailModal from './components/StarsDetailModal';
import TwitterLinks from './components/TwitterLinks';
import { useAuth } from './contexts/AuthContext';
import { LifeDestinyResult, Annual2026Result } from './types';
import { Report } from './services/api/types';
import { getStarBalance } from './services/api/payments';
import { Sparkles, AlertCircle, Download, Printer, Trophy, FileDown, Moon, History, TrendingUp, LogOut, Star, Plus, Loader2, Flame } from 'lucide-react';
import { replaceAge100Reason } from './constants/age100';

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [result, setResult] = useState<LifeDestinyResult | Annual2026Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [showHistory, setShowHistory] = useState(false);
  const [showWealthShare, setShowWealthShare] = useState(false);
  const [showBuyStars, setShowBuyStars] = useState(false);
  const [showPaymentCallback, setShowPaymentCallback] = useState(false);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [showStarsDetail, setShowStarsDetail] = useState(false);
  const [showZodiacFortune, setShowZodiacFortune] = useState(false);
  const [starsBalance, setStarsBalance] = useState<number | null>(null);
  const [isLoadingStars, setIsLoadingStars] = useState(false);

  const refreshStarsBalance = async () => {
    if (!currentUser) {
      setStarsBalance(null);
      return;
    }

    setIsLoadingStars(true);
    try {
      const { stars } = await getStarBalance();
      setStarsBalance(stars);
    } catch (err) {
      console.error('获取积分余额失败:', err);
    } finally {
      setIsLoadingStars(false);
    }
  };

  useEffect(() => {
    refreshStarsBalance();
  }, [currentUser]);

  // 检测支付回调 URL 参数
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const orderId = urlParams.get('orderId');

    if (paymentStatus && orderId) {
      // 检测到支付回调参数，显示支付回调页面
      setShowPaymentCallback(true);
    }
  }, []);

  // 处理支付完成
  const handlePaymentComplete = () => {
    setShowPaymentCallback(false);
    // 清除 URL 参数
    window.history.replaceState({}, '', window.location.pathname);
  };

  // 处理导入数据
  const handleDataImport = (data: LifeDestinyResult | Annual2026Result) => {
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
      let reportContent = typeof report.full_report.content === 'string'
        ? JSON.parse(report.full_report.content)
        : report.full_report.content;

      console.log('✅ 报告内容已解析:', reportContent);

      // 兼容旧的导出格式：如果是扁平结构，需要重构为 LifeDestinyResult 格式
      if (reportContent.chartPoints && !reportContent.chartData) {
        const { chartPoints, ...analysisData } = reportContent;
        reportContent = {
          chartData: chartPoints,
          analysis: analysisData
        };
      }

      // 检查是否为年运报告
      const isAnnual2026Report = report.report_title?.includes('2026年年运') ||
                                  reportContent.markdownReport ||
                                  (reportContent.analysis && 'markdownReport' in reportContent.analysis);

      if (isAnnual2026Report) {
        console.log('📅 检测到年运报告');

        // 年运报告数据可能是扁平结构，需要重构
        let annualData: Annual2026Result;

        if (reportContent.analysis && reportContent.chartData) {
          // 已经是正确的结构
          annualData = reportContent as Annual2026Result;
        } else {
          // 扁平结构，需要重构
          const { chartData, ...restData } = reportContent;
          annualData = {
            chartData: chartData || [],
            analysis: {
              markdownReport: restData.markdownReport || '',
              summary: restData.summary || '',
              summaryScore: restData.summaryScore || 75,
              traderVitalityTitle: restData.traderVitalityTitle || '年度核心',
              traderVitality: restData.traderVitality || '',
              traderVitalityScore: restData.traderVitalityScore || 75,
              wealthPotentialTitle: restData.wealthPotentialTitle || '事业财富',
              wealthPotential: restData.wealthPotential || '',
              wealthPotentialScore: restData.wealthPotentialScore || 75,
              fortuneLuckTitle: restData.fortuneLuckTitle || '情感关系',
              fortuneLuck: restData.fortuneLuck || '',
              fortuneLuckScore: restData.fortuneLuckScore || 75,
              leverageRiskTitle: restData.leverageRiskTitle || '健康身心',
              leverageRisk: restData.leverageRisk || '',
              leverageRiskScore: restData.leverageRiskScore || 75,
              platformTeamTitle: restData.platformTeamTitle || '贵人机遇',
              platformTeam: restData.platformTeam || '',
              platformTeamScore: restData.platformTeamScore || 75,
              tradingStyleTitle: restData.tradingStyleTitle || '行动建议',
              tradingStyle: restData.tradingStyle || '',
              tradingStyleScore: restData.tradingStyleScore || 75,
              keyMonths: restData.keyMonths,
              peakMonths: restData.peakMonths,
              riskMonths: restData.riskMonths,
            }
          };
        }

        console.log('📅 年运报告数据重构完成:', annualData);
        setResult(annualData);
        setUserName(report.profile_name || '');
        setError(null);
        return;
      }

      // 判断报告类型：优先根据标题判断，然后根据内容判断
      let isTraderReport = false;

      // 1. 标题包含"交易员"，肯定是交易员报告
      if (report.report_title?.includes('交易员')) {
        isTraderReport = true;
      }
      // 2. 如果标题是"综合人生"，肯定是普通报告
      else if (report.report_title?.includes('综合人生')) {
        isTraderReport = false;
      }
      // 3. 没有标题信息，根据内容判断
      else if (reportContent.analysis.traderVitality) {
        // 检查 traderVitality 内容是否包含交易相关关键词
        const content = reportContent.analysis.traderVitality || '';
        isTraderReport = content.includes('交易') ||
                        content.includes('持仓') ||
                        content.includes('止损') ||
                        content.includes('行情') ||
                        content.includes('建仓');
      }

      console.log('📊 报告类型判断:', {
        isTraderReport,
        title: report.report_title,
        hasTraderVitality: !!reportContent.analysis.traderVitality,
        hasPersonality: !!reportContent.analysis.personality
      });

      // 🔍 打印从数据库加载的原始数据结构（详细调试）
      console.group('🗄️ 数据库原始数据');
      console.log('所有 analysis 字段:', Object.keys(reportContent.analysis));
      console.log('交易员字段存在性:', {
        traderVitality: !!reportContent.analysis.traderVitality,
        wealthPotential: !!reportContent.analysis.wealthPotential,
        fortuneLuck: !!reportContent.analysis.fortuneLuck,
        leverageRisk: !!reportContent.analysis.leverageRisk,
        platformTeam: !!reportContent.analysis.platformTeam,
        tradingStyle: !!reportContent.analysis.tradingStyle,
      });
      console.log('普通字段存在性:', {
        personality: !!reportContent.analysis.personality,
        industry: !!reportContent.analysis.industry,
        wealth: !!reportContent.analysis.wealth,
        marriage: !!reportContent.analysis.marriage,
        health: !!reportContent.analysis.health,
        family: !!reportContent.analysis.family,
      });
      console.log('新增字段存在性:', {
        intimacyEnergy: !!reportContent.analysis.intimacyEnergy,
        sexualCharm: !!reportContent.analysis.sexualCharm,
        favorableDirections: !!reportContent.analysis.favorableDirections,
      });
      console.groupEnd();

      // 如果是普通版本但使用了交易员字段名，需要重新映射
      if (!isTraderReport && reportContent.analysis) {
        // 检查是否有交易员字段但没有普通字段（旧版本混合数据）
        const hasTraderFields = !!reportContent.analysis.traderVitality;
        const hasNormalFields = !!reportContent.analysis.personality;

        // 🔍 打印历史报告的完整数据结构（用于调试）
        console.group('📊 历史报告数据结构');
        console.log('报告类型:', { isTraderReport, hasTraderFields, hasNormalFields });
        console.log('新增维度字段检查:', {
          intimacyEnergy: !!reportContent.analysis.intimacyEnergy,
          sexualCharm: !!reportContent.analysis.sexualCharm,
          favorableDirections: !!reportContent.analysis.favorableDirections
        });
        console.groupEnd();

        if (hasTraderFields && !hasNormalFields) {
          // 将交易员字段映射到普通人生字段
          console.log('🔄 检测到旧版本数据格式，进行字段映射...');

          const mappedAnalysis: any = {
            birthChart: reportContent.analysis.birthChart,
            summary: reportContent.analysis.summary,
            summaryScore: reportContent.analysis.summaryScore,
            keyYears: reportContent.analysis.keyYears,
            peakPeriods: reportContent.analysis.peakPeriods,
            riskPeriods: reportContent.analysis.riskPeriods,
          };

          // 映射字段：traderVitality -> personality (性格与天赋)
          if (reportContent.analysis.traderVitality) {
            mappedAnalysis.personality = reportContent.analysis.traderVitality;
            mappedAnalysis.personalityScore = reportContent.analysis.traderVitalityScore;
          }

          // 映射字段：wealthPotential -> wealth (财运)
          if (reportContent.analysis.wealthPotential) {
            mappedAnalysis.wealth = reportContent.analysis.wealthPotential;
            mappedAnalysis.wealthScore = reportContent.analysis.wealthPotentialScore;
          }

          // 映射字段：fortuneLuck -> marriage (婚姻感情)
          if (reportContent.analysis.fortuneLuck) {
            mappedAnalysis.marriage = reportContent.analysis.fortuneLuck;
            mappedAnalysis.marriageScore = reportContent.analysis.fortuneLuckScore;
          }

          // 映射字段：leverageRisk -> industry (事业与职业方向)
          if (reportContent.analysis.leverageRisk) {
            mappedAnalysis.industry = reportContent.analysis.leverageRisk;
            mappedAnalysis.industryScore = reportContent.analysis.leverageRiskScore;
          }

          // 映射字段：platformTeam -> family (家庭与子女)
          if (reportContent.analysis.platformTeam) {
            mappedAnalysis.family = reportContent.analysis.platformTeam;
            mappedAnalysis.familyScore = reportContent.analysis.platformTeamScore;
          }

          // 映射字段：tradingStyle -> health (健康)
          if (reportContent.analysis.tradingStyle) {
            mappedAnalysis.health = reportContent.analysis.tradingStyle;
            mappedAnalysis.healthScore = reportContent.analysis.tradingStyleScore;
          }

          // 保留新增的三个维度
          console.log('🔍 保留新增维度字段（历史报告-旧版映射）:', {
            intimacyEnergy: !!reportContent.analysis.intimacyEnergy,
            sexualCharm: !!reportContent.analysis.sexualCharm,
            favorableDirections: !!reportContent.analysis.favorableDirections
          });

          if (reportContent.analysis.intimacyEnergy) {
            console.log('✅ 保留 intimacyEnergy 字段');
            mappedAnalysis.intimacyEnergy = reportContent.analysis.intimacyEnergy;
            mappedAnalysis.intimacyEnergyScore = reportContent.analysis.intimacyEnergyScore;
            mappedAnalysis.intimacyEnergyTitle = reportContent.analysis.intimacyEnergyTitle || "亲密能量与深度连接能力";
          }

          if (reportContent.analysis.sexualCharm) {
            console.log('✅ 保留 sexualCharm 字段');
            mappedAnalysis.sexualCharm = reportContent.analysis.sexualCharm;
            mappedAnalysis.sexualCharmScore = reportContent.analysis.sexualCharmScore;
            mappedAnalysis.sexualCharmTitle = reportContent.analysis.sexualCharmTitle || "性能力与吸引力";
          } else {
            console.warn('⚠️ 历史报告中未找到 sexualCharm 字段');
          }

          if (reportContent.analysis.favorableDirections) {
            console.log('✅ 保留 favorableDirections 字段');
            mappedAnalysis.favorableDirections = reportContent.analysis.favorableDirections;
            mappedAnalysis.favorableDirectionsScore = reportContent.analysis.favorableDirectionsScore;
            mappedAnalysis.favorableDirectionsTitle = reportContent.analysis.favorableDirectionsTitle || "适宜发展方位";
          }

          reportContent.analysis = mappedAnalysis;
          console.log('✅ 字段映射完成，新增维度保留结果:', {
            intimacyEnergy: !!mappedAnalysis.intimacyEnergy,
            sexualCharm: !!mappedAnalysis.sexualCharm,
            favorableDirections: !!mappedAnalysis.favorableDirections
          });
        } else if (hasTraderFields) {
          // 删除交易员特定字段，避免被误判为交易员模式
          // 但保留新增的三个维度字段（intimacyEnergy, sexualCharm, favorableDirections）
          console.log('🗑️ 删除交易员字段（但保留新增维度）...');
          console.log('🔍 删除前新增维度字段:', {
            intimacyEnergy: !!reportContent.analysis.intimacyEnergy,
            sexualCharm: !!reportContent.analysis.sexualCharm,
            favorableDirections: !!reportContent.analysis.favorableDirections
          });

          const {
            traderVitality,
            traderVitalityScore,
            traderVitalityTitle,
            wealthPotential,
            wealthPotentialScore,
            wealthPotentialTitle,
            fortuneLuck,
            fortuneLuckScore,
            fortuneLuckTitle,
            leverageRisk,
            leverageRiskScore,
            leverageRiskTitle,
            platformTeam,
            platformTeamScore,
            platformTeamTitle,
            tradingStyle,
            tradingStyleScore,
            tradingStyleTitle,
            wealthLevel,
            ...restAnalysis
          } = reportContent.analysis;

          reportContent.analysis = restAnalysis;

          console.log('✅ 交易员字段删除完成，新增维度保留结果:', {
            intimacyEnergy: !!restAnalysis.intimacyEnergy,
            sexualCharm: !!restAnalysis.sexualCharm,
            favorableDirections: !!restAnalysis.favorableDirections
          });
        }
      }

      // 🔍 打印最终要显示的数据结构（用于调试）
      console.group('📦 最终显示数据');
      console.log('所有 analysis 字段:', Object.keys(reportContent.analysis));
      console.log('交易员字段:', {
        traderVitality: !!reportContent.analysis.traderVitality,
        wealthPotential: !!reportContent.analysis.wealthPotential,
        fortuneLuck: !!reportContent.analysis.fortuneLuck,
      });
      console.log('普通字段:', {
        personality: !!reportContent.analysis.personality,
        industry: !!reportContent.analysis.industry,
        wealth: !!reportContent.analysis.wealth,
        marriage: !!reportContent.analysis.marriage,
        health: !!reportContent.analysis.health,
        family: !!reportContent.analysis.family,
      });
      console.log('新增字段:', {
        intimacyEnergy: !!reportContent.analysis.intimacyEnergy,
        sexualCharm: !!reportContent.analysis.sexualCharm,
        favorableDirections: !!reportContent.analysis.favorableDirections,
      });
      console.log('AnalysisResult 会显示为:', !!reportContent.analysis.traderVitality ? '交易员模式' : '普通人生模式');
      console.groupEnd();

      // 🔄 强制替换 100 岁的 reason 文案为标准文案（历史报告）
      if (reportContent.chartData && Array.isArray(reportContent.chartData)) {
        reportContent.chartData = replaceAge100Reason(reportContent.chartData);
      }

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

    // 直接导出完整的分析数据，包含所有字段（兼容新旧版本和交易员/普通人生模式）
    const exportData = {
      ...result.analysis,  // 包含所有 analysis 字段
      chartPoints: result.chartData,  // 添加图表数据
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
    // 判断报告类型：如果有 traderVitality 字段，则为交易员报告
    const isTraderReport = result?.analysis?.traderVitality ? true : false;
    const reportType = isTraderReport ? '交易员财富报告' : '综合人生报告';

    // 设置文档标题为：姓名+报告类型
    const originalTitle = document.title;
    const pdfFileName = `${userName || '占星'}${reportType}`;
    document.title = pdfFileName;

    // 打印
    window.print();

    // 恢复原标题
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
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

    // 3. 生成流年详批表格 (去掉流年和大运列)
    const tableRows = result.chartData.map(item => {
      const scoreColor = item.close >= item.open ? 'text-green-600' : 'text-red-600';
      const trendIcon = item.close >= item.open ? '▲' : '▼';
      return `
        <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
          <td class="p-3 border-r border-gray-100 text-center font-mono">${item.age}岁</td>
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

  // 判断是否为年运报告
  const isAnnualReport = useMemo(() => {
    if (!result) return false;
    // 检查是否有 markdownReport 字段（年运报告特有）
    return 'analysis' in result && 'markdownReport' in result.analysis;
  }, [result]);

  // 计算人生巅峰（仅用于非年运报告）
  const peakYearItem = useMemo(() => {
    if (!result || !result.chartData.length || isAnnualReport) return null;
    return (result as LifeDestinyResult).chartData.reduce((prev, current) => (prev.score > current.score) ? prev : current);
  }, [result, isAnnualReport]);

  // 如果正在显示支付回调页面，直接返回支付回调组件
  if (showPaymentCallback) {
    return (
      <PaymentCallback
        onComplete={handlePaymentComplete}
        onStarsUpdated={(newBalance) => setStarsBalance(newBalance)}
      />
    );
  }

  // 如果用户未登录，显示登录页面
  if (!currentUser) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      {/* Header */}
      <header className="w-full bg-white border-b border-gray-200 py-3 sm:py-4 md:py-6 sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-1.5 sm:p-2 rounded-lg shadow-lg">
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h1 className="text-base sm:text-xl md:text-2xl font-serif-sc font-bold text-gray-900 tracking-wide">Astro Moon</h1>
              <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide sm:tracking-widest">Astrology & Life Analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end overflow-x-auto">
            <TwitterLinks />
            <button
              onClick={() => setShowStarsDetail(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-50 to-purple-50 border border-purple-200 rounded-lg hover:shadow-md transition-all group"
              title="积分中心 - 查看余额、充值、消费记录"
            >
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
              <span className="text-sm font-semibold text-gray-900">
                {isLoadingStars ? <Loader2 className="w-3 h-3 animate-spin" /> : (starsBalance ?? '--')}
              </span>
              <Plus className="w-3 h-3 text-purple-600 group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all flex-shrink-0"
              title="历史报告"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">历史</span>
            </button>
            {currentUser && (
              <button
                onClick={() => logout()}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
                title="退出登录"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">退出</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12 flex flex-col gap-12">

        {/* If no result, show intro and form */}
        {!result && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 animate-fade-in">
            {/* 2026 赤马红羊运势速测 Banner */}
            <div
              onClick={() => setShowZodiacFortune(true)}
              className="w-full max-w-2xl cursor-pointer group"
            >
              <div className="relative overflow-hidden bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-2xl p-4 md:p-5 shadow-lg hover:shadow-2xl transform hover:scale-[1.02] transition-all">
                {/* 装饰性背景 */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

                <div className="relative z-10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-2.5 group-hover:scale-110 transition-transform">
                      <Flame className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-white mb-0.5">
                        2026 赤马红羊运势速测
                      </h3>
                      <p className="text-xs md:text-sm text-white/80">
                        点击测试你的 2026 年到底夯还是拉
                      </p>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-sm font-medium group-hover:bg-white/30 transition-all">
                    <span>免费测</span>
                    <span className="text-lg">→</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center max-w-2xl flex flex-col items-center">
              <h2 className="text-4xl md:text-5xl font-serif-sc font-bold text-gray-900 mb-6">
                财富占星分析 <br />
                <span className="text-indigo-600">交易员专属星盘</span>
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                结合<strong>西方古典占星，金融占星与金融交易心理学</strong>，
                为交易员提供专业的财富格局分析与行运K线图。
              </p>
              <p className="text-gray-700 text-base leading-relaxed mb-6 font-medium">
                <strong>全网第一位财运指标发明人。——&gt;月亮牌手@TheMoonDojo</strong>
              </p>
            </div>

            {/* 导入模式组件 */}
            <ImportDataMode
              onDataImport={handleDataImport}
              onStarsChange={setStarsBalance}
            />

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
            {/* 年运报告展示 */}
            {isAnnualReport ? (
              <>
                <div className="flex flex-col md:flex-row justify-between items-end md:items-center border-b border-gray-200 pb-4 gap-4">
                  <h2 className="text-2xl font-bold font-serif-sc text-gray-800">
                    {userName ? `${userName}的` : ''}2026年年运报告
                  </h2>
                  <div className="flex flex-wrap gap-3 no-print">
                    <button
                      onClick={handlePrint}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white border border-indigo-600 rounded-lg hover:bg-indigo-700 transition-all font-medium text-sm shadow-sm"
                    >
                      <Printer className="w-4 h-4" />
                      保存PDF
                    </button>
                    <button
                      onClick={() => setResult(null)}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all font-medium text-sm"
                    >
                      ← 重新排盘
                    </button>
                  </div>
                </div>
                <Annual2026ResultComponent
                  result={result as Annual2026Result}
                  userName={userName || undefined}
                />
              </>
            ) : (
              <>
                {/* 财富量级横幅 - 页面最顶部（仅交易员报告） */}
                {(result as LifeDestinyResult).analysis.wealthLevel && (result as LifeDestinyResult).analysis.traderVitality && (
                  <div className="no-print bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border-2 border-amber-300 rounded-2xl p-6 shadow-lg">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full p-3 animate-pulse">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-amber-900 mb-1">
                            🌟 发现你的财富量级潜力
                          </h3>
                          <p className="text-sm text-amber-700">
                            基于你的星盘配置，一键生成专属财富等级分析
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowWealthShare(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:via-yellow-600 hover:to-amber-700 transition-all font-bold text-base shadow-xl hover:shadow-2xl transform hover:scale-105 whitespace-nowrap"
                      >
                        <Sparkles className="w-5 h-5" />
                        立即生成
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex flex-col md:flex-row justify-between items-end md:items-center border-b border-gray-200 pb-4 gap-4">
                  <h2 className="text-2xl font-bold font-serif-sc text-gray-800">
                    {userName ? `${userName}的` : ''}Astro Moon 占星报告
                  </h2>

                  <div className="flex flex-wrap gap-3 no-print">
                    <button
                      onClick={handlePrint}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white border border-indigo-600 rounded-lg hover:bg-indigo-700 transition-all font-medium text-sm shadow-sm"
                    >
                      <Printer className="w-4 h-4" />
                      保存PDF
                    </button>
                    <button
                      onClick={handleSaveHtml}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white border border-emerald-600 rounded-lg hover:bg-emerald-700 transition-all font-medium text-sm shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                      下载网页
                    </button>
                    <button
                      onClick={() => setResult(null)}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all font-medium text-sm"
                    >
                      ← 重新排盘
                    </button>
                  </div>
                </div>

                {/* 财富量级潜力按钮 - 页面顶部醒目位置（仅交易员报告） */}
                {(result as LifeDestinyResult).analysis.wealthLevel && (result as LifeDestinyResult).analysis.traderVitality && (
                  <div className="flex justify-center no-print -mt-6">
                    <button
                      onClick={() => setShowWealthShare(true)}
                      className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:via-yellow-600 hover:to-amber-700 transition-all font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 animate-pulse"
                    >
                      <TrendingUp className="w-6 h-6" />
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
                        人生巅峰年份：{peakYearItem.year}年 ({peakYearItem.ganZhi}) - {peakYearItem.age}岁，评分 <span className="text-amber-600 text-lg">{peakYearItem.score}</span>
                      </p>
                    )}
                  </div>

                  <p className="text-sm text-gray-500 mb-2 no-print">
                    <span className="text-green-600 font-bold">绿色K线</span> 代表运势上涨（吉），
                    <span className="text-red-600 font-bold">红色K线</span> 代表运势下跌（凶）。
                    <span className="text-red-500 font-bold">★</span> 标记为全盘最高运势点。
                  </p>
                  <LifeKLineChart data={(result as LifeDestinyResult).chartData} />
                </section>

                {/* The Text Report */}
                {/* Added ID for HTML extraction */}
                <section id="analysis-result-container">
                  <AnalysisResult analysis={(result as LifeDestinyResult).analysis} />
                </section>

                {/* 流年详批全表 - 始终显示，打印时分页 */}
                <div className="mt-8 print:break-before-page">
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2 mb-4">
                    <div className="w-1 h-5 bg-indigo-600 rounded-full"></div>
                    <h3 className="text-xl font-bold text-gray-800 font-serif-sc">流年详批全表</h3>
                  </div>
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-100 text-gray-600 font-bold uppercase tracking-wider">
                        <th className="p-2 border border-gray-200 text-center w-16">年龄</th>
                        <th className="p-2 border border-gray-200 text-center w-16">评分</th>
                        <th className="p-2 border border-gray-200">运势批断</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(result as LifeDestinyResult).chartData.map((item) => (
                        <tr
                          key={item.age}
                          className={`border-b border-gray-100 break-inside-avoid ${
                            item.age === 100 ? 'bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border-2 border-amber-300' : ''
                          }`}
                        >
                          <td className="p-2 border border-gray-100 text-center font-mono">
                            {item.age}
                            {item.age === 100 && (
                              <div className="text-xs text-amber-600 font-bold mt-1">谢幕</div>
                            )}
                          </td>
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

                {/* 财富量级潜力按钮 - 放在页面最下方（仅交易员报告） */}
                {(result as LifeDestinyResult).analysis.wealthLevel && (result as LifeDestinyResult).analysis.traderVitality && (
                  <div className="flex justify-center no-print mt-8">
                    <button
                      onClick={() => setShowWealthShare(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:via-yellow-600 hover:to-amber-700 transition-all font-bold text-base shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <TrendingUp className="w-5 h-5" />
                      一键生成我的财富量级潜力
                    </button>
                  </div>
                )}
              </>
            )}
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

      {/* Wealth Level Share Modal - 仅交易员报告 */}
      {result && result.analysis.wealthLevel && result.analysis.traderVitality && (
        <WealthLevelShare
          isOpen={showWealthShare}
          onClose={() => setShowWealthShare(false)}
          wealthLevel={result.analysis.wealthLevel}
          userName={userName}
        />
      )}

      {/* Buy Stars Modal (保留,用于兼容性) */}
      <BuyStarsModal
        isOpen={showBuyStars}
        onClose={() => setShowBuyStars(false)}
        currentStars={starsBalance}
        onRefreshStars={refreshStarsBalance}
        onSuccess={refreshStarsBalance}
      />

      {/* Transaction History Modal (保留,用于兼容性) */}
      <TransactionHistory
        isOpen={showTransactionHistory}
        onClose={() => setShowTransactionHistory(false)}
      />

      {/* Stars Detail Modal (新的整合模态框) */}
      <StarsDetailModal
        isOpen={showStarsDetail}
        onClose={() => setShowStarsDetail(false)}
        currentStars={starsBalance}
        onRefreshStars={refreshStarsBalance}
      />

      {/* 2026 赤马红羊运势速测 Modal */}
      <ZodiacFortune2026
        isOpen={showZodiacFortune}
        onClose={() => setShowZodiacFortune(false)}
      />
    </div>
  );
};

export default App;
