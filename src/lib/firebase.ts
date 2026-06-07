// 初始化 Firebase (客户端)
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase 配置 - 这些值来自你的 Firebase Console
const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY || '',
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID || '',
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID || '',
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN || '',
};

// 在開發模式下輸出 config 以便除錯（不會在生產環境印出）
if (import.meta.env.DEV) {
  try {
    // 只印出非敏感欄位（authDomain, projectId）；apiKey 也屬公開資訊但避免在遠端 log
    console.debug('Firebase config (dev):', {
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
      appId: firebaseConfig.appId,
    });
  } catch (e) {}
}

// 初始化 Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
