# Firebase Google 帳號留言功能設定

本檔說明 Firebase Authentication 的設定，留言內容儲存在 Cloudflare D1，因此不需要 Firebase Firestore。

## 1. 建立 Firebase 專案

1. 開啟 [Firebase Console](https://console.firebase.google.com/)
2. 建立新專案或選擇現有專案
3. 設定專案名稱並完成建立

## 2. 啟用 Firebase Authentication

1. 在 Firebase Console 左側選單選擇 `Authentication`
2. 點選 `Get Started`
3. 在 `Sign-in method` 中啟用 `Google`
4. 如果需要，可設定授權網域

## 3. 建立 Web 應用並取得設定值

1. 進入 `Project Settings`
2. 在 `Your apps` 區塊新增或選擇 Web 應用
3. 複製以下設定值：
   - API Key
   - Project ID
   - App ID
   - Auth Domain

## 4. 設定環境變數

建立 `.env` 檔案，並填入：

```bash
PUBLIC_FIREBASE_API_KEY=你的_api_key
PUBLIC_FIREBASE_PROJECT_ID=你的_project_id
PUBLIC_FIREBASE_APP_ID=你的_app_id
PUBLIC_FIREBASE_AUTH_DOMAIN=你的_auth_domain
FIREBASE_API_KEY=你的_api_key
```

`PUBLIC_` 前綴的設定會在客戶端公開，這在 Firebase Web 應用中屬於正常行為。

## 5. 本地測試

```bash
npm install
npm run dev
```

訪問你的文章頁面，應該能看到留言區並使用 Google 登入。

## 6. 其他補充

留言資料存放在 Cloudflare D1，請參考 `db/schema.sql` 的欄位設計。
