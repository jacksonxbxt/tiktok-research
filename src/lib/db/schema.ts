import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  integer,
  real,
  jsonb,
} from "drizzle-orm/pg-core";

// Tracked competitors/brands
export const competitors = pgTable("competitors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  tiktokHandle: text("tiktok_handle").notNull().unique(),
  category: text("category"), // e.g., "fast-fashion", "luxury", "streetwear"
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  scrapeFrequency: text("scrape_frequency").default("daily"), // "daily" | "weekly" | "manual"
  addedAt: timestamp("added_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Scraped videos
export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  tiktokId: text("tiktok_id").notNull().unique(),
  competitorId: integer("competitor_id").references(() => competitors.id),
  authorHandle: text("author_handle").notNull(),
  authorName: text("author_name"),
  authorAvatar: text("author_avatar"),
  authorFollowers: integer("author_followers"),
  authorVerified: boolean("author_verified").default(false),
  description: text("description"),
  hashtags: jsonb("hashtags").$type<string[]>().default([]),
  mentions: jsonb("mentions").$type<string[]>().default([]),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),
  plays: integer("plays").default(0),
  saves: integer("saves").default(0),
  audioName: text("audio_name"),
  audioAuthor: text("audio_author"),
  audioOriginal: boolean("audio_original").default(false),
  duration: integer("duration"), // in seconds
  videoUrl: text("video_url"),
  coverUrl: text("cover_url"),
  webUrl: text("web_url"),
  isAd: boolean("is_ad").default(false),
  isPinned: boolean("is_pinned").default(false),
  // AI UGC detection fields
  aiUgcScore: real("ai_ugc_score"), // 0-1 confidence score
  aiUgcSignals: jsonb("ai_ugc_signals").$type<string[]>().default([]),
  // Timestamps
  videoCreatedAt: timestamp("video_created_at"),
  scrapedAt: timestamp("scraped_at").defaultNow(),
});

// Competitor metrics snapshots (for historical charts)
export const competitorSnapshots = pgTable("competitor_snapshots", {
  id: serial("id").primaryKey(),
  competitorId: integer("competitor_id")
    .references(() => competitors.id)
    .notNull(),
  followers: integer("followers").default(0),
  following: integer("following").default(0),
  totalLikes: integer("total_likes").default(0),
  videoCount: integer("video_count").default(0),
  avgLikesPerVideo: real("avg_likes_per_video"),
  avgCommentsPerVideo: real("avg_comments_per_video"),
  engagementRate: real("engagement_rate"), // (likes + comments) / followers
  snapshotAt: timestamp("snapshot_at").defaultNow(),
});

// Tracked hashtags for trend detection
export const trackedHashtags = pgTable("tracked_hashtags", {
  id: serial("id").primaryKey(),
  hashtag: text("hashtag").notNull().unique(),
  category: text("category"), // e.g., "fashion", "style", "aesthetic"
  isActive: boolean("is_active").default(true),
  addedAt: timestamp("added_at").defaultNow(),
});

// Hashtag velocity snapshots
export const hashtagSnapshots = pgTable("hashtag_snapshots", {
  id: serial("id").primaryKey(),
  hashtagId: integer("hashtag_id")
    .references(() => trackedHashtags.id)
    .notNull(),
  videoCount: integer("video_count").default(0),
  viewCount: integer("view_count"),
  avgEngagement: real("avg_engagement"),
  snapshotAt: timestamp("snapshot_at").defaultNow(),
});

// Saved content library
export const savedContent = pgTable("saved_content", {
  id: serial("id").primaryKey(),
  videoId: integer("video_id")
    .references(() => videos.id)
    .notNull(),
  tags: jsonb("tags").$type<string[]>().default([]),
  notes: text("notes"),
  category: text("category"), // e.g., "ai-ugc", "viral", "inspiration"
  savedAt: timestamp("saved_at").defaultNow(),
});

// Alert settings
export const alertSettings = pgTable("alert_settings", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // "viral" | "trend" | "ai-ugc"
  threshold: integer("threshold"), // e.g., 10000 for viral likes threshold
  enabled: boolean("enabled").default(true),
  emailTo: text("email_to"),
  lastTriggeredAt: timestamp("last_triggered_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Scrape jobs (for tracking scheduled scrapes)
export const scrapeJobs = pgTable("scrape_jobs", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // "competitor" | "hashtag" | "search"
  targetId: integer("target_id"), // competitor_id or hashtag_id
  targetValue: text("target_value"), // the actual username/hashtag/query
  status: text("status").default("pending"), // "pending" | "running" | "completed" | "failed"
  itemsScraped: integer("items_scraped").default(0),
  error: text("error"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  scheduledFor: timestamp("scheduled_for"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Types for TypeScript
export type Competitor = typeof competitors.$inferSelect;
export type NewCompetitor = typeof competitors.$inferInsert;

export type Video = typeof videos.$inferSelect;
export type NewVideo = typeof videos.$inferInsert;

export type CompetitorSnapshot = typeof competitorSnapshots.$inferSelect;
export type NewCompetitorSnapshot = typeof competitorSnapshots.$inferInsert;

export type TrackedHashtag = typeof trackedHashtags.$inferSelect;
export type NewTrackedHashtag = typeof trackedHashtags.$inferInsert;

export type HashtagSnapshot = typeof hashtagSnapshots.$inferSelect;
export type NewHashtagSnapshot = typeof hashtagSnapshots.$inferInsert;

export type SavedContent = typeof savedContent.$inferSelect;
export type NewSavedContent = typeof savedContent.$inferInsert;

export type AlertSetting = typeof alertSettings.$inferSelect;
export type NewAlertSetting = typeof alertSettings.$inferInsert;

export type ScrapeJob = typeof scrapeJobs.$inferSelect;
export type NewScrapeJob = typeof scrapeJobs.$inferInsert;
