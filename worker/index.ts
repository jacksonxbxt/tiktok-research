import cron from "node-cron";

// Dynamically import to avoid build-time issues
async function runCronJob() {
  console.log(`[${new Date().toISOString()}] Starting daily cron job...`);

  try {
    const { runDailyCron } = await import("../src/lib/cron-tasks");
    const results = await runDailyCron();
    console.log(`[${new Date().toISOString()}] Cron job completed:`, results);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Cron job failed:`, error);
  }
}

// Schedule: 8 AM UTC daily
cron.schedule("0 8 * * *", runCronJob, {
  timezone: "UTC"
});

console.log("TikTok Research Worker started");
console.log("Scheduled tasks:");
console.log("  - Daily scrape: 0 8 * * * (8 AM UTC)");

// Keep process alive
process.on("SIGINT", () => {
  console.log("Worker shutting down...");
  process.exit(0);
});

// Run immediately on start for testing (optional - remove in production)
if (process.env.RUN_ON_START === "true") {
  console.log("RUN_ON_START enabled, running cron job immediately...");
  runCronJob();
}
