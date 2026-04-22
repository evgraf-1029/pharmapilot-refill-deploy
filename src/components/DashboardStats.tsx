import { RefillRecord } from "@/types/refill";
import { ClipboardList, Clock, CheckCircle, XCircle } from "lucide-react";

interface DashboardStatsProps {
  records: RefillRecord[];
}

const DashboardStats = ({ records }: DashboardStatsProps) => {
  const total = records.length;
  const pending = records.filter((r) => r.status === "Pending").length;
  const completed = records.filter((r) => r.status === "Completed").length;
  const cancelled = records.filter((r) => r.status === "Cancelled").length;

  const stats = [
    { label: "Total Requests", value: total, icon: ClipboardList, color: "secondary" },
    { label: "Pending", value: pending, icon: Clock, color: "pending" },
    { label: "Completed", value: completed, icon: CheckCircle, color: "accent" },
    { label: "Cancelled", value: cancelled, icon: XCircle, color: "primary" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="glass-card p-6 transition-all hover:scale-105"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-foreground">{stat.value}</h3>
            </div>
            <div className={`p-3 rounded-lg ${
              stat.color === "secondary" ? "bg-secondary/10" :
              stat.color === "pending" ? "bg-[hsl(var(--status-pending))]/10" :
              stat.color === "accent" ? "bg-accent/10" :
              "bg-primary/10"
            }`}>
              <stat.icon className={`w-6 h-6 ${
                stat.color === "secondary" ? "text-secondary" :
                stat.color === "pending" ? "text-[hsl(var(--status-pending))]" :
                stat.color === "accent" ? "text-accent" :
                "text-primary"
              }`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
