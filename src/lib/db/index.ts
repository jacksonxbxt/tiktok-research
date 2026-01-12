import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Lazy initialization to avoid build-time errors
let sql: ReturnType<typeof postgres> | null = null;
let database: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getConnectionString(): string {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  return connectionString;
}

function getSql() {
  if (!sql) {
    const connectionString = getConnectionString();
    // Render always requires SSL for external connections
    const isExternalConnection = connectionString.includes('render.com');
    sql = postgres(connectionString, {
      prepare: false,
      ssl: isExternalConnection || process.env.NODE_ENV === "production" ? "require" : false
    });
  }
  return sql;
}

// Create the database connection (lazy)
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_, prop) {
    if (!database) {
      database = drizzle(getSql(), { schema });
    }
    return (database as unknown as Record<string | symbol, unknown>)[prop];
  }
});

// Export schema for convenience
export * from "./schema";
