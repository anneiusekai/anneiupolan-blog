/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

// 引入 Cloudflare 的型別
type D1Database = import("@cloudflare/workers-types/experimental").D1Database;

// 定義我們的環境變數綁定 (要跟 wrangler.toml 裡面的 binding 名稱一致)
type ENV = {
  anneiupolan_blog_db: D1Database;
};

// 將綁定注入到 Astro 的 Locals 中
type Runtime = import("@astrojs/cloudflare").Runtime<ENV>;
declare namespace App {
  interface Locals extends Runtime {}
}