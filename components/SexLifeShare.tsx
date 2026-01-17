import React, { useState, useRef } from 'react';
import { X, Download, Flame } from 'lucide-react';
import { getSexLifeTypeInfo } from '../utils/sexLifeTypes';
import html2canvas from 'html2canvas';
import { useLanguage } from '../contexts/LanguageContext';

interface SexLifeShareProps {
  isOpen: boolean;
  onClose: () => void;
  sexLifeType: string;
  userName?: string;
}

const SexLifeShare: React.FC<SexLifeShareProps> = ({
  isOpen,
  onClose,
  sexLifeType,
  userName
}) => {
  const { language } = useLanguage();
  const isZh = language === 'zh';
  const [isDownloading, setIsDownloading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const typeInfo = getSexLifeTypeInfo(sexLifeType);

  if (!isOpen || !typeInfo) return null;

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

  // 下载为图片
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const dataUrl = await generateImage();
      if (!dataUrl) {
        alert(isZh ? '下载失败，请重试' : 'Download failed, please try again');
        return;
      }

      // 保存到 state 供长按使用
      setGeneratedImage(dataUrl);

      const link = document.createElement('a');
      link.download = `性生活类型-${typeInfo.name}-${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('下载图片失败:', error);
      alert(isZh ? '下载失败，请重试' : 'Download failed, please try again');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* 关闭按钮 */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-800 font-serif-sc">{isZh ? '我的性生活类型' : 'My Intimate Life Type'}</h2>
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
              <Flame className="w-5 h-5 text-rose-600" />
              <span className="text-sm font-medium text-gray-600">Astro Moon 占星报告</span>
            </div>
            {userName && (
              <p className="text-xs text-gray-500">{isZh ? `${userName}的专属分析` : `${userName}'s Exclusive Analysis`}</p>
            )}
          </div>

          {/* 大标题 */}
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 font-serif-sc">
              {isZh ? '我的性生活类型' : 'My Intimate Life Type'}
            </h3>
          </div>

          {/* 等级卡片 */}
          <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${typeInfo.gradient} p-8 mb-6 shadow-xl`}>
            {/* 装饰性背景 */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

            <div className="relative z-10 text-center text-white">
              {/* Emoji */}
              <div className="text-6xl mb-4">{typeInfo.emoji}</div>

              {/* 类型名称 */}
              <h4 className="text-3xl md:text-4xl font-bold mb-2 drop-shadow-lg">
                {typeInfo.name}
              </h4>

              {/* 副标题 */}
              <p className="text-lg md:text-xl font-medium mb-3 opacity-90">
                {typeInfo.subtitle}
              </p>

              {/* 锐评标签 */}
              <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                <span className="text-sm font-bold">{typeInfo.label}</span>
              </div>

              {/* 原型参考 */}
              <div className="mt-4">
                <span className="inline-block bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                  {isZh ? '原型：' : 'Archetype: '}{typeInfo.archetype}
                </span>
              </div>
            </div>
          </div>

          {/* 描述文字 */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <p className="text-gray-700 leading-relaxed text-center text-sm">
              {typeInfo.description}
            </p>
          </div>

          {/* 星象配置 */}
          <div className="bg-indigo-50 rounded-xl p-4 mb-6">
            <p className="text-xs text-indigo-700 text-center font-medium">
              {isZh ? '适用星盘配置：' : 'Astro Configuration: '}{typeInfo.astroConfig}
            </p>
          </div>

          {/* 底部品牌信息与水印 */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">
              {isZh ? '结合西方古典占星、金融占星与交易心理学' : 'Combining Western classical astrology, financial astrology and trading psychology'}
            </p>
            <p className="text-xs font-bold text-gray-700 mb-2">
              {isZh ? '全网第一位财运指标发明人。——>月亮牌手@TheMoonDojo' : 'First wealth index inventor —> @TheMoonDojo'}
            </p>
            <p className="text-xs text-orange-600 font-medium">
              ⚠️ {isZh ? '仅供娱乐参考，请勿当真' : 'For entertainment only'}
            </p>
            {/* 二维码 */}
            <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col items-center gap-2">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://www.astromoon.xyz/"
                alt={isZh ? '网站二维码' : 'Website QR Code'}
                className="w-20 h-20"
              />
              <p className="text-xs text-gray-500">{isZh ? '扫码访问 www.astromoon.xyz' : 'Scan to visit www.astromoon.xyz'}</p>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 space-y-3">
          {/* 下载按钮 */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl hover:from-rose-700 hover:to-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all font-bold shadow-lg text-lg"
          >
            <Download className="w-5 h-5" />
            <span>{isDownloading ? (isZh ? '生成中...' : 'Generating...') : (isZh ? '生成分享图片' : 'Generate Share Image')}</span>
          </button>

          {/* 生成的图片预览 */}
          {generatedImage && (
            <div className="space-y-2">
              <div className="border-2 border-rose-200 rounded-lg overflow-hidden">
                <img
                  src={generatedImage}
                  alt="性生活类型分享图"
                  className="w-full h-auto"
                />
              </div>
              <p className="text-sm text-center font-medium text-rose-600 animate-pulse">
                📱 {isZh ? '长按图片保存到相册' : 'Long press to save image'}
              </p>
            </div>
          )}

          {!generatedImage && (
            <p className="text-xs text-gray-500 text-center">
              💡 {isZh ? '点击按钮生成图片，然后长按图片保存' : 'Click button to generate image, then long press to save'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SexLifeShare;
