"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  Bot,
  BookMarked,
  Settings,
  Hash,
  Zap,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Competitors", href: "/competitors", icon: Users },
  { name: "Trend Radar", href: "/trends", icon: TrendingUp },
  { name: "AI UGC Detector", href: "/ai-ugc", icon: Bot },
  { name: "Content Library", href: "/library", icon: BookMarked },
  { name: "Hashtags", href: "/hashtags", icon: Hash },
  { name: "Scrape Jobs", href: "/jobs", icon: Zap },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-zinc-950 text-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-zinc-800 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-purple-600">
          <span className="text-sm font-bold">TR</span>
        </div>
        <div>
          <h1 className="text-sm font-semibold">TikTok Research</h1>
          <p className="text-xs text-zinc-400">axent.store</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-zinc-800 p-4">
        <div className="rounded-lg bg-zinc-900 p-3">
          <p className="text-xs text-zinc-400">Apify Budget</p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-semibold">$42</span>
            <span className="text-xs text-zinc-500">/ $100</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400"
              style={{ width: "42%" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
