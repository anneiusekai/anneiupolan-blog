-- db/schema.sql
-- 安全遷移版本：避免 DROP TABLE，保留現有資料

-- CREATE TABLE Articles (
--     Id INTEGER PRIMARY KEY AUTOINCREMENT,
--     Title TEXT NOT NULL,
--     Slug TEXT UNIQUE NOT NULL, -- 網址路徑，例如 'my-first-post'
--     Content TEXT NOT NULL,     -- 這裡存放 Markdown 原始字串
--     HeroImage TEXT,            -- R2 的圖片網址
--     IsPublished INTEGER DEFAULT 0,
--     CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
--     UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
-- );

-- 這裡只負責新增欄位與新表，避免資料遺失。

ALTER TABLE Articles ADD COLUMN UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE IF NOT EXISTS Tags (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT UNIQUE NOT NULL,  -- 標籤名稱，例如 'Poland', 'Food'
    Slug TEXT UNIQUE NOT NULL   -- 用於 URL 的 slug，例如 'poland', 'food'
);

CREATE TABLE IF NOT EXISTS ArticleTags (
    ArticleId INTEGER NOT NULL,
    TagId INTEGER NOT NULL,
    PRIMARY KEY (ArticleId, TagId),
    FOREIGN KEY (ArticleId) REFERENCES Articles(Id) ON DELETE CASCADE,
    FOREIGN KEY (TagId) REFERENCES Tags(Id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Comments (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    ArticleId INTEGER NOT NULL,
    UserId TEXT NOT NULL,
    UserName TEXT NOT NULL,
    UserEmail TEXT NOT NULL,
    UserAvatar TEXT,
    Content TEXT NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    Approved INTEGER DEFAULT 0
    , FOREIGN KEY (ArticleId) REFERENCES Articles(Id) ON DELETE CASCADE
);

-- 新增版主回覆欄位：ReplyContent（文字）、ReplyBy（版主名稱或 ID，可選）、ReplyAt（回覆時間）
ALTER TABLE Comments ADD COLUMN ReplyContent TEXT;
ALTER TABLE Comments ADD COLUMN ReplyBy TEXT;
ALTER TABLE Comments ADD COLUMN ReplyAt DATETIME;

-- 注意：如果你的資料庫尚未有 Articles 表，請先建立它。
-- 如果你已經在本機或 D1 資料庫內有重要資料，這份腳本可直接執行以避免刪表。