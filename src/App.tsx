import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import ChatPage from "./pages/ChatPage";
import Sources from "./pages/Sources";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import DashboardView from "./pages/DashboardView";
import DashboardList from '@/pages/DashboardList';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/sources" element={<Sources />} />
          <Route path="/dashboard" element={<Navigate to="/dashboards" replace />} />
          <Route path="/dashboards" element={<DashboardList />} />
          <Route path="/dashboard/new" element={<Dashboard />} />
          <Route path="/dashboard/:id" element={<DashboardView />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
