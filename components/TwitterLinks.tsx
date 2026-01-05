import React, { useState } from 'react';
import { Twitter, ChevronDown } from 'lucide-react';

const TwitterLinks: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    {
      title: '星盘专家',
      handle: '@TheMoonDojo',
      url: 'https://x.com/TheMoonDojo',
      description: '十年星盘专家，用独家算法+AI大模型，重新定义你的交易运势',
    },
    {
      title: '合作联系',
      handle: '@AstroMoon1225',
      url: 'https://x.com/AstroMoon1225',
      description: '合作/简历投递推特私信联系',
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
        title="Twitter 链接"
      >
        <Twitter className="w-4 h-4" />
        <span className="hidden md:inline text-xs">关注我们</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* 下拉菜单 */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="block p-4 hover:bg-indigo-50 transition-colors border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-start gap-3">
                  <div className="bg-indigo-100 p-2 rounded-lg flex-shrink-0">
                    <Twitter className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 text-sm">{link.title}</span>
                      <span className="text-xs text-indigo-600">{link.handle}</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {link.description}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TwitterLinks;
