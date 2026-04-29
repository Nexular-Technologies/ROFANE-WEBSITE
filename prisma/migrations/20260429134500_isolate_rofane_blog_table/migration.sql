CREATE TABLE IF NOT EXISTS "RofaneBlogPost" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "preview_image_url" TEXT NOT NULL,
    "categories" TEXT NOT NULL DEFAULT '',
    "keywords" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "reading_minutes" INTEGER NOT NULL DEFAULT 5,
    "published_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "seo_keywords" TEXT,
    "canonical_url" TEXT,
    CONSTRAINT "RofaneBlogPost_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "RofaneBlogPost_slug_key"
ON "RofaneBlogPost"("slug");

CREATE INDEX IF NOT EXISTS "RofaneBlogPost_status_published_at_idx"
ON "RofaneBlogPost"("status", "published_at");

INSERT INTO "RofaneBlogPost" (
    "slug", "title", "excerpt", "content", "preview_image_url", "categories", "keywords", "author",
    "status", "reading_minutes", "published_at", "seo_title", "seo_description", "seo_keywords", "canonical_url"
)
SELECT
    bp."slug", bp."title", bp."excerpt", bp."content", bp."preview_image_url", bp."categories", bp."keywords", bp."author",
    bp."status", bp."reading_minutes", bp."published_at", bp."seo_title", bp."seo_description", bp."seo_keywords", bp."canonical_url"
FROM "BlogPost" bp
WHERE EXISTS (
    SELECT 1
    FROM information_schema.tables t
    WHERE t.table_schema = 'public' AND t.table_name = 'BlogPost'
)
AND NOT EXISTS (
    SELECT 1 FROM "RofaneBlogPost" rbp WHERE rbp."slug" = bp."slug"
);
