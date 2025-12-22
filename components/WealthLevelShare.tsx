import React, { useState, useRef } from 'react';
import { X, Download, TrendingUp } from 'lucide-react';
import { getWealthLevelInfo } from '../utils/wealthLevels';
import html2canvas from 'html2canvas';

interface WealthLevelShareProps {
  isOpen: boolean;
  onClose: () => void;
  wealthLevel: string;
  userName?: string;
}

const WealthLevelShare: React.FC<WealthLevelShareProps> = ({
  isOpen,
  onClose,
  wealthLevel,
  userName
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const levelInfo = getWealthLevelInfo(wealthLevel);

  if (!isOpen || !levelInfo) return null;

  // 下载为图片
  const handleDownload = async () => {
    if (!cardRef.current) return;

    setIsDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const link = document.createElement('a');
      link.download = `财富量级-${levelInfo.name}-${new Date().getTime()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('下载图片失败:', error);
      alert('下载失败，请重试');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* 关闭按钮 */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-800 font-serif-sc">我的财富量级潜力</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 卡片内容 */}
        <div ref={cardRef} className="p-8 bg-white">
          {/* 品牌标识 */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-medium text-gray-600">Astro Moon 占星报告</span>
            </div>
            {userName && (
              <p className="text-xs text-gray-500">{userName}的专属分析</p>
            )}
          </div>

          {/* 大标题 */}
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 font-serif-sc">
              我这辈子的财富量级潜力
            </h3>
            <div className="w-16 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full"></div>
          </div>

          {/* 等级卡片 */}
          <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${levelInfo.gradient} p-8 mb-6 shadow-xl`}>
            {/* 装饰性背景 */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

            <div className="relative z-10 text-center text-white">
              {/* Emoji */}
              <div className="text-6xl mb-4">{levelInfo.emoji}</div>

              {/* 等级名称 */}
              <h4 className="text-3xl md:text-4xl font-bold mb-2 drop-shadow-lg">
                {levelInfo.name}
              </h4>

              {/* 英文副标题 */}
              <p className="text-lg md:text-xl font-medium mb-3 opacity-90">
                {levelInfo.subtitle}
              </p>

              {/* 资产范围 */}
              <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                <span className="text-sm font-bold">{levelInfo.assetRange}</span>
              </div>

              {/* 等级ID徽章 */}
              <div className="mt-4">
                <span className="inline-block bg-white/30 backdrop-blur-sm px-6 py-2 rounded-full text-2xl font-black tracking-wider">
                  {levelInfo.id}
                </span>
              </div>
            </div>
          </div>

          {/* 描述文字 */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <p className="text-gray-700 leading-relaxed text-center">
              {levelInfo.description}
            </p>
          </div>

          {/* 底部品牌信息与水印 */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">
              结合西方古典占星、金融占星与交易心理学
            </p>
            <p className="text-xs font-bold text-gray-700">
              全网第一位财运指标发明人
            </p>
            <p className="text-xs text-indigo-600 font-medium mt-1">
              月亮牌手 | The Moon Dojo
            </p>
            {/* 网站水印 */}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <a
                href="https://www.astromoon.xyz/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                <TrendingUp className="w-3 h-3" />
                www.astromoon.xyz
              </a>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all font-medium shadow-sm"
          >
            <Download className="w-4 h-4" />
            {isDownloading ? '生成中...' : '下载图片'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WealthLevelShare;
