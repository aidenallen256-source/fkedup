import { Card } from "@/components/ui/card";
import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: ReactNode;
  iconBgColor: string;
  iconColor: string;
}

export default function StatsCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon,
  iconBgColor,
  iconColor,
}: StatsCardProps) {
  const changeColorClass = {
    positive: "text-green-600",
    negative: "text-red-600",
    neutral: "text-muted-foreground",
  }[changeType];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground" data-testid={`text-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {value}
          </p>
        </div>
        <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center`}>
          <div className={iconColor}>{icon}</div>
        </div>
      </div>
      {change && (
        <div className="mt-4 flex items-center text-sm">
          <span className={changeColorClass}>{change}</span>
        </div>
      )}
    </Card>
  );
}
