import { NextResponse } from "next/server";
import { runDailyCron } from "@/lib/cron-tasks";

// This route can be called manually or by external cron services
export async function GET() {
  try {
    const results = await runDailyCron();

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Daily cron error:", error);
    return NextResponse.json(
      { error: "Cron job failed", message: String(error) },
      { status: 500 }
    );
  }
}
