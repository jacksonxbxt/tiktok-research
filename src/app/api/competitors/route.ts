import { NextRequest, NextResponse } from "next/server";
import { db, competitors } from "@/lib/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const createCompetitorSchema = z.object({
  name: z.string().min(1),
  tiktokHandle: z.string().min(1),
  category: z.string().optional(),
  notes: z.string().optional(),
  scrapeFrequency: z.enum(["daily", "weekly", "manual"]).optional(),
});

// GET all competitors
export async function GET() {
  try {
    const allCompetitors = await db.select().from(competitors);
    return NextResponse.json(allCompetitors);
  } catch (error) {
    console.error("Error fetching competitors:", error);
    return NextResponse.json(
      { error: "Failed to fetch competitors" },
      { status: 500 }
    );
  }
}

// POST create new competitor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createCompetitorSchema.parse(body);

    const [newCompetitor] = await db
      .insert(competitors)
      .values({
        name: validated.name,
        tiktokHandle: validated.tiktokHandle.replace("@", ""),
        category: validated.category,
        notes: validated.notes,
        scrapeFrequency: validated.scrapeFrequency || "daily",
      })
      .returning();

    return NextResponse.json(newCompetitor, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating competitor:", error);
    return NextResponse.json(
      { error: "Failed to create competitor" },
      { status: 500 }
    );
  }
}

// DELETE competitor
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Competitor ID required" },
        { status: 400 }
      );
    }

    await db.delete(competitors).where(eq(competitors.id, parseInt(id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting competitor:", error);
    return NextResponse.json(
      { error: "Failed to delete competitor" },
      { status: 500 }
    );
  }
}
