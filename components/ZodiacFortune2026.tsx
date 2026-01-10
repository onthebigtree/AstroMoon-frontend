import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Download, Flame, Calendar, ChevronDown, Sparkles } from 'lucide-react';
import {
  getZodiacFortuneInfo,
  getZodiacSignByDate,
  ZodiacFortuneInfo
} from '../utils/zodiacFortune2026';

interface ZodiacFortune2026Props {
  isOpen: boolean;
  onClose: () => void;
  onGoToDetailedTest?: () => void;
}

// Tier List 人物配置
const TIER_AVATARS: Record<string, string[]> = {
  'T0': ['cz.jpg', 'vitalik.jpg'],              // 夯: CZ, Vitalik
  'T1': ['sun.jpg'],                            // 顶级: 孙宇晨
  'T2': ['saylor2.jpg', 'buffett.jpg'],         // 人上人: Saylor, Buffett
  'T3': ['lixiaolai.jpg'],                      // NPC: 李笑来
  'T4': ['trump.jpg', 'jiucai.jpg'],            // 拉: Trump, 韭菜
};

// Tier 行的 Y 坐标配置（基于 1201px 高度的底图，每行约 240px）
const TIER_Y_POSITIONS: Record<string, { y: number; height: number }> = {
  'T0': { y: 0, height: 240 },
  'T1': { y: 240, height: 240 },
  'T2': { y: 480, height: 240 },
  'T3': { y: 720, height: 240 },
  'T4': { y: 960, height: 241 },
};

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
  const [tierListImage, setTierListImage] = useState<string | null>(null);
  const [isLoadingTierList, setIsLoadingTierList] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 加载图片的辅助函数
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  // 生成 Tier List 图片
  const generateTierListImage = useCallback(async (userTier: string): Promise<string | null> => {
    try {
      setIsLoadingTierList(true);

      // 加载底图
      const background = await loadImage('/tier-list/background.jpeg');

      // 创建 Canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // 设置 Canvas 尺寸
      canvas.width = background.width;
      canvas.height = background.height;

      // 绘制底图
      ctx.drawImage(background, 0, 0);

      // 标签区域宽度（底图左侧的彩色标签）
      const labelWidth = 285;
      // 头像大小
      const avatarSize = 190;
      // 头像间距
      const avatarGap = 8;
      // 头像起始 X 位置
      const startX = labelWidth;

      // 加载并绘制每个 Tier 的人物头像
      for (const [tier, avatars] of Object.entries(TIER_AVATARS)) {
        const position = TIER_Y_POSITIONS[tier];
        if (!position || avatars.length === 0) continue;

        // 计算该行的垂直居中位置
        const centerY = position.y + (position.height - avatarSize) / 2;

        for (let i = 0; i < avatars.length; i++) {
          try {
            const avatar = await loadImage(`/tier-list/${avatars[i]}`);
            const x = startX + i * (avatarSize + avatarGap);

            // 绘制头像（保持比例裁剪为正方形）
            const size = Math.min(avatar.width, avatar.height);
            const sx = (avatar.width - size) / 2;
            const sy = (avatar.height - size) / 2;

            ctx.drawImage(avatar, sx, sy, size, size, x, centerY, avatarSize, avatarSize);
          } catch (e) {
            console.error(`加载头像失败: ${avatars[i]}`, e);
          }
        }
      }

      // 绘制用户的"你"标记
      const userPosition = TIER_Y_POSITIONS[userTier];
      if (userPosition) {
        const userAvatars = TIER_AVATARS[userTier] || [];
        const userX = startX + userAvatars.length * (avatarSize + avatarGap);
        const userY = userPosition.y + (userPosition.height - avatarSize) / 2;

        // 根据 Tier 设置颜色
        const tierColors: Record<string, string> = {
          'T0': '#ef4444', // red-500
          'T1': '#f97316', // orange-500
          'T2': '#eab308', // yellow-500
          'T3': '#22c55e', // green-500
          'T4': '#6b7280', // gray-500
        };

        // 绘制"你"的背景框
        ctx.fillStyle = tierColors[userTier] || '#6b7280';
        ctx.fillRect(userX, userY, avatarSize, avatarSize);

        // 绘制白色边框
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.strokeRect(userX, userY, avatarSize, avatarSize);

        // 绘制"你"字
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 80px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('你', userX + avatarSize / 2, userY + avatarSize / 2);
      }

      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('生成 Tier List 图片失败:', error);
      return null;
    } finally {
      setIsLoadingTierList(false);
    }
  }, []);

  // 当结果变化时生成 Tier List 图片
  useEffect(() => {
    if (result) {
      generateTierListImage(result.tier).then(setTierListImage);
    } else {
      setTierListImage(null);
    }
  }, [result, generateTierListImage]);

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
    setTierListImage(null);
  };

  // 生成分享图片
  const generateImage = async (): Promise<string | null> => {
    if (!cardRef.current) return null;

    try {
      const html2canvas = (await import('html2canvas')).default;
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
    setTierListImage(null);
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

                {/* 动态生成的 Tier List 图片 */}
                <div className="relative mb-6 rounded-xl overflow-hidden shadow-lg">
                  {isLoadingTierList ? (
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                      <div className="text-gray-500">加载中...</div>
                    </div>
                  ) : tierListImage ? (
                    <img
                      src={tierListImage}
                      alt="2026运势排行榜"
                      className="w-full h-auto"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                      <div className="text-gray-500">图片加载失败</div>
                    </div>
                  )}
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
                  disabled={isDownloading || isLoadingTierList}
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
      {/* 隐藏的 Canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ZodiacFortune2026;
