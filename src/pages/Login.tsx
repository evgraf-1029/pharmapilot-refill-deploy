import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, LogIn } from "lucide-react";
import pharmaLogo from "@/assets/pharma-pilot-logo-clean.png";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      // Accept either a full email address or a legacy username (which gets the @pharmapilot.local suffix)
      const trimmed = username.trim();
      const email = trimmed.includes("@") ? trimmed : `${trimmed}@pharmapilot.local`;

      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError("Invalid login or password");
      }
    } catch {
      setError("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-sm glass-surface rounded-2xl p-8 space-y-6">
        <div className="flex flex-col items-center gap-3">
          <img src={pharmaLogo} alt="PharmaPilot Logo" className="h-16 w-16 object-contain" />
          <div className="text-center">
            <h1 className="text-lg font-bold tracking-tight text-foreground font-display">
              PharmaPilot
            </h1>
            <p className="text-sm text-muted-foreground">
              Medigroup Refill Dashboard
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-user">Email or Username</Label>
            <Input
              id="login-user"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter email or username"
              disabled={loading}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              If you changed your email, keep using your current login until you confirm the email link.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-pass">Password</Label>
            <Input
              id="login-pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
