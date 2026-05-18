import { useState, useEffect, useCallback } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import CallBackTable from "@/components/CallBackTable";
import { CallBackRecord, CallBackStatus } from "@/types/callback";
import { useToast } from "@/hooks/use-toast";
import { Phone, Clock, CheckCircle, XCircle, PhoneCall } from "lucide-react";

// ===================================================================
// API CONFIGURATION
// ===================================================================
const CALLBACK_API_BASE = "https://3f6cuskbu4.execute-api.ca-central-1.amazonaws.com/prod";
const PHARMACY_ID = "SAFETYDRUGS_138";
const POLL_INTERVAL_MS = 10000;

// ===================================================================
// STATS CARD
// ===================================================================
interface StatsProps {
  records: CallBackRecord[];
}

const CallBackStats = ({ records }: StatsProps) => {
  const total     = records.length;
  const pending   = records.filter((r) => r.status === "pending").length;
  const called    = records.filter((r) => r.status === "called").length;
  const completed = records.filter((r) => r.status === "completed").length;
  const cancelled = records.filter((r) => r.status === "cancelled").length;

  const stats = [
    { label: "Total",     value: total,     icon: Phone,        bg: "bg-blue-50 dark:bg-blue-950/30",   color: "text-blue-500" },
    { label: "Pending",   value: pending,   icon: Clock,        bg: "bg-yellow-50 dark:bg-yellow-950/30", color: "text-yellow-500" },
    { label: "Called",    value: called,    icon: PhoneCall,    bg: "bg-orange-50 dark:bg-orange-950/30", color: "text-orange-500" },
    { label: "Completed", value: completed, icon: CheckCircle,  bg: "bg-green-50 dark:bg-green-950/30",  color: "text-green-500" },
    { label: "Cancelled", value: cancelled, icon: XCircle,      bg: "bg-red-50 dark:bg-red-950/30",     color: "text-red-500" },
  ];

  return (
    <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
      {stats.map(({ label, value, icon: Icon, bg, color }) => (
        <div key={label} className="rounded-xl border border-border bg-card p-3 flex items-center gap-3 shadow-sm">
          <div className={`rounded-lg p-2 shrink-0 ${bg}`}>
            <Icon size={18} className={color} />
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

// ===================================================================
// MAIN PAGE
// ===================================================================
const CallBackDash = () => {
  const [records, setRecords] = useState<CallBackRecord[]>([]);
  const { toast } = useToast();

  const fetchRecords = useCallback(async () => {
    try {
      const response = await fetch(
        `${CALLBACK_API_BASE}/callbacks?pharmacyId=${PHARMACY_ID}`
      );
      if (!response.ok) {
        console.error("Failed to fetch callbacks:", response.status);
        return;
      }
      const data = await response.json();
      const items = Array.isArray(data) ? data : (data.records || []);

      const mapped: CallBackRecord[] = items.map((r: any) => ({
        id:                r.id,
        patientName:       r.patientName,
        phn:               r.phn || "",
        phoneNumber:       r.patientPhone || "",
        rxNum:             r.rxNum || "",
        medicationName:    r.medicationName || "",
        timeToCallBack:    r.timeToCallBack || "",
        rxNote:            r.rxNote || "",
        status:            r.status as CallBackStatus,
        receivedAt:        r.receivedAt,
        receivedAtDisplay: r.receivedAtDisplay || r.receivedAt,
        pharmacyId:        r.pharmacyId,
      }));

      // Sort newest first
      mapped.sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
      setRecords(mapped);
    } catch (err) {
      console.error("Error fetching callbacks:", err);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
    const interval = setInterval(fetchRecords, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchRecords]);

  const handleStatusChange = async (id: string, newStatus: CallBackStatus) => {
    const record = records.find((r) => r.id === id);
    if (!record) {
      toast({ title: "Error", description: "Record not found.", variant: "destructive" });
      return;
    }

    try {
      const response = await fetch(`${CALLBACK_API_BASE}/callbacks/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pharmacyId: record.pharmacyId || PHARMACY_ID,
          receivedAt: record.receivedAt,
          id:         record.id,
          status:     newStatus,
        }),
      });

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      const data = await response.json();
      if (!data.success) throw new Error(data.error || "Unknown error");

      // Optimistic update
      setRecords((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      console.error("Error updating status:", err);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex flex-col">
      <DashboardHeader />
      <main className="flex-1 p-6 space-y-6 max-w-[1600px] mx-auto w-full">
        <CallBackStats records={records} />
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Callback Requests</h2>
            <span className="text-xs text-muted-foreground">
              {records.length} record{records.length !== 1 ? "s" : ""}
            </span>
          </div>
          <CallBackTable records={records} onStatusChange={handleStatusChange} />
        </div>
      </main>
      <footer className="border-t border-border px-6 py-3 text-center text-xs text-muted-foreground">
        PharmaPilot · Medigroup Callback Dashboard · {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default CallBackDash;
