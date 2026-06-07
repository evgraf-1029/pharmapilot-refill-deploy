import { useState, useEffect, useCallback } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardStats from "@/components/DashboardStats";
import RefillTable from "@/components/RefillTable";
import { RefillRecord, RefillStatus } from "@/types/refill";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";

// ===================================================================
// API GATEWAY CONFIGURATION
// ===================================================================
const API_BASE_URL = "https://0nr1n0bwvc.execute-api.ca-central-1.amazonaws.com";
const PHARMACY_ID  = "PHARMACY_001";
const POLL_INTERVAL_MS = 10000;
const PAGE_SIZE = 100;

const Index = () => {
  const [records,     setRecords]     = useState<RefillRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  // ====================== Fetch Records ======================
  const fetchRecords = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/refills?pharmacyId=${PHARMACY_ID}`
      );
      if (!response.ok) { console.error("Failed to fetch:", response.status); return; }

      const data = await response.json();
      if (!data.success) { console.error("API error:", data.error); return; }

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
        receivedAt:     r.receivedAt,
        pharmacyId:     r.pharmacyId,
      }));

      setRecords(mapped);
    } catch (err) {
      console.error("Error fetching records:", err);
    }
  }, []);

  // ====================== Polling ======================
  useEffect(() => {
    fetchRecords();
    const interval = setInterval(fetchRecords, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchRecords]);

  // ====================== Update Status ======================
  const handleStatusChange = async (id: string, newStatus: RefillStatus) => {
    const record = records.find((r) => r.id === id);
    if (!record) {
      toast({ title: "Error", description: "Record not found.", variant: "destructive" });
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/refills/status`, {
        method:  "POST",
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

  // ====================== Update Note ======================
  const handleNoteChange = async (id: string, newNote: string) => {
    const record = records.find((r) => r.id === id);
    if (!record) {
      toast({ title: "Error", description: "Record not found.", variant: "destructive" });
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/refills/note`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pharmacyId: record.pharmacyId || PHARMACY_ID,
          receivedAt: record.receivedAt,
          id:         record.id,
          rxNote:     newNote,
        }),
      });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.error || "Unknown error");

      // Optimistic update
      setRecords((prev) =>
        prev.map((r) => (r.id === id ? { ...r, rxNote: newNote } : r))
      );

      toast({ title: "Note saved", description: "Your note has been saved." });
    } catch (err) {
      console.error("Error updating note:", err);
      toast({
        title: "Error",
        description: "Failed to save note. Please try again.",
        variant: "destructive",
      });
    }
  };

  // ====================== Pagination ======================
  const totalPages  = Math.max(1, Math.ceil(records.length / PAGE_SIZE));
  const safePage    = Math.min(currentPage, totalPages);
  const pageRecords = records.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const goToPage = (page: number) =>
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex flex-col">
      <DashboardHeader />
      <main className="flex-1 p-6 space-y-6 max-w-[1600px] mx-auto w-full">
        <DashboardStats records={records} />
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Refill Requests</h2>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                {records.length} record{records.length !== 1 ? "s" : ""}
                {totalPages > 1 && ` · Page ${safePage} of ${totalPages}`}
              </span>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => goToPage(safePage - 1)}
                    disabled={safePage === 1}
                    className="p-1 rounded border border-border hover:bg-muted
                               disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Previous page"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-2 py-0.5 rounded text-xs border transition-colors ${
                        page === safePage
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => goToPage(safePage + 1)}
                    disabled={safePage === totalPages}
                    className="p-1 rounded border border-border hover:bg-muted
                               disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Next page"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
          <RefillTable
            records={pageRecords}
            onStatusChange={handleStatusChange}
            onNoteChange={handleNoteChange}
          />
        </div>
      </main>
      <footer className="border-t border-border px-6 py-3 text-center text-xs text-muted-foreground">
        PharmaPilot · Medigroup Refill Dashboard · {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default Index;
