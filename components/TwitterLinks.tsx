import React from 'react';
import { Twitter, MessageCircle } from 'lucide-react';

const TwitterLinks: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      {/* Twitter 按钮 */}
      <a
        href="https://x.com/TheMoonDojo"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-1.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
        title="关注我们的 Twitter @TheMoonDojo"
      >
        <Twitter className="w-4 h-4" />
        <span className="hidden md:inline text-xs">Twitter</span>
      </a>

      {/* Discord 按钮 */}
      <a
        href="https://discord.gg/yourdiscord"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-1.5 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
        title="加入我们的 Discord 社区"
      >
        <MessageCircle className="w-4 h-4" />
        <span className="hidden md:inline text-xs">Discord</span>
      </a>
    </div>
  );
};

export default TwitterLinks;
