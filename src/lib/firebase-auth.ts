// Firebase 认证工具函数
import { auth } from './firebase';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import type { User } from 'firebase/auth';

const googleProvider = new GoogleAuthProvider();

/**
 * 使用 Google 账号登录
 */
export const signInWithGoogle = async (): Promise<User | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    const errCode = error?.code ?? 'unknown';
    const errMessage = error?.message ?? String(error);
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : null;
    const href = typeof window !== 'undefined' ? window.location.href : null;

    // attach diagnostic info to the error so callers can display it in UI
    try {
      (error as any).diagnostic = {
        code: errCode,
        message: errMessage,
        userAgent,
        href,
        time: new Date().toISOString(),
      };
    } catch (_) {}

    console.error('Firebase Google sign-in failed', error?.diagnostic ?? {
      code: errCode,
      message: errMessage,
      userAgent,
      href,
      time: new Date().toISOString(),
    }, error);

    throw error;
  }
};

/**
 * 登出
 */
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

/**
 * 获取当前用户
 */
export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

/**
 * 获取当前用户的 ID Token（用于验证评论）
 */
export const getIdToken = async (): Promise<string | null> => {
  try {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  } catch (error) {
    console.error('Get ID token error:', error);
    return null;
  }
};
