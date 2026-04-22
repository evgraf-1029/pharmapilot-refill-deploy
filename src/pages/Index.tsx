import { useState, useEffect } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardStats from "@/components/DashboardStats";
import RefillTable from "@/components/RefillTable";
import { RefillRecord, RefillStatus } from "@/types/refill";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [records, setRecords] = useState<RefillRecord[]>([]);
  const { toast } = useToast();

  const fetchRecords = async () => {
    const { data, error } = await supabase
      .from("refill_requests")
      .select("*")
      .order("received_at", { ascending: false });

    if (error) {
      console.error("Error fetching records:", error);
      return;
    }

    const mapped: RefillRecord[] = (data || []).map((r) => ({
      id: r.id,
      patientName: r.patient_name,
      phn: r.phn,
      phoneNumber: r.patient_phone,
      rxNum: r.rx_num,
      medicationName: r.medication_name,
      rxQty: r.rx_qty,
      rxNote: r.rx_note || "",
      status: r.status as RefillStatus,
      createdAt: r.received_at,
    }));

    setRecords(mapped);
  };

  useEffect(() => {
    fetchRecords();

    // Real-time subscription
    const channel = supabase
      .channel("refill_requests_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "refill_requests" },
        () => {
          fetchRecords();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleStatusChange = async (id: string, newStatus: RefillStatus) => {
    const { error } = await supabase
      .from("refill_requests")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
      return;
    }

    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
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
