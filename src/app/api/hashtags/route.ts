import { NextRequest, NextResponse } from "next/server";
import { db, trackedHashtags, hashtagSnapshots } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

const createHashtagSchema = z.object({
  hashtag: z.string().min(1),
  category: z.string().optional(),
});

// GET all tracked hashtags with latest snapshots
export async function GET() {
  try {
    const hashtags = await db.select().from(trackedHashtags);

    // Get latest snapshot for each hashtag
    const hashtagsWithSnapshots = await Promise.all(
      hashtags.map(async (hashtag) => {
        const [latestSnapshot] = await db
          .select()
          .from(hashtagSnapshots)
          .where(eq(hashtagSnapshots.hashtagId, hashtag.id))
          .orderBy(desc(hashtagSnapshots.snapshotAt))
          .limit(1);

        // Get previous snapshot for growth calculation
        const snapshots = await db
          .select()
          .from(hashtagSnapshots)
          .where(eq(hashtagSnapshots.hashtagId, hashtag.id))
          .orderBy(desc(hashtagSnapshots.snapshotAt))
          .limit(2);

        let growth = 0;
        if (snapshots.length >= 2) {
          const current = snapshots[0].videoCount || 0;
          const previous = snapshots[1].videoCount || 0;
          if (previous > 0) {
            growth = ((current - previous) / previous) * 100;
          }
        }

        return {
          ...hashtag,
          latestSnapshot,
          growth,
        };
      })
    );

    return NextResponse.json(hashtagsWithSnapshots);
  } catch (error) {
    console.error("Error fetching hashtags:", error);
    return NextResponse.json(
      { error: "Failed to fetch hashtags" },
      { status: 500 }
    );
  }
}

// POST create new tracked hashtag
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createHashtagSchema.parse(body);

    const cleanHashtag = validated.hashtag.replace("#", "").toLowerCase();

    const [newHashtag] = await db
      .insert(trackedHashtags)
      .values({
        hashtag: cleanHashtag,
        category: validated.category,
      })
      .returning();

    return NextResponse.json(newHashtag, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating hashtag:", error);
    return NextResponse.json(
      { error: "Failed to create hashtag" },
      { status: 500 }
    );
  }
}

// DELETE hashtag
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Hashtag ID required" },
        { status: 400 }
      );
    }

    // Delete snapshots first
    await db
      .delete(hashtagSnapshots)
      .where(eq(hashtagSnapshots.hashtagId, parseInt(id)));

    // Delete hashtag
    await db
      .delete(trackedHashtags)
      .where(eq(trackedHashtags.id, parseInt(id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting hashtag:", error);
    return NextResponse.json(
      { error: "Failed to delete hashtag" },
      { status: 500 }
    );
  }
}

// PATCH update hashtag (toggle active status)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Hashtag ID required" },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(trackedHashtags)
      .set({ isActive })
      .where(eq(trackedHashtags.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating hashtag:", error);
    return NextResponse.json(
      { error: "Failed to update hashtag" },
      { status: 500 }
    );
  }
}
