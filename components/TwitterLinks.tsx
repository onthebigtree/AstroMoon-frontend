import React from 'react';
import { Twitter } from 'lucide-react';

const TwitterLinks: React.FC = () => {
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
    <div className="flex items-center gap-2">
      {links.map((link, index) => (
        <a
          key={index}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
          title={`${link.title} - ${link.handle}`}
        >
          <Twitter className="w-4 h-4" />
          <span className="hidden md:inline text-xs">{link.title}</span>
        </a>
      ))}
    </div>
  );
};

export default TwitterLinks;
