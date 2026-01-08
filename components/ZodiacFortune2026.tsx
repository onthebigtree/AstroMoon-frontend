import React, { useState, useRef } from 'react';
import { X, Download, Flame, Calendar, ChevronDown } from 'lucide-react';
import {
  getZodiacFortuneInfo,
  getZodiacList,
  getZodiacSignByDate,
  TIER_CONFIG,
  ZodiacFortuneInfo
} from '../utils/zodiacFortune2026';
import html2canvas from 'html2canvas';

interface ZodiacFortune2026Props {
  isOpen: boolean;
  onClose: () => void;
}

type InputMode = 'select' | 'date';

const ZodiacFortune2026: React.FC<ZodiacFortune2026Props> = ({
  isOpen,
  onClose,
}) => {
  const [inputMode, setInputMode] = useState<InputMode>('select');
  const [selectedSign, setSelectedSign] = useState<string>('');
  const [birthMonth, setBirthMonth] = useState<number>(1);
  const [birthDay, setBirthDay] = useState<number>(1);
  const [result, setResult] = useState<ZodiacFortuneInfo | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const zodiacList = getZodiacList();

  // 获取当月最大天数
  const getDaysInMonth = (month: number): number => {
    // 使用非闰年的天数
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return daysInMonth[month - 1];
  };

  // 处理星座选择
  const handleSignSelect = (signId: string) => {
    setSelectedSign(signId);
    const fortune = getZodiacFortuneInfo(signId);
    setResult(fortune);
    setGeneratedImage(null);
  };

  // 处理日期选择后计算星座
  const handleDateSubmit = () => {
    const signId = getZodiacSignByDate(birthMonth, birthDay);
    if (signId) {
      setSelectedSign(signId);
      const fortune = getZodiacFortuneInfo(signId);
      setResult(fortune);
      setGeneratedImage(null);
    }
  };

  // 重置结果
  const handleReset = () => {
    setResult(null);
    setSelectedSign('');
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
    setSelectedSign('');
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
            // 输入界面
            <div className="space-y-6">
              {/* 模式切换 */}
              <div className="flex rounded-xl overflow-hidden border border-gray-200">
                <button
                  onClick={() => setInputMode('select')}
                  className={`flex-1 py-3 px-4 text-sm font-medium transition-all ${
                    inputMode === 'select'
                      ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  选择星座
                </button>
                <button
                  onClick={() => setInputMode('date')}
                  className={`flex-1 py-3 px-4 text-sm font-medium transition-all ${
                    inputMode === 'date'
                      ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  输入生日
                </button>
              </div>

              {inputMode === 'select' ? (
                // 星座选择网格
                <div className="grid grid-cols-3 gap-3">
                  {zodiacList.map((zodiac) => (
                    <button
                      key={zodiac.id}
                      onClick={() => handleSignSelect(zodiac.id)}
                      className="flex flex-col items-center gap-1 p-3 rounded-xl border-2 border-gray-100 hover:border-orange-300 hover:bg-orange-50 transition-all group"
                    >
                      <span className="text-2xl group-hover:scale-110 transition-transform">
                        {zodiac.emoji}
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        {zodiac.name}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {zodiac.dateRange}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                // 日期输入
                <div className="space-y-4">
                  <p className="text-sm text-gray-500 text-center">
                    输入你的出生月份和日期，自动判断星座
                  </p>
                  <div className="flex gap-4 items-center justify-center">
                    <div className="relative">
                      <select
                        value={birthMonth}
                        onChange={(e) => {
                          const newMonth = Number(e.target.value);
                          setBirthMonth(newMonth);
                          // 如果当前日期超过新月份的最大天数，调整日期
                          const maxDay = getDaysInMonth(newMonth);
                          if (birthDay > maxDay) {
                            setBirthDay(maxDay);
                          }
                        }}
                        className="appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-10 text-lg font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                          <option key={m} value={m}>
                            {m}月
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                    <div className="relative">
                      <select
                        value={birthDay}
                        onChange={(e) => setBirthDay(Number(e.target.value))}
                        className="appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-10 text-lg font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        {Array.from({ length: getDaysInMonth(birthMonth) }, (_, i) => i + 1).map((d) => (
                          <option key={d} value={d}>
                            {d}日
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <button
                    onClick={handleDateSubmit}
                    className="w-full py-4 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-5 h-5" />
                    测一测我的 2026
                  </button>
                </div>
              )}

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

                {/* Tier 标签 */}
                <div className="text-center mb-4">
                  <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r ${TIER_CONFIG[result.tier].gradient} text-white shadow-md`}>
                    {result.tierEmoji} {result.tier} · {result.tierName}
                  </span>
                </div>

                {/* 等级卡片 */}
                <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${result.gradient} p-6 mb-4 shadow-xl`}>
                  {/* 装饰性背景 */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
                  <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full -ml-10 -mb-10"></div>

                  <div className="relative z-10 text-center text-white">
                    {/* Emoji */}
                    <div className="text-5xl mb-3">{result.emoji}</div>

                    {/* 星座名称 */}
                    <h4 className="text-2xl font-bold mb-1 drop-shadow-lg">
                      {result.name}
                    </h4>

                    {/* 日期范围 */}
                    <p className="text-sm opacity-80 mb-2">
                      {result.dateRange}
                    </p>

                    {/* 副标题 */}
                    <div className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-sm font-bold">{result.subtitle}</span>
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
