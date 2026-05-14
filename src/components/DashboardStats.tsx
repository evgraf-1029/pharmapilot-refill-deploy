import { RefillRecord } from "@/types/refill";
import { ClipboardList, Clock, CheckCircle, XCircle } from "lucide-react";

interface DashboardStatsProps {
  records: RefillRecord[];
}

const DashboardStats = ({ records }: DashboardStatsProps) => {
  // Derive all counts directly from the live records array
  const total     = records.length;
  const pending   = records.filter((r) => r.status === "pending").length;
  const completed = records.filter((r) => r.status === "completed").length;
  const cancelled = records.filter((r) => r.status === "cancelled").length;

  const stats = [
    {
      label: "Total Requests",
      value: total,
      icon: ClipboardList,
      iconClass: "text-blue-500",
      bgClass: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      label: "Pending",
      value: pending,
      icon: Clock,
      iconClass: "text-yellow-500",
      bgClass: "bg-yellow-50 dark:bg-yellow-950/30",
    },
    {
      label: "Completed",
      value: completed,
      icon: CheckCircle,
      iconClass: "text-green-500",
      bgClass: "bg-green-50 dark:bg-green-950/30",
    },
    {
      label: "Cancelled",
      value: cancelled,
      icon: XCircle,
      iconClass: "text-red-500",
      bgClass: "bg-red-50 dark:bg-red-950/30",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map(({ label, value, icon: Icon, iconClass, bgClass }) => (
        <div
          key={label}
          className="rounded-xl border border-border bg-card p-4 flex items-center gap-4 shadow-sm"
        >
          <div className={`rounded-lg p-2.5 ${bgClass}`}>
            <Icon size={22} className={iconClass} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
