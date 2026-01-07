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

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const showHeader = location.pathname !== "/login" && 
                    location.pathname !== "/profile-setup" && 
                    location.pathname !== "/ai-verification";

  return (
    <SessionContextProvider>
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        {showHeader && <Header />}
        {/* Conditionally render Header */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/chat/:chatId" element={<ChatPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/ai-verification" element={<AIVerificationPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </SessionContextProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
        {/* Wrap AppContent with BrowserRouter */}
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;