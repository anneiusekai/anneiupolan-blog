# Firebase Google 帳號留言功能指南

本專案使用 Firebase Authentication 提供 Google 登入，留言資料則存放於 Cloudflare D1。

## ✅ 已完成的整合

- Firebase Authentication：Google 登入/登出
- API 端點：`src/pages/api/comments.ts`
- 留言儲存：Cloudflare D1
- 前端留言元件：`src/components/Comments.astro`、`CommentForm.astro`、`CommentList.astro`
- 留言關聯：使用文章主鍵 `ArticleId`

## 一、環境設定

1. 在 Firebase Console 建立或選擇專案。
2. 前往 `Authentication`，啟用 Google Sign-In。
3. 在 `Project Settings > Your apps` 中建立 Web 應用，複製配置。
4. 將下列環境變數填入 `.env`：

```bash
PUBLIC_FIREBASE_API_KEY=你的_api_key
PUBLIC_FIREBASE_PROJECT_ID=你的_project_id
PUBLIC_FIREBASE_APP_ID=你的_app_id
PUBLIC_FIREBASE_AUTH_DOMAIN=你的_auth_domain
FIREBASE_API_KEY=你的_api_key
```

> `FIREBASE_API_KEY` 為服務端驗證 Firebase ID Token 的可選項目，若未設定，服務端會改用 `PUBLIC_FIREBASE_API_KEY`。

## 二、Cloudflare D1 留言資料表

留言資料透過 Cloudflare D1 儲存，相關結構請參考 `db/schema.sql`：

- `Comments` 表格含 `ArticleId` 作為文章關聯外鍵
- 留言提交後預設 `Approved = 0`
- 待管理者審核後改為 `Approved = 1`

## 三、前端留言流程

1. 使用者點選 Google 登入按鈕。
2. Firebase Auth 取得使用者 ID Token。
3. 留言表單向 `/api/comments` 發送 POST 請求。
4. 伺服器驗證 Firebase ID Token，將留言存入 D1。
5. 留言列表透過 `articleId` 查詢已批准留言。

## 四、API 使用方式

### 提交留言

POST `/api/comments`

Header:

```http
Content-Type: application/json
Authorization: Bearer <Firebase ID Token>
```

Body:

```json
{
  "articleId": 123,
  "content": "這是一則留言。"
}
```

### 取得留言

GET `/api/comments?articleId=123`


## 五、管理與審核

目前留言審核機制為手動審核。你可以直接透過 D1 或管理後台將 `Comments.Approved` 設為 `1`。

## 六、常見問題

### 留言沒出現

- 確認 API 回傳是否正常。
- 確認 `articleId` 是否正確傳遞。
- 確認留言是否已審核為 `Approved = 1`。

### Firebase 登入失敗

- 確認 Firebase 專案中已啟用 Google Sign-In。
- 確認 `.env` 的 Firebase 配置正確。
- 檢查是否有跨域或重定向 URI 設定問題。

## 七、相關檔案

- `src/lib/firebase.ts`
- `src/lib/firebase-auth.ts`
- `src/pages/api/comments.ts`
- `src/components/Comments.astro`
- `src/components/CommentForm.astro`
- `src/components/CommentList.astro`
- `db/schema.sql`
- `.env.example`

## 八、後續改進

- 建立管理後台自動審核機制
- 新增垃圾留言過濾
- 加入留言通知
- 支援留言回覆與排序
