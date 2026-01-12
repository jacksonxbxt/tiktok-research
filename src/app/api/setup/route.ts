import { NextResponse } from "next/server";
import postgres from "postgres";

export async function GET() {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: "require" });

  try {
    // Create all tables
    await sql`
      CREATE TABLE IF NOT EXISTS competitors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        tiktok_handle VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        notes TEXT,
        is_active BOOLEAN DEFAULT true,
        scrape_frequency VARCHAR(50) DEFAULT 'daily',
        added_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS videos (
        id SERIAL PRIMARY KEY,
        tiktok_id VARCHAR(255) UNIQUE NOT NULL,
        competitor_id INTEGER REFERENCES competitors(id),
        author_handle VARCHAR(255),
        author_name VARCHAR(255),
        author_avatar TEXT,
        author_followers INTEGER,
        author_verified BOOLEAN,
        description TEXT,
        hashtags TEXT[],
        mentions TEXT[],
        likes INTEGER DEFAULT 0,
        comments INTEGER DEFAULT 0,
        shares INTEGER DEFAULT 0,
        plays INTEGER DEFAULT 0,
        saves INTEGER DEFAULT 0,
        audio_name VARCHAR(255),
        audio_author VARCHAR(255),
        audio_original BOOLEAN,
        duration INTEGER,
        video_url TEXT,
        cover_url TEXT,
        web_url TEXT,
        is_ad BOOLEAN DEFAULT false,
        is_pinned BOOLEAN DEFAULT false,
        ai_ugc_score REAL,
        ai_ugc_signals TEXT[],
        video_created_at TIMESTAMP,
        scraped_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS competitor_snapshots (
        id SERIAL PRIMARY KEY,
        competitor_id INTEGER REFERENCES competitors(id),
        followers INTEGER,
        following INTEGER,
        total_likes BIGINT,
        video_count INTEGER,
        avg_likes INTEGER,
        avg_comments INTEGER,
        avg_shares INTEGER,
        snapshot_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS tracked_hashtags (
        id SERIAL PRIMARY KEY,
        hashtag VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        is_active BOOLEAN DEFAULT true,
        added_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS hashtag_snapshots (
        id SERIAL PRIMARY KEY,
        hashtag_id INTEGER REFERENCES tracked_hashtags(id),
        video_count INTEGER,
        view_count BIGINT,
        snapshot_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS saved_content (
        id SERIAL PRIMARY KEY,
        video_id INTEGER REFERENCES videos(id),
        tags TEXT[],
        notes TEXT,
        category VARCHAR(100),
        saved_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS alert_settings (
        id SERIAL PRIMARY KEY,
        alert_type VARCHAR(100) NOT NULL,
        is_enabled BOOLEAN DEFAULT true,
        threshold INTEGER,
        email VARCHAR(255),
        frequency VARCHAR(50),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS scrape_jobs (
        id SERIAL PRIMARY KEY,
        job_type VARCHAR(100) NOT NULL,
        target VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        result JSONB,
        videos_collected INTEGER DEFAULT 0,
        error TEXT,
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql.end();

    return NextResponse.json({ success: true, message: "All tables created!" });
  } catch (error) {
    await sql.end();
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
