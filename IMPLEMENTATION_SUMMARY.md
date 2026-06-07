# Firebase Google 帳號留言系統實作總結

本專案已將留言系統改為：
- Firebase Authentication：提供 Google 登入
- Cloudflare D1：存放留言資料
- 文章留言關聯使用 `ArticleId`，而非文章 slug

## 主要檔案

| 檔案 | 說明 |
|------|------|
| `src/lib/firebase.ts` | Firebase App 初始化 |
| `src/lib/firebase-auth.ts` | 取得登入狀態與 ID Token |
| `src/pages/api/comments.ts` | 留言 API 端點（D1 存取） |
| `src/components/Comments.astro` | 留言區整合組件 |
| `src/components/CommentForm.astro` | 留言提交表單 |
| `src/components/CommentList.astro` | 顯示留言列表 |
| `db/schema.sql` | D1 資料表結構 |

## 留言流程

1. 使用者點選 Google 登入
2. Firebase Authentication 取得 ID Token
3. `CommentForm` 提交含 `articleId` 的留言
4. API 驗證 ID Token，將留言寫入 D1
5. `CommentList` 以 `articleId` 查詢通過審核的留言

## 留言資料結構

留言表 `Comments` 主要欄位：

- `Id`：留言主鍵
- `ArticleId`：對應文章主鍵
- `UserId`：Firebase 使用者 UID
- `UserName`：使用者名稱
- `UserEmail`：使用者信箱
- `UserAvatar`：使用者頭像
- `Content`：留言內容
- `CreatedAt`、`UpdatedAt`
- `Approved`：審核狀態

## 實作重點

- 使用 `articleId` 作為留言與文章的關聯鍵
- 伺服器端僅驗證 Firebase ID Token，不再使用 Firestore
- 留言儲存在 Cloudflare D1，方便與文章資料表結合

## 注意事項

- 若要顯示留言，必須將 `Approved` 設為 `1`
- `articleId` 必須從文章資料庫的主鍵取得
- 現行審核流程可改為自動化管理後台

## 後續建議

- 新增管理後台介面
- 支援留言刪除與修改
- 加入垃圾留言過濾與風控
- 實作留言排序與分頁
