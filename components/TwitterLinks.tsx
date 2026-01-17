import React from 'react';
import { Twitter, Mail } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const TwitterLinks: React.FC = () => {
  const { language } = useLanguage();
  const isZh = language === 'zh';

  const links = [
    {
      title: isZh ? '星盘专家' : 'Chart Expert',
      handle: '@TheMoonDojo',
      url: 'https://x.com/TheMoonDojo',
      description: isZh ? '十年星盘专家，用独家算法+AI大模型，重新定义你的交易运势' : '10-year astrology expert, using proprietary algorithms + AI to redefine your trading fortune',
      icon: Twitter,
    },
    {
      title: isZh ? '合作联系' : 'Contact',
      handle: '@AstroMoon1225',
      url: 'https://x.com/AstroMoon1225',
      description: isZh ? '合作/简历投递推特私信联系' : 'DM for collaboration/inquiries',
      icon: Mail,
    },
  ];

  return (
    <div className="flex items-center gap-2">
      {links.map((link, index) => {
        const Icon = link.icon;
        return (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            title={link.description}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden md:inline text-xs">{link.title}</span>
          </a>
        );
      })}
    </div>
  );
};

export default TwitterLinks;
