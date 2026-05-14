import { RefillRecord } from "@/types/refill";
import { ClipboardList, Clock, Loader2, PackageCheck, CheckCircle, XCircle } from "lucide-react";

interface DashboardStatsProps {
  records: RefillRecord[];
}

const DashboardStats = ({ records }: DashboardStatsProps) => {
  const total      = records.length;
  const pending    = records.filter((r) => r.status === "pending").length;
  const inProgress = records.filter((r) => r.status === "processing").length;
  const ready      = records.filter((r) => r.status === "ready").length;
  const completed  = records.filter((r) => r.status === "completed").length;
  const cancelled  = records.filter((r) => r.status === "cancelled").length;

  const stats = [
    {
      label: "Total",
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
      label: "In Progress",
      value: inProgress,
      icon: Loader2,
      iconClass: "text-orange-500",
      bgClass: "bg-orange-50 dark:bg-orange-950/30",
    },
    {
      label: "Ready",
      value: ready,
      icon: PackageCheck,
      iconClass: "text-teal-500",
      bgClass: "bg-teal-50 dark:bg-teal-950/30",
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
    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
      {stats.map(({ label, value, icon: Icon, iconClass, bgClass }) => (
        <div
          key={label}
          className="rounded-xl border border-border bg-card p-3 flex items-center gap-3 shadow-sm"
        >
          <div className={`rounded-lg p-2 shrink-0 ${bgClass}`}>
            <Icon size={18} className={iconClass} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground truncate">{label}</p>
            <p className="text-xl font-bold text-foreground leading-tight">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
