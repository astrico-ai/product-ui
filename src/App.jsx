import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

// Page imports
import Index from '@/pages/Index';
import ChatPage from '@/pages/ChatPage';
import MarketingPage from '@/pages/IciciPage';
import MarketingChatPage from '@/pages/MarketingChatPage';
import MarketingSourcesPage from '@/pages/MarketingSourcesPage';
import MarketingDashboardPage from '@/pages/MarketingDashboardPage';
import MarketingDashboardView from '@/pages/MarketingDashboardView';
import DashboardList from '@/pages/DashboardList';
import DashboardView from '@/pages/DashboardView';
import Training from '@/pages/Training';

// Import other pages as needed
import { MainLayout } from '@/components/MainLayout';

// Placeholder components for pages that don't exist yet
const Sources = () => (
  <MainLayout>
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-4">Sources</h1>
      <p>Sources page content will go here.</p>
    </div>
  </MainLayout>
);

function App() {
  return (
    <TooltipProvider>
      <Routes>
        <Route path="" element={<Index />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="chat/marketing" element={<MarketingChatPage />} />
        <Route path="marketing" element={<MarketingPage />} />
        <Route path="marketing/sources" element={<MarketingSourcesPage />} />
        <Route path="marketing/dashboard" element={<MarketingDashboardPage />} />
        <Route path="marketing/dashboard/:id" element={<MarketingDashboardView />} />
        <Route path="sources" element={<Sources />} />
        <Route path="training" element={<Training />} />
        <Route path="dashboard" element={<DashboardList />} />
        <Route path="dashboard/:id" element={<DashboardView />} />
      </Routes>
      <Toaster />
      <Sonner />
    </TooltipProvider>
  );
}

export default App; 