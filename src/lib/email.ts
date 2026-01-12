import { Resend } from "resend";
import type { Video, Competitor } from "./db/schema";
import type { TrendAnalysis, TrendVelocity } from "./trend-calc";

// Lazy initialization to avoid build-time errors
let resend: Resend | null = null;

function getResend(): Resend {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

const FROM_EMAIL = "TikTok Research <alerts@axent.store>";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send an email using Resend
 */
async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/**
 * Send viral content alert
 */
export async function sendViralAlert(
  to: string,
  videos: Video[],
  threshold: number
): Promise<{ success: boolean; error?: string }> {
  const videoList = videos
    .map(
      (v) => `
      <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #eee; border-radius: 8px;">
        <p><strong>@${v.authorHandle}</strong></p>
        <p>${v.description?.slice(0, 100)}...</p>
        <p>❤️ ${v.likes?.toLocaleString()} likes | 💬 ${v.comments?.toLocaleString()} comments | 👁️ ${v.plays?.toLocaleString()} plays</p>
        <a href="${v.webUrl}" style="color: #0066cc;">View on TikTok →</a>
      </div>
    `
    )
    .join("");

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">🔥 Viral Content Alert</h1>
      <p>We detected ${videos.length} video(s) with over ${threshold.toLocaleString()} likes:</p>
      ${videoList}
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #666; font-size: 12px;">TikTok Research Suite for axent.store</p>
    </div>
  `;

  return sendEmail({
    to,
    subject: `🔥 ${videos.length} Viral Video(s) Detected`,
    html,
  });
}

/**
 * Send AI UGC detection alert
 */
export async function sendAIUgcAlert(
  to: string,
  videos: Array<{ video: Video; score: number; signals: string[] }>
): Promise<{ success: boolean; error?: string }> {
  const videoList = videos
    .map(
      ({ video, score, signals }) => `
      <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #eee; border-radius: 8px;">
        <p><strong>@${video.authorHandle}</strong> - Score: ${(score * 100).toFixed(0)}%</p>
        <p>${video.description?.slice(0, 100)}...</p>
        <p><strong>Signals:</strong></p>
        <ul>
          ${signals.map((s) => `<li>${s}</li>`).join("")}
        </ul>
        <a href="${video.webUrl}" style="color: #0066cc;">View on TikTok →</a>
      </div>
    `
    )
    .join("");

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">🤖 AI UGC Detected</h1>
      <p>We detected ${videos.length} video(s) with high AI UGC scores:</p>
      ${videoList}
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #666; font-size: 12px;">TikTok Research Suite for axent.store</p>
    </div>
  `;

  return sendEmail({
    to,
    subject: `🤖 ${videos.length} AI UGC Video(s) Detected`,
    html,
  });
}

/**
 * Send weekly trend digest
 */
export async function sendWeeklyTrendDigest(
  to: string,
  analysis: TrendAnalysis,
  competitors: Array<{ competitor: Competitor; growth: number }>
): Promise<{ success: boolean; error?: string }> {
  const topTrends = analysis.topRising
    .slice(0, 5)
    .map(
      (t) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">#${t.hashtag}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${t.currentCount.toLocaleString()}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; color: ${t.percentageGrowth > 0 ? "green" : "red"};">
          ${t.percentageGrowth > 0 ? "+" : ""}${t.percentageGrowth.toFixed(1)}%
        </td>
      </tr>
    `
    )
    .join("");

  const breakouts = analysis.breakouts
    .slice(0, 3)
    .map((t) => `<li>#${t.hashtag} (+${t.percentageGrowth.toFixed(0)}%)</li>`)
    .join("");

  const competitorList = competitors
    .slice(0, 5)
    .map(
      ({ competitor, growth }) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">@${competitor.tiktokHandle}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; color: ${growth > 0 ? "green" : "red"};">
          ${growth > 0 ? "+" : ""}${growth.toFixed(1)}%
        </td>
      </tr>
    `
    )
    .join("");

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">📊 Weekly TikTok Trend Digest</h1>

      <h2 style="color: #555; margin-top: 30px;">🔥 Top Rising Hashtags</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="background: #f5f5f5;">
          <th style="padding: 8px; text-align: left;">Hashtag</th>
          <th style="padding: 8px; text-align: left;">Videos</th>
          <th style="padding: 8px; text-align: left;">Growth</th>
        </tr>
        ${topTrends}
      </table>

      ${
        breakouts
          ? `
        <h2 style="color: #555; margin-top: 30px;">🚀 Breakout Trends</h2>
        <ul>${breakouts}</ul>
      `
          : ""
      }

      <h2 style="color: #555; margin-top: 30px;">👀 Competitor Growth</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="background: #f5f5f5;">
          <th style="padding: 8px; text-align: left;">Account</th>
          <th style="padding: 8px; text-align: left;">Follower Growth</th>
        </tr>
        ${competitorList}
      </table>

      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #666; font-size: 12px;">TikTok Research Suite for axent.store</p>
    </div>
  `;

  return sendEmail({
    to,
    subject: "📊 Weekly TikTok Trend Digest",
    html,
  });
}

/**
 * Send daily digest
 */
export async function sendDailyDigest(
  to: string,
  stats: {
    newVideos: number;
    viralVideos: number;
    aiUgcDetected: number;
    topContent: Video[];
  }
): Promise<{ success: boolean; error?: string }> {
  const topContentList = stats.topContent
    .slice(0, 3)
    .map(
      (v) => `
      <div style="margin-bottom: 15px; padding: 10px; background: #f9f9f9; border-radius: 6px;">
        <p><strong>@${v.authorHandle}</strong>: ${v.description?.slice(0, 80)}...</p>
        <p style="color: #666; font-size: 12px;">❤️ ${v.likes?.toLocaleString()}</p>
      </div>
    `
    )
    .join("");

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">📈 Daily Research Digest</h1>

      <div style="display: flex; gap: 20px; margin: 20px 0;">
        <div style="flex: 1; padding: 15px; background: #f5f5f5; border-radius: 8px; text-align: center;">
          <div style="font-size: 24px; font-weight: bold;">${stats.newVideos}</div>
          <div style="color: #666;">New Videos</div>
        </div>
        <div style="flex: 1; padding: 15px; background: #fff3cd; border-radius: 8px; text-align: center;">
          <div style="font-size: 24px; font-weight: bold;">${stats.viralVideos}</div>
          <div style="color: #666;">Viral</div>
        </div>
        <div style="flex: 1; padding: 15px; background: #d4edda; border-radius: 8px; text-align: center;">
          <div style="font-size: 24px; font-weight: bold;">${stats.aiUgcDetected}</div>
          <div style="color: #666;">AI UGC</div>
        </div>
      </div>

      <h2 style="color: #555;">🏆 Top Content Today</h2>
      ${topContentList}

      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #666; font-size: 12px;">TikTok Research Suite for axent.store</p>
    </div>
  `;

  return sendEmail({
    to,
    subject: `📈 Daily Digest: ${stats.newVideos} videos, ${stats.viralVideos} viral`,
    html,
  });
}
