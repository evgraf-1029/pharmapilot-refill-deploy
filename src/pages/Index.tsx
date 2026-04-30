import { useState, useEffect, useCallback } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardStats from "@/components/DashboardStats";
import RefillTable from "@/components/RefillTable";
import { RefillRecord, RefillStatus } from "@/types/refill";
import { useToast } from "@/hooks/use-toast";

// ===================================================================
// API GATEWAY CONFIGURATION
// ===================================================================
const API_BASE_URL = "https://0nr1n0bwvc.execute-api.ca-central-1.amazonaws.com";
const PHARMACY_ID = "PHARMACY_001";
const POLL_INTERVAL_MS = 10000; // 10 seconds

const Index = () => {
  const [records, setRecords] = useState<RefillRecord[]>([]);
  const { toast } = useToast();

  // ====================== Fetch Records from API Gateway ======================
  const fetchRecords = useCallback(async () => {
    try {
      // No headers on GET — avoids CORS preflight issues
      const response = await fetch(
        `${API_BASE_URL}/refills?pharmacyId=${PHARMACY_ID}`
      );

      if (!response.ok) {
        console.error("Failed to fetch records:", response.status);
        return;
      }

      const data = await response.json();

      if (!data.success) {
        console.error("API error:", data.error);
        return;
      }

      const mapped: RefillRecord[] = (data.records || []).map((r: any) => ({
        id:             r.id,
        patientName:    r.patientName,
        phn:            r.phn,
        phoneNumber:    r.patientPhone,
        rxNum:          r.rxNum,
        medicationName: r.medicationName,
        rxQty:          r.rxQty,
        rxNote:         r.rxNote || "",
        status:         r.status as RefillStatus,
        createdAt:      r.createdAt,
        receivedAt:     r.receivedAt,   // Sort key — needed for status updates
        pharmacyId:     r.pharmacyId,
      }));

      setRecords(mapped);
    } catch (err) {
      console.error("Error fetching records:", err);
    }
  }, []);

  // ====================== Polling — fetch every 10 seconds ======================
  useEffect(() => {
    fetchRecords(); // Fetch immediately on load

    const interval = setInterval(() => {
      fetchRecords();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval); // Cleanup on unmount
  }, [fetchRecords]);

  // ====================== Update Status via API Gateway ======================
  const handleStatusChange = async (id: string, newStatus: RefillStatus) => {
    // Find the record to get its receivedAt (sort key — required by Lambda3)
    const record = records.find((r) => r.id === id);
    if (!record) {
      toast({ title: "Error", description: "Record not found.", variant: "destructive" });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/refills/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pharmacyId: record.pharmacyId || PHARMACY_ID,
          receivedAt: record.receivedAt,   // Sort key
          id:         record.id,
          status:     newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Unknown error");
      }

      // Optimistically update UI without waiting for next poll
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
        <DashboardStats records={records} />
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Refill Requests</h2>
            <span className="text-xs text-muted-foreground">
              {records.length} record{records.length !== 1 ? "s" : ""}
            </span>
          </div>
          <RefillTable records={records} onStatusChange={handleStatusChange} />
        </div>
      </main>
      <footer className="border-t border-border px-6 py-3 text-center text-xs text-muted-foreground">
        PharmaPilot · Medigroup Refill Dashboard · {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default Index;
