import { useState } from "react";
import { RefillRecord, RefillStatus } from "@/types/refill";
import StatusBadge from "./StatusBadge";
import ExpandableCell from "./ExpandableCell";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Hash, Phone, Pill, Package, FileText, Activity, Calendar } from "lucide-react";

const STATUSES: RefillStatus[] = ["Pending", "In Progress", "Completed", "Cancelled"];

const columnDefs = [
  { label: "Patient's Name", icon: User },
  { label: "PHN", icon: Hash },
  { label: "Phone Number", icon: Phone },
  { label: "RX", icon: Hash },
  { label: "Medication", icon: Pill },
  { label: "QTY", icon: Package },
  { label: "NOTE", icon: FileText },
  { label: "Status", icon: Activity },
  { label: "Received At", icon: Calendar },
];

interface RefillTableProps {
  records: RefillRecord[];
  onStatusChange: (id: string, status: RefillStatus) => void;
}

const RefillTable = ({ records, onStatusChange }: RefillTableProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/60 bg-muted/40 hover:bg-muted/40">
              {columnDefs.map(({ label, icon: Icon }) => (
                <TableHead key={label} className="font-semibold text-foreground text-xs uppercase tracking-wider py-3.5 px-4">
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
                <TableCell colSpan={9} className="px-4 py-12 text-center text-muted-foreground">
                  No refill requests yet. Waiting for AI agent submissions…
                </TableCell>
              </TableRow>
            )}
            {records.map((record) => (
              <TableRow key={record.id} className="table-row-hover border-b border-border/30">
                <TableCell className="font-medium px-4 py-3.5">
                  <ExpandableCell>{record.patientName}</ExpandableCell>
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <ExpandableCell className="font-mono text-sm text-secondary font-semibold">{record.phn}</ExpandableCell>
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <ExpandableCell className="text-muted-foreground tabular-nums">{record.phoneNumber}</ExpandableCell>
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <ExpandableCell className="font-mono text-sm text-secondary font-semibold">{record.rxNum}</ExpandableCell>
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <ExpandableCell className="font-medium">{record.medicationName}</ExpandableCell>
                </TableCell>
                <TableCell className="px-4 py-3.5 text-center">
                  <ExpandableCell className="tabular-nums">{record.rxQty}</ExpandableCell>
                </TableCell>
                <TableCell className="px-4 py-3.5 max-w-[200px]">
                  <ExpandableCell className="text-muted-foreground">{record.rxNote || <span className="text-muted-foreground/40">—</span>}</ExpandableCell>
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  {editingId === record.id ? (
                    <Select
                      defaultValue={record.status}
                      onValueChange={(val) => {
                        onStatusChange(record.id, val as RefillStatus);
                        setEditingId(null);
                      }}
                    >
                      <SelectTrigger className="h-7 w-[130px] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s} className="text-xs">
                            {s}
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
                      <StatusBadge status={record.status} createdAt={record.createdAt} />
                    </button>
                  )}
                </TableCell>
                <TableCell className="px-4 py-3.5 text-sm text-muted-foreground whitespace-nowrap">
                  {new Date(record.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default RefillTable;
