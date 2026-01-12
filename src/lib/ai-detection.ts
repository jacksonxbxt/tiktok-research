export interface AIDetectionResult {
  score: number; // 0-1 confidence that this is AI-generated UGC
  signals: string[];
  explanation: string;
}

// Minimal video data needed for AI detection
export interface VideoForAnalysis {
  description?: string | null;
  hashtags?: string[] | null;
  audioName?: string | null;
  audioOriginal?: boolean | null;
  authorFollowers?: number | null;
  plays?: number | null;
  likes?: number | null;
  duration?: number | null;
  isAd?: boolean | null;
}

/**
 * Common patterns found in AI-generated UGC videos
 */
const AI_UGC_PATTERNS = {
  // Text patterns that suggest scripted/AI content
  scriptPatterns: [
    /i just discovered/i,
    /you need to try/i,
    /this changed my life/i,
    /i can't believe/i,
    /obsessed with/i,
    /game changer/i,
    /holy grail/i,
    /must have/i,
    /run don't walk/i,
    /you're welcome/i,
    /not sponsored/i,
    /link in bio/i,
  ],

  // Hashtags commonly used by AI UGC campaigns
  suspiciousHashtags: [
    "tiktokmademebuyit",
    "amazonfind",
    "amazonfinds",
    "amazonmusthaves",
    "viralproduct",
    "viralproducts",
    "ugc",
    "ugccreator",
    "contentcreator",
    "ad",
    "sponsored",
    "gifted",
    "collab",
  ],

  // Audio patterns (trending sounds often used by UGC campaigns)
  suspiciousAudioPatterns: [
    /original sound/i, // Often AI voices or TTS
    /suno\.ai/i,
  ],
};

/**
 * Analyze a single video for AI UGC signals
 */
export function analyzeVideo(video: VideoForAnalysis): AIDetectionResult {
  const signals: string[] = [];
  let score = 0;

  const description = video.description?.toLowerCase() || "";
  const hashtags = (video.hashtags || []).map((h) =>
    typeof h === "string" ? h.toLowerCase() : ""
  );

  // Check for script patterns in description
  for (const pattern of AI_UGC_PATTERNS.scriptPatterns) {
    if (pattern.test(description)) {
      signals.push(`Script pattern: "${pattern.source}"`);
      score += 0.1;
    }
  }

  // Check for suspicious hashtags
  const matchedHashtags = hashtags.filter((h) =>
    AI_UGC_PATTERNS.suspiciousHashtags.includes(h.replace("#", ""))
  );
  if (matchedHashtags.length > 0) {
    signals.push(`Suspicious hashtags: ${matchedHashtags.join(", ")}`);
    score += 0.1 * matchedHashtags.length;
  }

  // Check audio
  const audioName = video.audioName?.toLowerCase() || "";
  for (const pattern of AI_UGC_PATTERNS.suspiciousAudioPatterns) {
    if (pattern.test(audioName)) {
      signals.push(`Suspicious audio: "${audioName}"`);
      score += 0.15;
    }
  }

  // Account age vs volume ratio
  // New accounts with high volume are suspicious
  if (video.authorFollowers) {
    const followersPerVideo =
      video.authorFollowers / Math.max(1, video.plays || 1);
    if (followersPerVideo < 0.01) {
      signals.push("Low follower to play ratio (potential bought views)");
      score += 0.1;
    }
  }

  // Very short videos (under 15 seconds) are often UGC ads
  if (video.duration && video.duration < 15) {
    signals.push("Very short video duration (<15s)");
    score += 0.05;
  }

  // Check if explicitly marked as ad
  if (video.isAd) {
    signals.push("Marked as advertisement");
    score += 0.3;
  }

  // High engagement but new account
  if (
    video.likes &&
    video.likes > 10000 &&
    video.authorFollowers &&
    video.authorFollowers < 1000
  ) {
    signals.push("High engagement with low follower account");
    score += 0.15;
  }

  // Normalize score to 0-1 range
  score = Math.min(1, score);

  // Generate explanation
  let explanation = "";
  if (score >= 0.7) {
    explanation = "High likelihood of AI-generated or scripted UGC content";
  } else if (score >= 0.4) {
    explanation = "Moderate signals of potential UGC campaign content";
  } else if (score >= 0.2) {
    explanation = "Some minor signals detected, but likely organic";
  } else {
    explanation = "Appears to be organic user content";
  }

  return {
    score,
    signals,
    explanation,
  };
}

/**
 * Analyze multiple videos and find patterns across them
 */
export function analyzeVideoSet(videos: VideoForAnalysis[]): {
  averageScore: number;
  highScoreVideos: Array<{ video: VideoForAnalysis; result: AIDetectionResult }>;
  commonSignals: Array<{ signal: string; count: number }>;
} {
  const results = videos.map((video) => ({
    video,
    result: analyzeVideo(video),
  }));

  // Calculate average score
  const averageScore =
    results.reduce((sum, r) => sum + r.result.score, 0) / results.length;

  // Get high score videos (>= 0.5)
  const highScoreVideos = results.filter((r) => r.result.score >= 0.5);

  // Count common signals
  const signalCounts = new Map<string, number>();
  for (const r of results) {
    for (const signal of r.result.signals) {
      signalCounts.set(signal, (signalCounts.get(signal) || 0) + 1);
    }
  }

  const commonSignals = Array.from(signalCounts.entries())
    .map(([signal, count]) => ({ signal, count }))
    .sort((a, b) => b.count - a.count);

  return {
    averageScore,
    highScoreVideos,
    commonSignals,
  };
}

/**
 * Detect visual consistency across videos (for same-brand UGC detection)
 * This is a placeholder - would need image analysis API for real implementation
 */
export function detectVisualPatterns(videos: VideoForAnalysis[]): {
  hasConsistentBackground: boolean;
  hasConsistentLighting: boolean;
  confidence: number;
} {
  // Placeholder - in production, you'd analyze video covers/frames
  // using a vision API to detect:
  // - Same background across "different" creators
  // - Consistent lighting setups
  // - Similar framing/composition

  return {
    hasConsistentBackground: false,
    hasConsistentLighting: false,
    confidence: 0,
  };
}

/**
 * Categorize a video based on its AI UGC score
 */
export function categorizeVideo(
  score: number
): "organic" | "suspicious" | "likely-ai" | "definite-ai" {
  if (score >= 0.8) return "definite-ai";
  if (score >= 0.5) return "likely-ai";
  if (score >= 0.25) return "suspicious";
  return "organic";
}
