import { useState } from "react";
import { signOut } from "aws-amplify/auth";
import { useToast } from "@/hooks/use-toast";
import { LogOut, RefreshCw, Download } from "lucide-react";
import pharmaPilotLogo from "@/assets/pharma-pilot-logo-clean.png";

// API Gateway URL for the call log Excel generator
const CALL_LOG_API_URL = "https://hrcw9fqsa2.execute-api.ca-central-1.amazonaws.com/prod";

const DashboardHeader = () => {
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.reload();
    } catch (err) {
      console.error("Logout error:", err);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCallLogDownload = async () => {
    setDownloading(true);
    toast({
      title: "Generating report...",
      description: "Analyzing call logs with AI. This may take up to a minute.",
    });

    try {
      const response = await fetch(CALL_LOG_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();

      // Lambda returns body as a JSON string in some API Gateway configs
      const body = typeof data.body === 'string' ? JSON.parse(data.body) : data;

      const downloadUrl = body.download_url || data.download_url;

      if (!downloadUrl) {
        throw new Error('No download URL returned from server');
      }

      // Open the presigned S3 URL to trigger download
      window.open(downloadUrl, '_blank');

      toast({
        title: "Report ready!",
        description: `${body.total_rows || ''} call records exported. Download starting...`,
      });

    } catch (err) {
      console.error("Download error:", err);
      toast({
        title: "Error",
        description: "Failed to generate call log report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">

        {/* Logo + Title */}
        <div className="flex items-center gap-3">
          <img
            src={pharmaPilotLogo}
            alt="PharmaPilot"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h1 className="text-base font-bold text-foreground leading-tight">PharmaPilot</h1>
            <p className="text-xs text-muted-foreground leading-tight">Medigroup Refill Dashboard</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCallLogDownload}
            disabled={downloading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-border
                       hover:bg-muted transition-colors text-muted-foreground hover:text-foreground
                       disabled:opacity-50 disabled:cursor-not-allowed"
            title="Generate and download call log report as Excel"
          >
            <Download size={14} />
            {downloading ? "Generating..." : "Call Log Download"}
          </button>

          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-border
                       hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title="Refresh dashboard"
          >
            <RefreshCw size={14} />
            Refresh
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-destructive/30
                       text-destructive hover:bg-destructive/10 transition-colors"
            title="Log out"
          >
            <LogOut size={14} />
            Log Out
          </button>
        </div>

      </div>
    </header>
  );
};

export default DashboardHeader;
