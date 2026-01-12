export async function register() {
  // Only run cron in production server environment
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const cron = await import("node-cron");

    console.log("[Worker] Starting cron scheduler...");

    // Schedule: 8 AM UTC daily
    cron.default.schedule("0 8 * * *", async () => {
      console.log(`[${new Date().toISOString()}] Running daily cron job...`);

      try {
        const { runDailyCron } = await import("./lib/cron-tasks");
        const results = await runDailyCron();
        console.log(`[${new Date().toISOString()}] Cron completed:`, results);
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Cron failed:`, error);
      }
    }, { timezone: "UTC" });

    console.log("[Worker] Scheduled: Daily scrape at 8 AM UTC");

    // Run immediately on start if enabled
    if (process.env.RUN_ON_START === "true") {
      console.log("[Worker] RUN_ON_START enabled, running now...");
      const { runDailyCron } = await import("./lib/cron-tasks");
      runDailyCron().then(r => console.log("[Worker] Initial run complete:", r));
    }
  }
}
