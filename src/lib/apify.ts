import { ApifyClient } from "apify-client";

// Initialize the Apify client
const client = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

// TikTok Scraper Actor ID (Clockworks TikTok Scraper)
const TIKTOK_SCRAPER_ACTOR_ID = "GdWCkxBtKWOsKjdch";

export interface TikTokVideo {
  id: string;
  text: string;
  createTime: number;
  authorMeta: {
    id: string;
    name: string;
    nickName: string;
    verified: boolean;
    signature: string;
    avatar: string;
    following: number;
    fans: number;
    heart: number;
    video: number;
  };
  musicMeta: {
    musicId: string;
    musicName: string;
    musicAuthor: string;
    musicOriginal: boolean;
    playUrl: string;
    coverLarge: string;
  };
  covers: {
    default: string;
    origin: string;
    dynamic: string;
  };
  webVideoUrl: string;
  videoUrl: string;
  videoMeta: {
    height: number;
    width: number;
    duration: number;
  };
  diggCount: number;
  shareCount: number;
  playCount: number;
  commentCount: number;
  collectCount: number;
  hashtags: Array<{
    id: string;
    name: string;
    title: string;
    cover: string;
  }>;
  mentions: string[];
  isAd: boolean;
  isPinned: boolean;
}

export interface TikTokProfile {
  id: string;
  uniqueId: string;
  nickname: string;
  signature: string;
  verified: boolean;
  avatar: string;
  following: number;
  fans: number;
  heart: number;
  video: number;
}

export interface ScrapeOptions {
  profiles?: string[];
  hashtags?: string[];
  searchQueries?: string[];
  urls?: string[];
  resultsPerPage?: number;
  maxItems?: number;
  shouldDownloadVideos?: boolean;
  shouldDownloadCovers?: boolean;
}

/**
 * Scrape TikTok data using the Apify TikTok Scraper
 */
export async function scrapeTikTok(options: ScrapeOptions): Promise<TikTokVideo[]> {
  const input: Record<string, unknown> = {
    resultsPerPage: options.resultsPerPage || 20,
    maxProfilesPerQuery: options.maxItems || 10,
    shouldDownloadVideos: options.shouldDownloadVideos || false,
    shouldDownloadCovers: options.shouldDownloadCovers || false,
  };

  if (options.profiles && options.profiles.length > 0) {
    input.profiles = options.profiles;
  }

  if (options.hashtags && options.hashtags.length > 0) {
    input.hashtags = options.hashtags;
  }

  if (options.searchQueries && options.searchQueries.length > 0) {
    input.searchQueries = options.searchQueries;
  }

  if (options.urls && options.urls.length > 0) {
    input.postURLs = options.urls;
  }

  const run = await client.actor(TIKTOK_SCRAPER_ACTOR_ID).call(input);

  const { items } = await client.dataset(run.defaultDatasetId).listItems();

  return items as unknown as TikTokVideo[];
}

/**
 * Scrape a specific TikTok profile
 */
export async function scrapeProfile(username: string, maxVideos = 20): Promise<TikTokVideo[]> {
  return scrapeTikTok({
    profiles: [username],
    resultsPerPage: maxVideos,
  });
}

/**
 * Scrape videos from a hashtag
 */
export async function scrapeHashtag(hashtag: string, maxVideos = 50): Promise<TikTokVideo[]> {
  // Remove # if present
  const cleanHashtag = hashtag.replace(/^#/, "");
  return scrapeTikTok({
    hashtags: [cleanHashtag],
    resultsPerPage: maxVideos,
  });
}

/**
 * Search TikTok for a query
 */
export async function searchTikTok(query: string, maxResults = 20): Promise<TikTokVideo[]> {
  return scrapeTikTok({
    searchQueries: [query],
    resultsPerPage: maxResults,
  });
}

/**
 * Get details for specific video URLs
 */
export async function getVideoDetails(urls: string[]): Promise<TikTokVideo[]> {
  return scrapeTikTok({
    urls,
  });
}

export { client };
