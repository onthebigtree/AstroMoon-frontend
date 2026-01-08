import React, { useState, useRef } from 'react';
import { X, Download, Flame, Calendar, ChevronDown, Sparkles } from 'lucide-react';
import {
  getZodiacFortuneInfo,
  getZodiacSignByDate,
  TIER_CONFIG,
  ZodiacFortuneInfo
} from '../utils/zodiacFortune2026';
import html2canvas from 'html2canvas';

interface ZodiacFortune2026Props {
  isOpen: boolean;
  onClose: () => void;
  onGoToDetailedTest?: () => void;
}

const ZodiacFortune2026: React.FC<ZodiacFortune2026Props> = ({
  isOpen,
  onClose,
  onGoToDetailedTest,
}) => {
  const [birthMonth, setBirthMonth] = useState<number>(1);
  const [birthDay, setBirthDay] = useState<number>(1);
  const [result, setResult] = useState<ZodiacFortuneInfo | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // 获取当月最大天数
  const getDaysInMonth = (month: number): number => {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return daysInMonth[month - 1];
  };

  // 处理日期选择后计算星座
  const handleDateSubmit = () => {
    const signId = getZodiacSignByDate(birthMonth, birthDay);
    if (signId) {
      const fortune = getZodiacFortuneInfo(signId);
      setResult(fortune);
      setGeneratedImage(null);
    }
  };

  // 重置结果
  const handleReset = () => {
    setResult(null);
    setGeneratedImage(null);
  };

  // 生成图片
  const generateImage = async (): Promise<string | null> => {
    if (!cardRef.current) return null;

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
      });

      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('生成图片失败:', error);
      return null;
    }
  };

  // 下载图片
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const dataUrl = await generateImage();
      if (!dataUrl) {
        alert('下载失败，请重试');
        return;
      }

      setGeneratedImage(dataUrl);

      const link = document.createElement('a');
      link.download = `2026运势-${result?.name}-${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('下载图片失败:', error);
      alert('下载失败，请重试');
    } finally {
      setIsDownloading(false);
    }
  };

  // 关闭时重置状态
  const handleClose = () => {
    setResult(null);
    setGeneratedImage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* 关闭按钮 */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-800 font-serif-sc flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-500" />
            2026 赤马红羊运势速测
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 内容区域 */}
        <div className="p-6">
          {!result ? (
            // 输入界面 - 只保留日期选择
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600 mb-2">输入你的出生日期</p>
                <p className="text-sm text-gray-400">自动判断你的 2026 运势等级</p>
              </div>

              <div className="flex gap-4 items-center justify-center">
                <div className="relative">
                  <select
                    value={birthMonth}
                    onChange={(e) => {
                      const newMonth = Number(e.target.value);
                      setBirthMonth(newMonth);
                      const maxDay = getDaysInMonth(newMonth);
                      if (birthDay > maxDay) {
                        setBirthDay(maxDay);
                      }
                    }}
                    className="appearance-none bg-gray-50 border border-gray-200 rounded-xl px-6 py-4 pr-12 text-xl font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>
                        {m}月
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                <div className="relative">
                  <select
                    value={birthDay}
                    onChange={(e) => setBirthDay(Number(e.target.value))}
                    className="appearance-none bg-gray-50 border border-gray-200 rounded-xl px-6 py-4 pr-12 text-xl font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {Array.from({ length: getDaysInMonth(birthMonth) }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>
                        {d}日
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <button
                onClick={handleDateSubmit}
                className="w-full py-4 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                测一测我的 2026
              </button>

              {/* 说明文字 */}
              <div className="text-center text-xs text-gray-400 pt-2">
                <p>基于西方占星学木星、土星、冥王星等行星走势分析</p>
                <p className="mt-1 text-orange-500 font-medium">2026 丙午年 · 赤马红羊劫</p>
              </div>
            </div>
          ) : (
            // 结果展示
            <div className="space-y-4">
              {/* 分享卡片 */}
              <div ref={cardRef} className="p-6 bg-white rounded-xl">
                {/* 品牌标识 */}
                <div className="text-center mb-4">
                  <div className="inline-flex items-center gap-2 mb-1">
                    <Flame className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium text-gray-600">Astro Moon 占星</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 font-serif-sc">
                    2026 赤马红羊运势速测
                  </h3>
                </div>

                {/* Tier List 图片 + "你"的标记 */}
                <div className="relative mb-6 rounded-xl overflow-hidden shadow-lg">
                  <img
                    src="/tier-list-2026.jpeg"
                    alt="2026运势排行榜"
                    className="w-full h-auto"
                    crossOrigin="anonymous"
                  />
                  {/* "你"的位置标记 - 放在名人头像正右边 */}
                  <div
                    className="absolute flex items-center justify-center"
                    style={{
                      // 每行高度约20%，计算中心位置
                      top: result.tier === 'T0' ? '10%' :
                           result.tier === 'T1' ? '30%' :
                           result.tier === 'T2' ? '50%' :
                           result.tier === 'T3' ? '70%' : '90%',
                      // 名人头像区域约 8%-35%，放在紧挨右边 38%
                      left: '38%',
                      transform: 'translateY(-50%)',
                    }}
                  >
                    {/* "你"字头像框 - 模拟名人头像大小 */}
                    <div className={`
                      w-10 h-10 md:w-12 md:h-12 rounded
                      flex items-center justify-center text-base md:text-lg font-black
                      shadow-lg border-2 border-white
                      ${result.tier === 'T0' ? 'bg-red-500 text-white' :
                        result.tier === 'T1' ? 'bg-orange-500 text-white' :
                        result.tier === 'T2' ? 'bg-yellow-500 text-white' :
                        result.tier === 'T3' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}
                    `}>
                      你
                    </div>
                  </div>
                </div>

                {/* 星座信息卡片 */}
                <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${result.gradient} p-4 mb-4 shadow-xl`}>
                  <div className="relative z-10 flex items-center gap-4 text-white">
                    <div className="text-4xl">{result.emoji}</div>
                    <div>
                      <h4 className="text-xl font-bold drop-shadow-lg">
                        {result.name}
                      </h4>
                      <p className="text-sm opacity-80">
                        {result.dateRange} · {result.subtitle}
                      </p>
                    </div>
                    <div className="ml-auto bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-sm font-bold">{result.tier}</span>
                    </div>
                  </div>
                </div>

                {/* 描述文字 */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {result.description}
                  </p>
                </div>

                {/* 锐评 */}
                <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-xl p-4">
                  <p className="text-sm font-medium text-gray-500 mb-1">锐评</p>
                  <p className="text-red-700 text-sm leading-relaxed font-medium">
                    "{result.comment}"
                  </p>
                </div>

                {/* 底部品牌信息 */}
                <div className="text-center pt-4 mt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400 mb-2">
                    仅供娱乐，请勿迷信
                  </p>
                  {/* 二维码 */}
                  <div className="flex flex-col items-center gap-1">
                    <img
                      src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=https://www.astromoon.xyz/"
                      alt="网站二维码"
                      className="w-16 h-16"
                      crossOrigin="anonymous"
                    />
                    <p className="text-[10px] text-gray-400">扫码查看完整星盘</p>
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="space-y-3">
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white rounded-xl hover:from-red-600 hover:via-orange-600 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold shadow-lg text-lg"
                >
                  <Download className="w-5 h-5" />
                  <span>{isDownloading ? '生成中...' : '生成分享图片'}</span>
                </button>

                {/* 生成的图片预览 */}
                {generatedImage && (
                  <div className="space-y-2">
                    <div className="border-2 border-orange-200 rounded-lg overflow-hidden">
                      <img
                        src={generatedImage}
                        alt="运势分享图"
                        className="w-full h-auto"
                      />
                    </div>
                    <p className="text-sm text-center font-medium text-orange-600 animate-pulse">
                      长按图片保存到相册
                    </p>
                  </div>
                )}

                {/* 深度测试入口 */}
                {onGoToDetailedTest && (
                  <button
                    onClick={onGoToDetailedTest}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg transition-all"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>深度测试 2026 年运</span>
                  </button>
                )}

                <button
                  onClick={handleReset}
                  className="w-full py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-xl transition-all font-medium"
                >
                  重新测试
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ZodiacFortune2026;
