import { useState } from "react";
import { CallBackRecord, CallBackStatus } from "@/types/callback";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { User, Hash, Phone, Pill, Clock, FileText, Activity, Calendar } from "lucide-react";

const STATUSES: CallBackStatus[] = ["pending", "called", "completed", "cancelled"];

const STATUS_LABELS: Record<CallBackStatus, string> = {
  pending:   "Pending",
  called:    "Called",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_COLORS: Record<CallBackStatus, string> = {
  pending:   "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  called:    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const columnDefs = [
  { label: "Patient's Name", icon: User },
  { label: "PHN",            icon: Hash },
  { label: "Phone Number",   icon: Phone },
  { label: "RX",             icon: Hash },
  { label: "Medication",     icon: Pill },
  { label: "Call Back Time", icon: Clock },
  { label: "Note",           icon: FileText },
  { label: "Status",         icon: Activity },
  { label: "Received At",    icon: Calendar },
];

interface CallBackTableProps {
  records: CallBackRecord[];
  onStatusChange: (id: string, status: CallBackStatus) => void;
}

const CallBackTable = ({ records, onStatusChange }: CallBackTableProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/60 bg-muted/40 hover:bg-muted/40">
              {columnDefs.map(({ label, icon: Icon }) => (
                <TableHead
                  key={label}
                  className="font-semibold text-foreground text-xs uppercase tracking-wider py-3.5 px-4"
                >
                  <div className="flex items-center gap-1.5">
                    <Icon size={14} className="text-secondary" />
                    {label}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  No callback requests yet. Waiting for AI agent submissions…
                </TableCell>
              </TableRow>
            )}
            {records.map((record) => (
              <TableRow
                key={record.id}
                className="table-row-hover border-b border-border/30"
              >
                <TableCell className="font-medium px-4 py-3.5">
                  {record.patientName}
                </TableCell>
                <TableCell className="px-4 py-3.5 font-mono text-sm text-secondary font-semibold">
                  {record.phn || <span className="text-muted-foreground/40">—</span>}
                </TableCell>
                <TableCell className="px-4 py-3.5 text-muted-foreground tabular-nums">
                  {record.phoneNumber}
                </TableCell>
                <TableCell className="px-4 py-3.5 font-mono text-sm text-secondary font-semibold">
                  {record.rxNum || <span className="text-muted-foreground/40">—</span>}
                </TableCell>
                <TableCell className="px-4 py-3.5 font-medium">
                  {record.medicationName || <span className="text-muted-foreground/40">—</span>}
                </TableCell>
                <TableCell className="px-4 py-3.5 text-sm font-medium text-primary whitespace-nowrap">
                  {record.timeToCallBack || <span className="text-muted-foreground/40">—</span>}
                </TableCell>
                <TableCell className="px-4 py-3.5 max-w-[180px] text-muted-foreground text-sm">
                  {record.rxNote || <span className="text-muted-foreground/40">—</span>}
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  {editingId === record.id ? (
                    <Select
                      defaultValue={record.status}
                      onValueChange={(val) => {
                        onStatusChange(record.id, val as CallBackStatus);
                        setEditingId(null);
                      }}
                    >
                      <SelectTrigger className="h-7 w-[120px] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s} className="text-xs">
                            {STATUS_LABELS[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <button
                      onClick={() => setEditingId(record.id)}
                      className="cursor-pointer"
                      title="Click to change status"
                    >
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[record.status]}`}>
                        {STATUS_LABELS[record.status]}
                      </span>
                    </button>
                  )}
                </TableCell>
                <TableCell className="px-4 py-3.5 text-sm text-muted-foreground whitespace-nowrap">
                  {record.receivedAtDisplay || record.receivedAt}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CallBackTable;
