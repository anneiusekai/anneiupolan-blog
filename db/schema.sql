-- db/schema.sql
DROP TABLE IF EXISTS Articles;

CREATE TABLE Articles (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Title TEXT NOT NULL,
    Slug TEXT UNIQUE NOT NULL, -- 網址路徑，例如 'my-first-post'
    Content TEXT NOT NULL,     -- 這裡存放 Markdown 原始字串
    HeroImage TEXT,            -- R2 的圖片網址
    IsPublished INTEGER DEFAULT 0,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);