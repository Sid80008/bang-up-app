import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MatchesPage from "./pages/MatchesPage";
import Header from "./components/Header";
import ChatPage from "./pages/ChatPage";
import Login from "./pages/Login";
import { SessionContextProvider } from "./components/SessionContextProvider";
import ProfileSetup from "./pages/ProfileSetup";
import AIVerificationPage from "./pages/AIVerificationPage";
import { ErrorBoundary } from "react-error-boundary";
import { useEffect } from "react";

const queryClient = new QueryClient();

// Simple error fallback component
function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  useEffect(() => {
    // Log error to console for debugging
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-destructive mb-4">Something went wrong</h2>
        <p className="text-muted-foreground mb-6">
          We're sorry, but something unexpected happened. Please try refreshing the page.
        </p>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

const AppContent = () => {
  const location = useLocation();
  const showHeader = location.pathname !== "/login" && 
                    location.pathname !== "/profile-setup" && 
                    location.pathname !== "/ai-verification";

  // Simple page view tracking
  useEffect(() => {
    // In a real app, you would integrate with analytics here
    console.log(`[Analytics] Page view: ${location.pathname}`);
  }, [location]);

  return (
    <SessionContextProvider>
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        {showHeader && <Header />}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/chat/:chatId" element={<ChatPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/ai-verification" element={<AIVerificationPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </SessionContextProvider>
  );
};

const AppWithProviders = () => (
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default AppWithProviders;