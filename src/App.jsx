import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

// Page imports
import Index from '@/pages/Index';
import ChatPage from '@/pages/ChatPage';
import DashboardList from '@/pages/DashboardList';
import DashboardView from '@/pages/DashboardView';

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

const Training = () => (
  <MainLayout>
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-4">Training</h1>
      <p>Training page content will go here.</p>
    </div>
  </MainLayout>
);

function App() {
  return (
    <TooltipProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/sources" element={<Sources />} />
        <Route path="/training" element={<Training />} />
        <Route path="/dashboard" element={<DashboardList />} />
        <Route path="/dashboard/:id" element={<DashboardView />} />
      </Routes>
      <Toaster />
      <Sonner />
    </TooltipProvider>
  );
}

export default App; 