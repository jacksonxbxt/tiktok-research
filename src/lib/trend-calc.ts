import type { HashtagSnapshot } from "./db/schema";

export interface TrendVelocity {
  hashtag: string;
  currentCount: number;
  previousCount: number;
  absoluteGrowth: number;
  percentageGrowth: number;
  velocity: number; // Rate of change (higher = faster growing)
  trend: "rising" | "stable" | "declining";
  isBreakout: boolean; // True if growth > 50% in short period
}

export interface TrendAnalysis {
  trends: TrendVelocity[];
  topRising: TrendVelocity[];
  breakouts: TrendVelocity[];
  declining: TrendVelocity[];
}

/**
 * Calculate velocity for a single hashtag based on snapshots
 */
export function calculateVelocity(
  hashtag: string,
  snapshots: HashtagSnapshot[]
): TrendVelocity | null {
  if (snapshots.length < 2) {
    return null;
  }

  // Sort by date (newest first)
  const sorted = [...snapshots].sort(
    (a, b) =>
      new Date(b.snapshotAt!).getTime() - new Date(a.snapshotAt!).getTime()
  );

  const current = sorted[0];
  const previous = sorted[1];

  const currentCount = current.videoCount || 0;
  const previousCount = previous.videoCount || 0;

  const absoluteGrowth = currentCount - previousCount;
  const percentageGrowth =
    previousCount > 0 ? ((currentCount - previousCount) / previousCount) * 100 : 0;

  // Calculate time difference in hours
  const timeDiffHours =
    (new Date(current.snapshotAt!).getTime() -
      new Date(previous.snapshotAt!).getTime()) /
    (1000 * 60 * 60);

  // Velocity = growth per hour (normalized)
  const velocity = timeDiffHours > 0 ? absoluteGrowth / timeDiffHours : 0;

  // Determine trend direction
  let trend: "rising" | "stable" | "declining";
  if (percentageGrowth > 5) {
    trend = "rising";
  } else if (percentageGrowth < -5) {
    trend = "declining";
  } else {
    trend = "stable";
  }

  // Breakout = more than 50% growth
  const isBreakout = percentageGrowth > 50;

  return {
    hashtag,
    currentCount,
    previousCount,
    absoluteGrowth,
    percentageGrowth,
    velocity,
    trend,
    isBreakout,
  };
}

/**
 * Analyze multiple hashtags and return trend insights
 */
export function analyzeTrends(
  hashtagSnapshots: Map<string, HashtagSnapshot[]>
): TrendAnalysis {
  const trends: TrendVelocity[] = [];

  for (const [hashtag, snapshots] of hashtagSnapshots) {
    const velocity = calculateVelocity(hashtag, snapshots);
    if (velocity) {
      trends.push(velocity);
    }
  }

  // Sort by velocity (highest first)
  const sortedByVelocity = [...trends].sort((a, b) => b.velocity - a.velocity);

  // Get top rising trends
  const topRising = sortedByVelocity
    .filter((t) => t.trend === "rising")
    .slice(0, 10);

  // Get breakout trends
  const breakouts = trends.filter((t) => t.isBreakout);

  // Get declining trends
  const declining = sortedByVelocity
    .filter((t) => t.trend === "declining")
    .slice(0, 5);

  return {
    trends: sortedByVelocity,
    topRising,
    breakouts,
    declining,
  };
}

/**
 * Calculate moving average for smoother trend analysis
 */
export function calculateMovingAverage(
  values: number[],
  window: number = 3
): number[] {
  const result: number[] = [];

  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - window + 1);
    const end = i + 1;
    const windowValues = values.slice(start, end);
    const avg = windowValues.reduce((a, b) => a + b, 0) / windowValues.length;
    result.push(avg);
  }

  return result;
}

/**
 * Predict future trend direction based on historical data
 */
export function predictTrend(
  snapshots: HashtagSnapshot[],
  daysAhead: number = 7
): {
  predictedCount: number;
  confidence: number;
  direction: "up" | "down" | "flat";
} {
  if (snapshots.length < 3) {
    return {
      predictedCount: snapshots[0]?.videoCount || 0,
      confidence: 0,
      direction: "flat",
    };
  }

  // Simple linear regression
  const counts = snapshots.map((s) => s.videoCount || 0);
  const n = counts.length;

  // Calculate slope
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += counts[i];
    sumXY += i * counts[i];
    sumX2 += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Predict future value
  const predictedCount = Math.max(0, intercept + slope * (n + daysAhead));

  // Calculate R-squared for confidence
  const yMean = sumY / n;
  let ssTot = 0,
    ssRes = 0;
  for (let i = 0; i < n; i++) {
    const predicted = intercept + slope * i;
    ssTot += Math.pow(counts[i] - yMean, 2);
    ssRes += Math.pow(counts[i] - predicted, 2);
  }
  const rSquared = 1 - ssRes / ssTot;
  const confidence = Math.max(0, Math.min(1, rSquared));

  // Determine direction
  let direction: "up" | "down" | "flat";
  if (slope > 0.1) {
    direction = "up";
  } else if (slope < -0.1) {
    direction = "down";
  } else {
    direction = "flat";
  }

  return {
    predictedCount: Math.round(predictedCount),
    confidence,
    direction,
  };
}

/**
 * Detect seasonal patterns in hashtag usage
 */
export function detectSeasonality(snapshots: HashtagSnapshot[]): {
  hasWeeklyPattern: boolean;
  peakDays: number[]; // 0 = Sunday, 6 = Saturday
  lowDays: number[];
} {
  if (snapshots.length < 14) {
    return {
      hasWeeklyPattern: false,
      peakDays: [],
      lowDays: [],
    };
  }

  // Group by day of week
  const byDayOfWeek: number[][] = [[], [], [], [], [], [], []];

  for (const snapshot of snapshots) {
    const dayOfWeek = new Date(snapshot.snapshotAt!).getDay();
    byDayOfWeek[dayOfWeek].push(snapshot.videoCount || 0);
  }

  // Calculate average for each day
  const avgByDay = byDayOfWeek.map((counts) =>
    counts.length > 0 ? counts.reduce((a, b) => a + b, 0) / counts.length : 0
  );

  const overallAvg = avgByDay.reduce((a, b) => a + b, 0) / 7;

  // Find peak and low days (>20% deviation from average)
  const peakDays: number[] = [];
  const lowDays: number[] = [];

  avgByDay.forEach((avg, day) => {
    const deviation = (avg - overallAvg) / overallAvg;
    if (deviation > 0.2) {
      peakDays.push(day);
    } else if (deviation < -0.2) {
      lowDays.push(day);
    }
  });

  const hasWeeklyPattern = peakDays.length > 0 || lowDays.length > 0;

  return {
    hasWeeklyPattern,
    peakDays,
    lowDays,
  };
}

/**
 * Format trend data for display
 */
export function formatTrendForDisplay(trend: TrendVelocity): {
  growthLabel: string;
  velocityLabel: string;
  trendEmoji: string;
} {
  const growthLabel =
    trend.percentageGrowth >= 0
      ? `+${trend.percentageGrowth.toFixed(1)}%`
      : `${trend.percentageGrowth.toFixed(1)}%`;

  const velocityLabel = `${trend.velocity.toFixed(0)}/hr`;

  let trendEmoji: string;
  if (trend.isBreakout) {
    trendEmoji = "🚀";
  } else if (trend.trend === "rising") {
    trendEmoji = "📈";
  } else if (trend.trend === "declining") {
    trendEmoji = "📉";
  } else {
    trendEmoji = "➡️";
  }

  return {
    growthLabel,
    velocityLabel,
    trendEmoji,
  };
}
