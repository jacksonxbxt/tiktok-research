import { NextRequest, NextResponse } from "next/server";
import { db, videos, savedContent } from "@/lib/db";
import { eq, desc, gte, and, sql } from "drizzle-orm";
import { z } from "zod";

// GET videos with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const competitorId = searchParams.get("competitorId");
    const minAiScore = searchParams.get("minAiScore");
    const minLikes = searchParams.get("minLikes");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = db.select().from(videos);

    const conditions = [];

    if (competitorId) {
      conditions.push(eq(videos.competitorId, parseInt(competitorId)));
    }

    if (minAiScore) {
      conditions.push(gte(videos.aiUgcScore, parseFloat(minAiScore)));
    }

    if (minLikes) {
      conditions.push(gte(videos.likes, parseInt(minLikes)));
    }

    const results = await db
      .select()
      .from(videos)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(videos.scrapedAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}

// POST save video to library
const saveVideoSchema = z.object({
  videoId: z.number(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  category: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = saveVideoSchema.parse(body);

    const [saved] = await db
      .insert(savedContent)
      .values({
        videoId: validated.videoId,
        tags: validated.tags || [],
        notes: validated.notes,
        category: validated.category,
      })
      .returning();

    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error saving video:", error);
    return NextResponse.json(
      { error: "Failed to save video" },
      { status: 500 }
    );
  }
}
