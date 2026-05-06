import { signOut } from "aws-amplify/auth";
import { useToast } from "@/hooks/use-toast";
import { LogOut, RefreshCw, Key } from "lucide-react";

// Logo import
import pharmaPilotLogo from "@/assets/pharma-pilot-logo-clean.png";

const DashboardHeader = () => {
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.reload(); // Reload to show login screen
    } catch (err) {
      console.error("Logout error:", err);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
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
