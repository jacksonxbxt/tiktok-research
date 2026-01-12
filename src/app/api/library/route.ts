import { NextRequest, NextResponse } from "next/server";
import { db, savedContent, videos } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

// GET saved content with video details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "50");

    const baseQuery = db
      .select({
        saved: savedContent,
        video: videos,
      })
      .from(savedContent)
      .leftJoin(videos, eq(savedContent.videoId, videos.id));

    const results = category
      ? await baseQuery
          .where(eq(savedContent.category, category))
          .orderBy(desc(savedContent.savedAt))
          .limit(limit)
      : await baseQuery
          .orderBy(desc(savedContent.savedAt))
          .limit(limit);

    // Flatten the results
    const formatted = results.map((r) => ({
      ...r.saved,
      video: r.video,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching library:", error);
    return NextResponse.json(
      { error: "Failed to fetch library" },
      { status: 500 }
    );
  }
}

// PATCH update saved content
const updateSavedSchema = z.object({
  id: z.number(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  category: z.string().optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = updateSavedSchema.parse(body);

    const updateData: Record<string, unknown> = {};
    if (validated.tags !== undefined) updateData.tags = validated.tags;
    if (validated.notes !== undefined) updateData.notes = validated.notes;
    if (validated.category !== undefined) updateData.category = validated.category;

    const [updated] = await db
      .update(savedContent)
      .set(updateData)
      .where(eq(savedContent.id, validated.id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating saved content:", error);
    return NextResponse.json(
      { error: "Failed to update" },
      { status: 500 }
    );
  }
}

// DELETE remove from library
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID required" },
        { status: 400 }
      );
    }

    await db.delete(savedContent).where(eq(savedContent.id, parseInt(id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting from library:", error);
    return NextResponse.json(
      { error: "Failed to delete" },
      { status: 500 }
    );
  }
}
