import { useState } from "react";
import { Download, KeyRound, Loader2, LogOut, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import pharmaLogo from "@/assets/pharma-pilot-logo-clean.png";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import ChangeCredentialsDialog from "@/components/ChangeCredentialsDialog";

const API_URL =
  "https://hrcw9fqsa2.execute-api.ca-central-1.amazonaws.com/prod/logs";

const DashboardHeader = () => {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [error, setError] = useState("");
  const [credentialsDialogOpen, setCredentialsDialogOpen] = useState(false);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [accountEmail, setAccountEmail] = useState("");
  const [accountPassword, setAccountPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountLoading, setAccountLoading] = useState(false);
  const { toast } = useToast();

  const handleAccountUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accountEmail.trim() && !accountPassword.trim()) {
      toast({
        title: "Error",
        description: "Please enter a new login or password",
        variant: "destructive",
      });
      return;
    }

    if (accountPassword.trim() && accountPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    if (accountPassword.trim() && accountPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setAccountLoading(true);

    try {
      const updates: { email?: string; password?: string } = {};
      if (accountEmail.trim()) updates.email = accountEmail.trim();
      if (accountPassword.trim()) updates.password = accountPassword;

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        toast({
          title: "Error",
          description: "Your session expired. Please sign in again.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-credentials`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(updates),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast({
          title: "Error",
          description: result.error || "Failed to update credentials.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Your credentials were updated and the new login is active immediately.",
        });
        setAccountEmail("");
        setAccountPassword("");
        setConfirmPassword("");
        setAccountDialogOpen(false);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong. Try again later.",
        variant: "destructive",
      });
      console.error(err);
    } finally {
      setAccountLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5 * 60 * 1000);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 200) {
        const data = await response.json();
        setDownloadUrl(data.download_url);
        setError("");
        toast({
          title: "Success",
          description: "Login successful. You can now download the file.",
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Invalid credentials. Please try again.");
        setUsername("");
        setPassword("");
      }
    } catch {
      setError("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setUsername("");
      setPassword("");
      setDownloadUrl("");
      setError("");
    }
  };

  return (
    <>
      <header className="glass-surface sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={pharmaLogo} alt="PharmaPilot Logo" className="h-10 w-10 object-contain" />
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground font-display">
              PharmaPilot
            </h1>
            <p className="text-sm text-muted-foreground">
              Medigroup Refill Dashboard
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="ml-4 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
            onClick={() => setOpen(true)}
          >
            <Download className="h-4 w-4 mr-1.5" />
            Call Log Download
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
            onClick={() => setAccountDialogOpen(true)}
          >
            <KeyRound className="h-4 w-4 mr-1.5" />
            Change Credentials
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={async () => {
              await supabase.auth.signOut();
            }}
          >
            <LogOut className="h-4 w-4 mr-1.5" />
            Log Out
          </Button>
        </div>
      </header>

      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Call Log Download</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="login-user">User Login</Label>
              <Input
                id="login-user"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-pass">User Password</Label>
              <Input
                id="login-pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Submit"
              )}
            </Button>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {downloadUrl && (
              <div className="space-y-3">
                <Button asChild className="w-full" variant="secondary">
                  <a href={downloadUrl} download>
                    <Download className="mr-2 h-4 w-4" />
                    Download Excel
                  </a>
                </Button>
                <Button
                  type="button"
                  className="w-full"
                  variant="outline"
                  onClick={() => setCredentialsDialogOpen(true)}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Change your Credentials
                </Button>
              </div>
            )}
          </form>
        </DialogContent>
      </Dialog>

      <ChangeCredentialsDialog
        open={credentialsDialogOpen}
        onOpenChange={setCredentialsDialogOpen}
      />

      <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Change Credentials</DialogTitle>
            <DialogDescription>
              Updates apply immediately. Use your new login on the next sign-in.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAccountUpdate} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="account-email">New Email</Label>
              <Input
                id="account-email"
                type="email"
                value={accountEmail}
                onChange={(e) => setAccountEmail(e.target.value)}
                placeholder="Leave blank to keep current email"
                disabled={accountLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-password">New Password</Label>
              <Input
                id="account-password"
                type="password"
                value={accountPassword}
                onChange={(e) => setAccountPassword(e.target.value)}
                placeholder="Leave blank to keep current"
                disabled={accountLoading}
              />
            </div>
            {accountPassword.trim() && (
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  disabled={accountLoading}
                />
              </div>
            )}
            <Button type="submit" className="w-full" disabled={accountLoading}>
              {accountLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Credentials"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DashboardHeader;
