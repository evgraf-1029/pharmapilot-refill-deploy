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
import { User, Hash, Phone, Pill, Package, FileText, Activity, Calendar, Check, X } from "lucide-react";

const STATUSES: RefillStatus[] = ["pending", "processing", "ready", "completed", "cancelled"];

const STATUS_LABELS: Record<RefillStatus, string> = {
  pending:    "Pending",
  processing: "In Progress",
  ready:      "Ready",
  completed:  "Completed",
  cancelled:  "Cancelled",
};

const columnDefs = [
  { label: "Patient's Name", icon: User },
  { label: "PHN",            icon: Hash },
  { label: "Phone Number",   icon: Phone },
  { label: "RX",             icon: Hash },
  { label: "Medication",     icon: Pill },
  { label: "QTY",            icon: Package },
  { label: "Notes",          icon: FileText },
  { label: "Status",         icon: Activity },
  { label: "Received At",    icon: Calendar },
];

interface RefillTableProps {
  records:        RefillRecord[];
  onStatusChange: (id: string, status: RefillStatus) => void;
  onNoteChange:   (id: string, note: string) => void;
}

const RefillTable = ({ records, onStatusChange, onNoteChange }: RefillTableProps) => {
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
  const [editingNoteId,   setEditingNoteId]   = useState<string | null>(null);
  const [noteValue,       setNoteValue]       = useState<string>('');

  const startEditNote = (id: string, currentNote: string) => {
    setEditingNoteId(id);
    setNoteValue(currentNote || '');
  };

  const saveNote = (id: string) => {
    onNoteChange(id, noteValue);
    setEditingNoteId(null);
  };

  const cancelNote = () => {
    setEditingNoteId(null);
    setNoteValue('');
  };

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
                <TableCell colSpan={9} className="px-4 py-12 text-center text-muted-foreground">
                  No refill requests yet. Waiting for AI agent submissions…
                </TableCell>
              </TableRow>
            )}
            {records.map((record) => (
              <TableRow key={record.id} className="table-row-hover border-b border-border/30">

                {/* Patient Name */}
                <TableCell className="font-medium px-4 py-3.5">
                  <ExpandableCell>{record.patientName}</ExpandableCell>
                </TableCell>

                {/* PHN */}
                <TableCell className="px-4 py-3.5">
                  <ExpandableCell className="font-mono text-sm text-secondary font-semibold">
                    {record.phn}
                  </ExpandableCell>
                </TableCell>

                {/* Phone */}
                <TableCell className="px-4 py-3.5">
                  <ExpandableCell className="text-muted-foreground tabular-nums">
                    {record.phoneNumber}
                  </ExpandableCell>
                </TableCell>

                {/* RX */}
                <TableCell className="px-4 py-3.5">
                  <ExpandableCell className="font-mono text-sm text-secondary font-semibold">
                    {record.rxNum}
                  </ExpandableCell>
                </TableCell>

                {/* Medication */}
                <TableCell className="px-4 py-3.5">
                  <ExpandableCell className="font-medium">{record.medicationName}</ExpandableCell>
                </TableCell>

                {/* QTY */}
                <TableCell className="px-4 py-3.5 text-center">
                  <ExpandableCell className="tabular-nums">{record.rxQty}</ExpandableCell>
                </TableCell>

                {/* Notes — editable */}
                <TableCell className="px-4 py-3.5 min-w-[180px] max-w-[240px]">
                  {editingNoteId === record.id ? (
                    <div className="flex flex-col gap-1.5">
                      <textarea
                        className="w-full text-xs border border-border rounded px-2 py-1
                                   bg-background text-foreground resize-none focus:outline-none
                                   focus:ring-1 focus:ring-primary"
                        rows={3}
                        value={noteValue}
                        onChange={(e) => setNoteValue(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            saveNote(record.id);
                          }
                          if (e.key === 'Escape') cancelNote();
                        }}
                      />
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => saveNote(record.id)}
                          className="flex items-center gap-0.5 px-2 py-0.5 text-xs rounded
                                     bg-primary text-primary-foreground hover:bg-primary/90"
                          title="Save (Enter)"
                        >
                          <Check size={11} /> Save
                        </button>
                        <button
                          onClick={cancelNote}
                          className="flex items-center gap-0.5 px-2 py-0.5 text-xs rounded
                                     border border-border hover:bg-muted text-muted-foreground"
                          title="Cancel (Esc)"
                        >
                          <X size={11} /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => startEditNote(record.id, record.rxNote)}
                      className="cursor-pointer min-h-[28px] px-1.5 py-1 rounded
                                 hover:bg-muted transition-colors text-xs text-muted-foreground
                                 group relative"
                      title="Click to edit note"
                    >
                      {record.rxNote ? (
                        <span className="text-foreground">{record.rxNote}</span>
                      ) : (
                        <span className="text-muted-foreground/40 italic">Add note…</span>
                      )}
                    </div>
                  )}
                </TableCell>

                {/* Status */}
                <TableCell className="px-4 py-3.5">
                  {editingStatusId === record.id ? (
                    <Select
                      defaultValue={record.status}
                      onValueChange={(val) => {
                        onStatusChange(record.id, val as RefillStatus);
                        setEditingStatusId(null);
                      }}
                    >
                      <SelectTrigger className="h-7 w-[130px] text-xs">
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
                      onClick={() => setEditingStatusId(record.id)}
                      className="cursor-pointer"
                      title="Click to change status"
                    >
                      <StatusBadge status={record.status} createdAt={record.createdAt} />
                    </button>
                  )}
                </TableCell>

                {/* Received At */}
                <TableCell className="px-4 py-3.5 text-sm text-muted-foreground whitespace-nowrap">
                  {new Date(record.createdAt).toLocaleTimeString([], {
                    hour: 'numeric', minute: '2-digit'
                  })}
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
