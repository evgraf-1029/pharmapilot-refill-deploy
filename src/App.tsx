import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getCurrentUser, signOut } from "aws-amplify/auth";
import { Amplify } from "aws-amplify";
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import NotFound from "./pages/NotFound.tsx";

// Configure Amplify with Cognito
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
    }
  }
});

const queryClient = new QueryClient();

const AuthGate = () => {
  const [session, setSession] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      await getCurrentUser();
      setSession("authenticated");
    } catch {
      setSession("unauthenticated");
    }
  };

  if (session === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (session === "unauthenticated") {
    return <Login onLogin={() => setSession("authenticated")} />;
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/safetydrugs" replace />} />
      <Route path="/safetydrugs" element={<Index />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthGate />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
