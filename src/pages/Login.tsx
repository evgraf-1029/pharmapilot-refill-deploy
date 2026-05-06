import { useState } from "react";
import { signIn, confirmSignIn } from "aws-amplify/auth";

interface LoginProps {
  onLogin: () => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsNewPassword, setNeedsNewPassword] = useState(false);
  const [signInResult, setSignInResult] = useState<any>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn({ username, password });

      // Check if user needs to set a new password (first login)
      if (result.nextStep?.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED") {
        setSignInResult(result);
        setNeedsNewPassword(true);
        setLoading(false);
        return;
      }

      if (result.isSignedIn) {
        onLogin();
      }
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.name === "NotAuthorizedException") {
        setError("Incorrect username or password.");
      } else if (err.name === "UserNotFoundException") {
        setError("User not found.");
      } else if (err.name === "UserNotConfirmedException") {
        setError("Account not confirmed. Please contact your administrator.");
      } else {
        setError(err.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const result = await confirmSignIn({ challengeResponse: newPassword });
      if (result.isSignedIn) {
        onLogin();
      }
    } catch (err: any) {
      console.error("New password error:", err);
      setError(err.message || "Failed to set new password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-2xl shadow-lg border border-border">

        {/* Logo + Title */}
        <div className="flex flex-col items-center gap-3">
          <img
            src="/pharma-pilot-logo-clean.png"
            alt="PharmaPilot"
            className="w-16 h-16 rounded-full object-cover"
          />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">PharmaPilot</h1>
            <p className="text-sm text-muted-foreground">Medigroup Refill Dashboard</p>
          </div>
        </div>

        {!needsNewPassword ? (
          /* ===== NORMAL LOGIN FORM ===== */
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">
                Username or Email
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                autoComplete="username"
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background
                           text-foreground placeholder:text-muted-foreground
                           focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                           transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background
                           text-foreground placeholder:text-muted-foreground
                           focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                           transition-all"
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-primary text-primary-foreground
                         font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        ) : (
          /* ===== NEW PASSWORD FORM (first login) ===== */
          <form onSubmit={handleNewPassword} className="space-y-4">
            <div className="px-4 py-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-sm">
              Welcome! Please set a new password for your account.
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                autoComplete="new-password"
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background
                           text-foreground placeholder:text-muted-foreground
                           focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                           transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                autoComplete="new-password"
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background
                           text-foreground placeholder:text-muted-foreground
                           focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                           transition-all"
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-primary text-primary-foreground
                         font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {loading ? "Setting password..." : "Set Password & Sign In"}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-muted-foreground">
          PharmaPilot · Medigroup · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default Login;
