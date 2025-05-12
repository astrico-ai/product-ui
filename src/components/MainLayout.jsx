import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  MessageSquare, 
  Users2, 
  GraduationCap, 
  LayoutDashboard, 
  Bell, 
  Settings, 
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  BarChart,
  LineChart,
  PieChart,
  TrendingUp,
  Mail,
  Trophy
} from "lucide-react";
import { cn } from "../lib/utils";

// Main nav items for the general application
const mainNavItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: MessageSquare, label: "Chat", path: "/chat" },
  { icon: GraduationCap, label: "Training", path: "/training" },
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Users2, label: "Sources", path: "/sources" },
  { icon: Trophy, label: "Rewards", path: "/rewards" },
];

const insightsSubNav = [
  { icon: BarChart, label: "Analytics", path: "/analytics" },
  { icon: MessageSquare, label: "Message History", path: "/message-history" },
];

// Marketing-specific nav items
const marketingNavItems = [
  { icon: Home, label: "Home", path: "/marketing" },
  { icon: MessageSquare, label: "Chat", path: "/chat/marketing" },
  { icon: LayoutDashboard, label: "Dashboard", path: "/marketing/dashboard" },
  { icon: Users2, label: "Sources", path: "/marketing/sources" },
];

// Insurance-specific nav items
const insuranceNavItems = [
  { icon: Home, label: "Home", path: "/insurance" },
  { icon: MessageSquare, label: "Chat", path: "/chat/insurance" },
  { icon: LayoutDashboard, label: "Dashboard", path: "/insurance/dashboard" },
  { icon: Users2, label: "Sources", path: "/insurance/sources" },
];

// Mining-specific nav items
const miningNavItems = [
  { icon: Home, label: "Home", path: "/mining" },
  { icon: MessageSquare, label: "Chat", path: "/chat/mining" },
  { icon: GraduationCap, label: "Training", path: "/mining/training" },
  { icon: LayoutDashboard, label: "Dashboard", path: "/mining/dashboard" },
  { icon: Users2, label: "Sources", path: "/mining/sources" },
];

export function MainLayout({ children }) {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [insightsOpen, setInsightsOpen] = useState(false);
  
  // Determine if we're in the marketing, insurance, or mining section
  const isMarketingSection = location.pathname.startsWith('/marketing') || 
                            (location.pathname.startsWith('/chat') && location.pathname.includes('marketing'));
  const isInsuranceSection = location.pathname.startsWith('/insurance') || 
                            (location.pathname.startsWith('/chat') && location.pathname.includes('insurance'));
  const isMiningSection = location.pathname.startsWith('/mining') || 
                         (location.pathname.startsWith('/chat') && location.pathname.includes('mining')) ||
                         location.pathname === '/mining';
  
  // Choose which nav items to display
  let navItems = mainNavItems;
  if (isMarketingSection) {
    navItems = marketingNavItems;
  } else if (isInsuranceSection) {
    navItems = insuranceNavItems;
  } else if (isMiningSection) {
    navItems = miningNavItems;
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex">
      {/* Sidebar */}
      <div 
        className={`${
          isCollapsed ? 'w-[72px]' : 'w-[280px]'
        } bg-gradient-to-b from-white to-[#F8FAFF] border-r border-[#E5E7EB]/50 backdrop-blur-sm flex flex-col py-6 transition-all duration-300 fixed h-screen z-50 shadow-[4px_0_24px_-8px_rgba(53,81,243,0.06)]`}
      >
        <div className="h-[48px] flex items-center justify-center">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-white/80 rounded-lg transition-all duration-300 hover:shadow-md hover:-translate-x-0.5"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-[#3551F3]" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-[#3551F3]" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1">
          <div className="px-3 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                             (item.path !== '/' && location.pathname.startsWith(`${item.path}/`) && 
                              !navItems.some(other => 
                                other !== item && 
                                other.path !== '/' && 
                                other.path.startsWith(item.path + '/') && 
                                location.pathname.startsWith(other.path)
                              ));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-[#3551F3] text-white shadow-md shadow-[#3551F3]/20'
                      : 'text-gray-500 hover:bg-white hover:text-[#3551F3] hover:shadow-sm'
                  }`}
                >
                  <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : ''}`} />
                  {!isCollapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </Link>
              );
            })}
            {/* Insights Dropdown */}
            <div className="relative">
              <button
                onClick={() => setInsightsOpen((open) => !open)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl w-full transition-all duration-300 ${
                  insightsSubNav.some(sub => location.pathname.startsWith(sub.path))
                    ? 'bg-[#3551F3] text-white shadow-md shadow-[#3551F3]/20'
                    : 'text-gray-500 hover:bg-white hover:text-[#3551F3] hover:shadow-sm'
                }`}
              >
                <BarChart className={`w-5 h-5 shrink-0 ${insightsSubNav.some(sub => location.pathname.startsWith(sub.path)) ? 'text-white' : ''}`} />
                {!isCollapsed && <span className="text-sm font-medium">Insights</span>}
                {!isCollapsed && (
                  <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${insightsOpen ? 'rotate-90' : ''}`} />
                )}
              </button>
              {/* Subnav */}
              {!isCollapsed && insightsOpen && (
                <div className="ml-8 mt-1 space-y-1">
                  {insightsSubNav.map((sub) => {
                    const isActive = location.pathname.startsWith(sub.path);
                    return (
                      <Link
                        key={sub.path}
                        to={sub.path}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                          isActive
                            ? 'bg-[#E0E7FF] text-[#3551F3] font-semibold'
                            : 'text-gray-500 hover:bg-gray-100 hover:text-[#3551F3]'
                        }`}
                      >
                        <sub.icon className="w-4 h-4" />
                        <span className="text-sm">{sub.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Bottom Icons */}
        <div className="px-3 mt-6">
          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-500 hover:bg-white hover:text-[#3551F3] rounded-xl transition-all duration-300 hover:shadow-sm">
              <Settings className="w-5 h-5 shrink-0" />
              {!isCollapsed && (
                <span className="text-sm font-medium">Settings</span>
              )}
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-500 hover:bg-white hover:text-[#3551F3] rounded-xl transition-all duration-300 hover:shadow-sm">
              <HelpCircle className="w-5 h-5 shrink-0" />
              {!isCollapsed && (
                <span className="text-sm font-medium">Help</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 ${isCollapsed ? 'ml-[72px]' : 'ml-[280px]'} transition-all duration-300`}>
        {/* Top Header */}
        <header className="h-16 bg-white border-b px-8 flex items-center justify-between fixed top-0 right-0 left-0 z-40 transition-all duration-300" style={{ left: isCollapsed ? '72px' : '280px' }}>
          <h1 className="text-lg font-medium text-gray-900">
            {isMarketingSection ? "Good afternoon, Vraj" : 
             isInsuranceSection ? "Good afternoon, Vraj" :
             isMiningSection ? "Good afternoon, Vraj" :
             "Good afternoon, Vraj"}
          </h1>
          <div className="flex items-center gap-2">
            <button className="p-2 text-[#3551F3] hover:bg-[#EEF2FF] rounded-lg relative">
              <Bell className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-[10px] font-medium text-white">1</span>
              </div>
            </button>
            <button className="p-2 text-[#3551F3] hover:bg-[#EEF2FF] rounded-lg">
              <MessageSquare className="w-5 h-5" />
            </button>
            <div className="h-8 w-[1px] bg-gray-200 mx-2" />
            <button className="w-8 h-8 rounded-full bg-[#3551F3] text-white flex items-center justify-center font-medium">
              {isMarketingSection ? "V" : 
               isInsuranceSection ? "S" :
               isMiningSection ? "R" :
               "A"}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="pt-16 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
} 