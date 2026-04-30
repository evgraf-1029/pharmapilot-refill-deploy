import { RefillStatus } from "@/types/refill";
import { Badge } from "@/components/ui/badge";

const statusConfig: Record<RefillStatus, { className: string; label: string }> = {
  pending:    { label: "Pending",     className: "border-[hsl(var(--status-pending))] text-[hsl(var(--status-pending))] bg-[hsl(var(--status-pending))]/10" },
  processing: { label: "In Progress", className: "border-secondary text-secondary bg-secondary/10" },
  ready:      { label: "Ready",       className: "border-accent text-accent bg-accent/10" },
  completed:  { label: "Completed",   className: "border-accent text-accent bg-accent/10" },
  cancelled:  { label: "Cancelled",   className: "border-primary text-primary bg-primary/10" },
};

interface StatusBadgeProps {
  status: RefillStatus;
  createdAt?: string;
}

const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const getPendingStatusClass = (createdAt: string): string => {
  const recordDate = new Date(createdAt);
  const today = new Date();
  if (isSameDay(recordDate, today)) {
    // Today's records — yellow
    return "border-[hsl(var(--status-pending-today))] text-[hsl(var(--status-pending-today))] bg-[hsl(var(--status-pending-today))]/10";
  } else if (recordDate < today) {
    // Older records — orange
    return "border-[hsl(var(--status-pending-old))] text-[hsl(var(--status-pending-old))] bg-[hsl(var(--status-pending-old))]/10";
  }
  return statusConfig.pending.className;
};

const StatusBadge = ({ status, createdAt }: StatusBadgeProps) => {
  const config = statusConfig[status] ?? statusConfig.pending;
  let className = config.className;

  // Override for pending status based on date age
  if (status === "pending" && createdAt) {
    className = getPendingStatusClass(createdAt);
  }

  return (
    <Badge variant="outline" className={`font-medium ${className}`}>
      {config.label}
    </Badge>
  );
};

export default StatusBadge;
