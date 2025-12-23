import React, { useEffect, useRef } from 'react';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

interface TelegramLoginButtonProps {
  botUsername: string; // Telegram Bot 用户名（不带 @）
  buttonSize?: 'large' | 'medium' | 'small';
  cornerRadius?: number;
  requestAccess?: boolean;
  usePic?: boolean;
  dataOnauth: (user: TelegramUser) => void;
  dataAuthUrl?: string;
}

/**
 * Telegram Login Widget 组件
 * 文档：https://core.telegram.org/widgets/login
 */
const TelegramLoginButton: React.FC<TelegramLoginButtonProps> = ({
  botUsername,
  buttonSize = 'large',
  cornerRadius,
  requestAccess = true,
  usePic = false,
  dataOnauth,
  dataAuthUrl,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // 避免重复加载
    if (scriptLoadedRef.current) return;

    console.log('🔧 初始化 Telegram Login Widget, Bot:', botUsername);

    // 将回调函数绑定到全局对象
    (window as any).onTelegramAuth = (user: TelegramUser) => {
      console.log('✅ Telegram 登录成功:', user);
      dataOnauth(user);
    };

    // 动态加载 Telegram Login Widget 脚本
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', botUsername);
    script.setAttribute('data-size', buttonSize);

    script.onload = () => {
      console.log('✅ Telegram Widget 脚本加载成功');
    };

    script.onerror = (error) => {
      console.error('❌ Telegram Widget 脚本加载失败:', error);
    };

    if (cornerRadius !== undefined) {
      script.setAttribute('data-radius', cornerRadius.toString());
    }

    if (requestAccess) {
      script.setAttribute('data-request-access', 'write');
    }

    if (usePic) {
      script.setAttribute('data-userpic', 'true');
    }

    // 使用回调方式（不使用 redirect）
    if (dataAuthUrl) {
      script.setAttribute('data-auth-url', dataAuthUrl);
    } else {
      script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    }

    if (containerRef.current) {
      containerRef.current.appendChild(script);
      scriptLoadedRef.current = true;
    }

    return () => {
      // 清理：移除脚本和全局回调
      if (containerRef.current && script.parentNode === containerRef.current) {
        containerRef.current.removeChild(script);
      }
      delete (window as any).onTelegramAuth;
      scriptLoadedRef.current = false;
    };
  }, [botUsername, buttonSize, cornerRadius, requestAccess, usePic, dataOnauth, dataAuthUrl]);

  return (
    <div
      ref={containerRef}
      className="flex justify-center items-center"
      style={{ minHeight: '40px' }}
    />
  );
};

export default TelegramLoginButton;
