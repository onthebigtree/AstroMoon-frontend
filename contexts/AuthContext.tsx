import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  signInWithEmailLink,
  sendSignInLinkToEmail,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  isSignInWithEmailLink,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
} from 'firebase/auth';
import { auth } from '../firebase.config';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  sendLoginLink: (email: string) => Promise<void>;
  completeLoginWithLink: (email: string, emailLink: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  // 新增：电子邮件/密码登录
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 发送登录链接到邮箱
  async function sendLoginLink(email: string) {
    const actionCodeSettings = {
      // 登录完成后的重定向 URL
      url: window.location.origin,
      handleCodeInApp: true,
    };

    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    // 保存邮箱到本地存储，用于后续验证
    window.localStorage.setItem('emailForSignIn', email);
  }

  // 使用邮箱链接完成登录
  async function completeLoginWithLink(email: string, emailLink: string) {
    await signInWithEmailLink(auth, email, emailLink);
    // 清除本地存储的邮箱
    window.localStorage.removeItem('emailForSignIn');
  }

  // 登出
  async function logout() {
    await signOut(auth);
  }

  // Google 登录
  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }

  // 注册新用户（电子邮件/密码）
  async function signUp(email: string, password: string) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // 发送验证邮件
    if (userCredential.user) {
      await sendEmailVerification(userCredential.user);
    }
  }

  // 登录（电子邮件/密码）
  async function signIn(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  // 重置密码
  async function resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email, {
      url: window.location.origin,
      handleCodeInApp: false,
    });
  }

  // 发送邮箱验证邮件
  async function sendVerificationEmail() {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    } else {
      throw new Error('没有登录的用户');
    }
  }

  // 检查是否是通过邮箱链接打开的页面
  useEffect(() => {
    const handleEmailLink = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
          // 如果用户在不同的设备上打开链接，需要提示输入邮箱
          email = window.prompt('请输入您的邮箱地址以完成登录');
        }
        if (email) {
          try {
            await completeLoginWithLink(email, window.location.href);
            // 清理 URL 中的参数
            window.history.replaceState({}, document.title, window.location.pathname);
          } catch (error) {
            console.error('Login with email link failed:', error);
          }
        }
      }
    };

    handleEmailLink();
  }, []);

  // 监听认证状态变化
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    loading,
    sendLoginLink,
    completeLoginWithLink,
    logout,
    loginWithGoogle,
    // 新增的方法
    signUp,
    signIn,
    resetPassword,
    sendVerificationEmail,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
