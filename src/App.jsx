import React from 'react';
import { Routes, Route } from "react-router-dom";
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
import Sources from '@/pages/Sources';
import InsuranceDashboardList from '@/pages/InsuranceDashboardList';
import InsuranceDashboardView from '@/pages/InsuranceDashboardView';
import InsuranceChatPage from '@/pages/InsuranceChatPage';
import IndiaMapDemo from '@/pages/IndiaMapDemo';
import InsurancePage from "@/pages/InsurancePage";
import MiningPage from "@/pages/MiningPage";
import MiningChatPage from "@/pages/MiningChatPage";
import MiningSources from "@/pages/MiningSources";
import RewardsApp from '@/modules/rewards/App';
import MiningDashboardList from '@/pages/MiningDashboardList';
import MiningDashboardView from '@/pages/MiningDashboardView';
import MiningTraining from '@/pages/MiningTraining';
import AnalyticsPage from '@/pages/AnalyticsPage';
import MessageHistoryPage from '@/pages/MessageHistoryPage';
import PPTGeneratorPage from '@/pages/PPTGeneratorPage';
import PDFManagerPage from '@/pages/PDFManagerPage';
import { MainLayout } from '@/components/MainLayout';

// Connector Routes
import ConnectorGallery from '@/pages/ConnectorGallery';
import ConnectorSetup from '@/pages/ConnectorSetup';
import ConnectorDashboard from '@/pages/ConnectorDashboard';
import ConnectorDetail from '@/pages/ConnectorDetail';
import ConnectorCallback from '@/pages/ConnectorCallback';
import SyncHistory from '@/pages/SyncHistory';

function App() {
  return (
    <TooltipProvider>
      <Routes>
        {/* Main Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/analytics" element={<MainLayout><AnalyticsPage /></MainLayout>} />
        <Route path="/message-history" element={<MainLayout><MessageHistoryPage /></MainLayout>} />
        <Route path="/ppt-generator" element={<PPTGeneratorPage />} />
        <Route path="/pdf-manager" element={<MainLayout><PDFManagerPage /></MainLayout>} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/marketing" element={<MarketingChatPage />} />
        <Route path="/chat/insurance" element={<InsuranceChatPage />} />

        {/* Marketing Routes */}
        <Route path="/marketing" element={<MarketingPage />} />
        <Route path="/marketing/sources" element={<MarketingSourcesPage />} />
        <Route path="/marketing/dashboard" element={<MarketingDashboardPage />} />
        <Route path="/marketing/dashboard/:id" element={<MarketingDashboardView />} />
        
        {/* Insurance Routes */}
        <Route path="/insurance" element={<InsurancePage />} />
        <Route path="/insurance/dashboard" element={<InsuranceDashboardList />} />
        <Route path="/insurance/dashboard/:id" element={<InsuranceDashboardView />} />
        <Route path="/insurance/sources" element={<Sources />} />

        {/* Mining Routes */}
        <Route path="/mining" element={<MiningPage />} />
        <Route path="/chat/mining" element={<MiningChatPage />} />
        <Route path="/mining/training" element={<MiningTraining />} />
        <Route path="/mining/dashboard" element={<MiningDashboardList />} />
        <Route path="/mining/dashboard/:id" element={<MiningDashboardView />} />
        <Route path="/mining/sources" element={<MiningSources />} />

        {/* Connector Routes */}
        <Route path="/connectors" element={<ConnectorGallery />} />
        <Route path="/connectors/setup/:id" element={<ConnectorSetup />} />
        <Route path="/connectors/callback" element={<ConnectorCallback />} />
        <Route path="/connectors/dashboard" element={<ConnectorDashboard />} />
        <Route path="/connectors/:id" element={<ConnectorDetail />} />
        <Route path="/connectors/:id/sync-history" element={<SyncHistory />} />

        {/* Rewards Routes */}
        <Route path="/rewards" element={<RewardsApp />} />
        
        {/* Other Routes */}
        <Route path="/sources" element={<Sources />} />
        <Route path="/training" element={<Training />} />
        <Route path="/dashboard" element={<DashboardList />} />
        <Route path="/dashboard/:id" element={<DashboardView />} />
        <Route path="/india-map" element={<IndiaMapDemo />} />
      </Routes>
      <Toaster />
      <Sonner />
    </TooltipProvider>
  );
}

export default App; 