
import React from 'react';
import { useTranslation } from 'react-i18next';
import { AnalysisData } from '../types';
import { ScrollText, TrendingUp, Zap, Sparkles, Shield, Users, Star, Info, Target, DollarSign, BarChart3, Heart, Flame, Compass } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface AnalysisResultProps {
  analysis: AnalysisData;
}

const ScoreBar = ({ score }: { score: number }) => {
  // 自动检测评分制度：如果 score > 10，认为是百分制，需要转换为十分制
  const normalizedScore = score > 10 ? Math.round(score / 10) : score;

  // Color based on normalized score (0-10)
  let colorClass = "bg-gray-300";
  if (normalizedScore >= 9) colorClass = "bg-green-500";
  else if (normalizedScore >= 7) colorClass = "bg-indigo-500";
  else if (normalizedScore >= 5) colorClass = "bg-yellow-500";
  else if (normalizedScore >= 3) colorClass = "bg-orange-500";
  else colorClass = "bg-red-500";

  return (
    <div className="flex items-center gap-3 mt-3">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClass} transition-all duration-1000 ease-out`}
          style={{ width: `${normalizedScore * 10}%` }}
        />
      </div>
      <span className="text-sm font-bold text-gray-700 min-w-[2.5rem] text-right">
        {normalizedScore} / 10
      </span>
    </div>
  );
};


const Card = ({ title, icon: Icon, content, score, colorClass, extraBadges }: any) => {
  let displayContent: React.ReactNode;

  if (React.isValidElement(content)) {
    displayContent = content;
  } else {
    // Clean content: remove markdown bold symbols (**) to ensure uniform plain text look
    // Ensure content is a string before calling replace to avoid "content.replace is not a function" error
    let safeContent = '';

    if (typeof content === 'string') {
      safeContent = content;
    } else if (content === null || content === undefined) {
      safeContent = '';
    } else if (typeof content === 'object') {
      // If AI returns an object or array (unexpected but possible), stringify it readable
      try {
        // If it's a simple array of strings, join them
        if (Array.isArray(content)) {
          safeContent = content.map((c: any) => String(c)).join('\n');
        } else {
          // Fallback for object
          safeContent = JSON.stringify(content);
        }
      } catch (e) {
        safeContent = String(content);
      }
    } else {
      safeContent = String(content);
    }

    displayContent = safeContent.replace(/\*\*/g, '');
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full relative overflow-hidden">
      <div className={`flex items-center justify-between mb-3 ${colorClass}`}>
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5" />
          <h3 className="font-serif-sc font-bold text-lg">{title}</h3>
        </div>
        <Star className="w-4 h-4 opacity-50" />
      </div>

      {/* Extra Badges for Crypto */}
      {extraBadges && (
        <div className="flex flex-wrap gap-2 mb-3">
          {extraBadges}
        </div>
      )}

      <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap flex-grow">
        {displayContent}
      </div>
      {typeof score === 'number' && (
        <div className="pt-4 mt-2 border-t border-gray-50">
          <div className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wider">Rating</div>
          <ScoreBar score={score} />
        </div>
      )}
    </div>
  );
};

const AnalysisResult: React.FC<AnalysisResultProps> = ({ analysis }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();

  // 检测报告模式：如果有交易员特定字段，则为交易员模式
  const isTraderMode = !!analysis.traderVitality;

  return (
    <div className="w-full space-y-8 animate-fade-in-up">
      {/* Birth Chart Info */}
      {analysis.birthChart && (
        <div className="flex justify-center bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 text-amber-50 p-6 rounded-xl shadow-lg">
          <div className="text-center">
            <div className="text-xs text-gray-300 mb-2 uppercase tracking-wider">{t('analysis.birthChartInfo')}</div>
            <div className="text-lg md:text-xl font-serif-sc font-medium tracking-wide">{analysis.birthChart}</div>
          </div>
        </div>
      )}

      {/* Bazi Info (for legacy reports) */}
      {analysis.bazi && (
        <div className="flex justify-center bg-gradient-to-r from-amber-900 via-orange-900 to-amber-900 text-amber-50 p-6 rounded-xl shadow-lg">
          <div className="text-center">
            <div className="text-xs text-gray-300 mb-2 uppercase tracking-wider">八字 · Bazi</div>
            <div className="text-lg md:text-xl font-serif-sc font-medium tracking-wide space-x-4">
              {analysis.bazi.map((pillar, idx) => (
                <span key={idx} className="inline-block">{pillar}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Summary with Score */}
      <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-xl border border-indigo-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <h3 className="flex items-center gap-2 font-serif-sc font-bold text-xl text-indigo-900">
            <ScrollText className="w-5 h-5" />
            {isTraderMode ? t('analysis.traderSummary') : t('analysis.normalSummary')}
          </h3>
          <div className="w-full md:w-1/3">
            <ScoreBar score={analysis.summaryScore} />
          </div>
        </div>
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">{analysis.summary}</p>
      </div>

      {/* Grid for categorical analysis with Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* 交易员模式 */}
        {isTraderMode ? (
          <>
            <Card
              title={analysis.traderVitalityTitle || t('analysis.traderVitality')}
              icon={Zap}
              content={analysis.traderVitality}
              score={analysis.traderVitalityScore}
              colorClass="text-orange-600"
            />

            <Card
              title={analysis.wealthPotentialTitle || t('analysis.wealthPotential')}
              icon={DollarSign}
              content={analysis.wealthPotential}
              score={analysis.wealthPotentialScore}
              colorClass="text-amber-600"
            />

            <Card
              title={analysis.fortuneLuckTitle || t('analysis.fortuneLuck')}
              icon={Sparkles}
              content={analysis.fortuneLuck}
              score={analysis.fortuneLuckScore}
              colorClass="text-yellow-600"
            />

            <Card
              title={analysis.leverageRiskTitle || t('analysis.leverageRisk')}
              icon={Shield}
              content={analysis.leverageRisk}
              score={analysis.leverageRiskScore}
              colorClass="text-red-600"
            />

            <Card
              title={analysis.platformTeamTitle || t('analysis.platformTeam')}
              icon={Users}
              content={analysis.platformTeam}
              score={analysis.platformTeamScore}
              colorClass="text-purple-600"
            />

            <Card
              title={analysis.tradingStyleTitle || t('analysis.tradingStyle')}
              icon={Target}
              content={analysis.tradingStyle}
              score={analysis.tradingStyleScore}
              colorClass="text-indigo-600"
            />

            {/* 新增维度：亲密能量 */}
            {analysis.intimacyEnergy && (
              <Card
                title={analysis.intimacyEnergyTitle || t('analysis.intimacyEnergy')}
                icon={Heart}
                content={analysis.intimacyEnergy}
                score={analysis.intimacyEnergyScore}
                colorClass="text-pink-600"
              />
            )}

            {/* 新增维度：性能力 */}
            {analysis.sexualCharm && (
              <Card
                title={analysis.sexualCharmTitle || t('analysis.sexualCharm')}
                icon={Flame}
                content={analysis.sexualCharm}
                score={analysis.sexualCharmScore}
                colorClass="text-rose-600"
              />
            )}

            {/* 新增维度：适宜发展方位 */}
            {analysis.favorableDirections && (
              <Card
                title={analysis.favorableDirectionsTitle || t('analysis.favorableDirections')}
                icon={Compass}
                content={analysis.favorableDirections}
                score={analysis.favorableDirectionsScore}
                colorClass="text-cyan-600"
              />
            )}
          </>
        ) : (
          /* 普通人生模式 */
          <>
            {analysis.personality && (
              <Card
                title={t('analysis.personality')}
                icon={Star}
                content={analysis.personality}
                score={analysis.personalityScore}
                colorClass="text-purple-600"
              />
            )}

            {analysis.industry && (
              <Card
                title={t('analysis.industry')}
                icon={Target}
                content={analysis.industry}
                score={analysis.industryScore}
                colorClass="text-indigo-600"
              />
            )}

            {analysis.wealth && (
              <Card
                title={t('analysis.wealth')}
                icon={DollarSign}
                content={analysis.wealth}
                score={analysis.wealthScore}
                colorClass="text-amber-600"
              />
            )}

            {analysis.marriage && (
              <Card
                title={t('analysis.marriage')}
                icon={Heart}
                content={analysis.marriage}
                score={analysis.marriageScore}
                colorClass="text-pink-600"
              />
            )}

            {analysis.health && (
              <Card
                title={t('analysis.health')}
                icon={Shield}
                content={analysis.health}
                score={analysis.healthScore}
                colorClass="text-green-600"
              />
            )}

            {analysis.family && (
              <Card
                title={t('analysis.family')}
                icon={Users}
                content={analysis.family}
                score={analysis.familyScore}
                colorClass="text-blue-600"
              />
            )}

            {analysis.fengShui && (
              <Card
                title={t('analysis.fengshui')}
                icon={Sparkles}
                content={analysis.fengShui}
                score={analysis.fengShuiScore}
                colorClass="text-teal-600"
              />
            )}

            {analysis.crypto && (
              <Card
                title={t('analysis.crypto')}
                icon={TrendingUp}
                content={analysis.crypto}
                score={analysis.cryptoScore}
                colorClass="text-orange-600"
                extraBadges={
                  <>
                    {analysis.cryptoYear && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-bold">
                        {t('analysis.cryptoYear')}: {analysis.cryptoYear}
                      </span>
                    )}
                    {analysis.cryptoStyle && (
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded font-bold">
                        {language === 'zh' ? '风格' : 'Style'}: {analysis.cryptoStyle}
                      </span>
                    )}
                  </>
                }
              />
            )}

            {/* 新增维度：亲密能量 */}
            {analysis.intimacyEnergy && (
              <Card
                title={analysis.intimacyEnergyTitle || t('analysis.intimacyEnergy')}
                icon={Heart}
                content={analysis.intimacyEnergy}
                score={analysis.intimacyEnergyScore}
                colorClass="text-pink-600"
              />
            )}

            {/* 新增维度：性能力 */}
            {analysis.sexualCharm && (
              <Card
                title={analysis.sexualCharmTitle || t('analysis.sexualCharm')}
                icon={Flame}
                content={analysis.sexualCharm}
                score={analysis.sexualCharmScore}
                colorClass="text-rose-600"
              />
            )}

            {/* 新增维度：适宜发展方位 */}
            {analysis.favorableDirections && (
              <Card
                title={analysis.favorableDirectionsTitle || t('analysis.favorableDirections')}
                icon={Compass}
                content={analysis.favorableDirections}
                score={analysis.favorableDirectionsScore}
                colorClass="text-cyan-600"
              />
            )}
          </>
        )}

        {/* Key Years and Periods - if available */}
        {analysis.keyYears && (
          <Card
            title={t('analysis.keyWealthYears')}
            icon={BarChart3}
            content={analysis.keyYears}
            colorClass="text-blue-700"
          />
        )}

        {analysis.peakPeriods && (
          <Card
            title={t('analysis.highProfitPeriod')}
            icon={TrendingUp}
            content={analysis.peakPeriods}
            colorClass="text-green-700"
          />
        )}

        {analysis.riskPeriods && (
          <Card
            title={t('analysis.highRiskPeriod')}
            icon={Shield}
            content={analysis.riskPeriods}
            colorClass="text-red-700"
          />
        )}

        {/* Static Score Explanation Card */}
        <Card
          title={t('analysis.scoreExplanation')}
          icon={Info}
          colorClass="text-gray-600"
          content={
            <div className="space-y-4">
              <ul className="space-y-1.5 font-mono text-xs md:text-sm">
                <li className="flex justify-between items-center border-b border-gray-100 pb-1">
                  <span>0-29{language === 'zh' ? '分' : ''}</span>
                  <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded font-bold">
                    {language === 'zh' ? '极弱' : 'Very Weak'}
                  </span>
                </li>
                <li className="flex justify-between items-center border-b border-gray-100 pb-1">
                  <span>30-49{language === 'zh' ? '分' : ''}</span>
                  <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-600 rounded font-bold">
                    {language === 'zh' ? '偏弱' : 'Weak'}
                  </span>
                </li>
                <li className="flex justify-between items-center border-b border-gray-100 pb-1">
                  <span>50-69{language === 'zh' ? '分' : ''}</span>
                  <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded font-bold">
                    {language === 'zh' ? '中等' : 'Average'}
                  </span>
                </li>
                <li className="flex justify-between items-center border-b border-gray-100 pb-1">
                  <span>70-89{language === 'zh' ? '分' : ''}</span>
                  <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded font-bold">
                    {language === 'zh' ? '优秀' : 'Excellent'}
                  </span>
                </li>
                <li className="flex justify-between items-center">
                  <span>90-100{language === 'zh' ? '分' : ''}</span>
                  <span className="text-xs px-2 py-0.5 bg-green-100 text-green-600 rounded font-bold">
                    {language === 'zh' ? '卓越' : 'Outstanding'}
                  </span>
                </li>
              </ul>
              <p className="text-xs text-black leading-relaxed border-t border-gray-100 pt-2 text-justify">
                {t('analysis.disclaimer')}
              </p>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default AnalysisResult;
