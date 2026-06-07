# 📚 Tag功能 - 實施完成指南

## ✨ 實施完成項目總結

### 📝 修改的文件（6個）

1. **[db/schema.sql](db/schema.sql)**
   - ✅ 添加 `UpdatedAt` 欄位到 Articles 表
   - ✅ 創建 `Tags` 表（存儲標籤名稱和slug）
   - ✅ 創建 `ArticleTags` 關聯表（多對多關係）

2. **[src/content.config.ts](src/content.config.ts)**
   - ✅ 在 Zod schema 中添加 `tags: z.array(z.string()).default([])`

3. **[src/content/blog/pierogi.mdx](src/content/blog/pierogi.mdx)**
   - ✅ 添加 frontmatter: `tags: ["Poland", "Food", "Taigi"]`

4. **[src/pages/blog/index.astro](src/pages/blog/index.astro)**
   - ✅ 導入 `TagCloud` 和 `TagList` 組件
   - ✅ 從 Content Collections 取得每篇文章的 tags
   - ✅ 顯示標籤雲
   - ✅ 在每篇文章下方顯示 tags

5. **[src/pages/blog/[slug].astro](src/pages/blog/[slug].astro)**
   - ✅ 導入 `TagList` 組件
   - ✅ 取得文章的 tags 並顯示
   - ✅ 在文章內容前顯示 tags 列表

### 🎨 新增的組件（2個）

6. **[src/components/TagList.astro](src/components/TagList.astro)**
   - 顯示單篇文章的 tags 列表
   - 每個 tag 是一個可點擊的鏈接，指向該 tag 的頁面
   - 包含預設的樣式（徽章風格）

7. **[src/components/TagCloud.astro](src/components/TagCloud.astro)**
   - 顯示所有 tags 的雲狀展示（字體大小根據文章數量變化）
   - 使用 `getCollection('blog')` 動態收集所有 tags
   - 按文章數量排序

### 🌐 新增的頁面（2個）

8. **[src/pages/blog/tags/index.astro](src/pages/blog/tags/index.astro)**
   - URL: `/blog/tags/`
   - 顯示所有 tags 及其文章數量
   - Grid 卡片布局，可點擊進入特定 tag

9. **[src/pages/blog/tags/[tag].astro](src/pages/blog/tags/[tag].astro)**
   - URL: `/blog/tags/[tag-name]/`
   - 顯示特定 tag 的所有文章
   - 使用 `getStaticPaths()` 動態生成路由
   - 包含返回按鈕和文章計數

---

## 🚀 使用方法

### 1. 為新文章添加 tags

編輯文章 `.mdx` 檔案的 frontmatter：

```mdx
---
title: "文章標題"
description: "描述"
pubDate: 2026-05-22
heroImage: "image-url"
tags: ["Tag1", "Tag2", "Tag3"]
---
```

### 2. Tag 命名規則

- 建議使用英文（便於 URL slug）
- 例如：`["Poland", "Food", "Travel", "Culture"]`
- Tag 會自動轉換為 URL-safe 的 slug（小寫 + 連字號）
  - `"Food & Drink"` → `/blog/tags/food-drink`

### 3. 用戶可以訪問的 Tag 功能

| 頁面 | URL | 功能 |
|------|-----|------|
| 博客首頁 | `/blog/` | 顯示所有 tags 的「標籤雲」和每篇文章的 tags |
| 所有 Tags | `/blog/tags/` | 顯示所有 tags 及其文章計數 |
| 特定 Tag | `/blog/tags/food/` | 顯示該 tag 的所有文章 |
| 文章詳情 | `/blog/[slug]/` | 顯示該文章的所有 tags（在內容前方） |

---

## 🔧 後續增強建議

### 立即可實施
- [ ] 在數據庫中添加現有文章的 tags（對於從數據庫儲存的文章）
- [ ] 在 Admin 編輯頁面添加 tags 選擇器
- [ ] 添加 tag 篩選/搜索功能（在 `/blog/` 頁面）

### 進階功能
- [ ] 在首頁添加「熱門 Tags」
- [ ] 實現 tag 自動完成
- [ ] 添加 RSS feed 按 tag 訂閱
- [ ] 在側邊欄添加相關文章推薦（基於共同 tags）

---

## 📊 數據庫結構

### Articles 表（新增欄位）
```sql
ALTER TABLE Articles ADD COLUMN UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP;
```

### Tags 表（新建）
```sql
CREATE TABLE Tags (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT UNIQUE NOT NULL,   -- 例如: "Poland"
    Slug TEXT UNIQUE NOT NULL    -- 例如: "poland"
);
```

### ArticleTags 表（新建）
```sql
CREATE TABLE ArticleTags (
    ArticleId INTEGER NOT NULL,
    TagId INTEGER NOT NULL,
    PRIMARY KEY (ArticleId, TagId),
    FOREIGN KEY (ArticleId) REFERENCES Articles(Id) ON DELETE CASCADE,
    FOREIGN KEY (TagId) REFERENCES Tags(Id) ON DELETE CASCADE
);
```

---

## 🎯 技術細節

### Tag 數據流

1. **寫入**：在 `.mdx` frontmatter 中定義 tags
2. **驗證**：Zod schema 在 `content.config.ts` 中驗證
3. **收集**：`getCollection('blog')` 在需要時收集
4. **渲染**：組件根據 tags 生成 HTML

### 關鍵函數

**tagToSlug** - 將 tag 名稱轉換為 URL-safe 的 slug
```typescript
function tagToSlug(tag: string): string {
  return tag.toLowerCase().replace(/\s+/g, '-');
}
```

**getTagSize** - 根據 tag 文章數量計算字體大小（TagCloud）
```typescript
function getTagSize(count: number): string {
  const normalized = (count - minCount) / countRange;
  const size = 0.8 + normalized * 0.6;  // 0.8rem ~ 1.4rem
  return `${size}rem`;
}
```

---

## 🐛 常見問題

### Q: 為什麼有些文章沒有 tags 顯示？
A: 檢查 frontmatter 中是否添加了 `tags` 欄位。如果檔案是從數據庫儲存的，需要在數據庫中設置 tags。

### Q: Tag slug 生成有誤？
A: Tag 會自動轉換為小寫 + 連字號。例如 `"Food & Drink"` → `food-drink`。

### Q: 如何更新現有文章的 tags？
A: 編輯相應的 `.mdx` 檔案，修改 frontmatter 中的 `tags` 陣列即可。

### Q: Tag 個數有上限嗎？
A: 沒有硬性上限，但建議每篇文章 3-7 個 tags 最佳。

---

## ✅ 驗證清單

部署前檢查：

- [ ] 運行 `npm run build` 確保沒有構建錯誤
- [ ] 本地測試所有 tags 頁面
- [ ] 確認文章 frontmatter 中的 tags 格式正確
- [ ] 檢查數據庫是否已運行最新 schema
- [ ] 測試 tag URL（例如 `/blog/tags/poland/`）
- [ ] 確認 TagCloud 和 TagList 組件渲染正確

---

## 📚 相關文件

- Content Schema: [src/content.config.ts](src/content.config.ts)
- 示例文章: [src/content/blog/pierogi.mdx](src/content/blog/pierogi.mdx)
- 組件位置: `src/components/TagList.astro` 和 `src/components/TagCloud.astro`
- 頁面位置: `src/pages/blog/tags/`
