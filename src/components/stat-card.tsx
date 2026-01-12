import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: LucideIcon;
  description?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  description,
}: StatCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-zinc-900">{value}</p>
          {change && (
            <p
              className={cn(
                "mt-1 text-sm",
                changeType === "positive" && "text-green-600",
                changeType === "negative" && "text-red-600",
                changeType === "neutral" && "text-zinc-500"
              )}
            >
              {change}
            </p>
          )}
          {description && (
            <p className="mt-1 text-xs text-zinc-400">{description}</p>
          )}
        </div>
        {Icon && (
          <div className="rounded-lg bg-zinc-100 p-2.5">
            <Icon className="h-5 w-5 text-zinc-600" />
          </div>
        )}
      </div>
    </Card>
  );
}
