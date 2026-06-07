# 留言功能使用範例

以下範例示範如何在文章頁面中導入留言區元件，留言系統目前使用 `articleId` 作為留言與文章的關聯。

```astro
---
import Comments from '../../components/Comments.astro';

const { slug } = Astro.params;
const dbArticle = await fetchArticleBySlug(slug); // 你的文章查詢
---

<article>
  <!-- 文章內容 -->
</article>

<Comments articleId={dbArticle.Id} />
```

如果你使用 `BlogPost.astro` 或其他佈局，也只需傳入文章主鍵：

```astro
<Comments articleId={article.Id} />
```

### API 範例

- 取得留言：`GET /api/comments?articleId=123`
- 提交留言：

```json
{
  "articleId": 123,
  "content": "這是一則留言。"
}
```

留言資料存放在 Cloudflare D1，Firebase 只負責 Google 登入與 ID Token 驗證。
