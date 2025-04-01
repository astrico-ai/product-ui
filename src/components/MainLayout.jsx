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
  ChevronLeft
} from "lucide-react";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: MessageSquare, label: "Chat", path: "/chat" },
  { icon: Users2, label: "Sources", path: "/sources" },
  { icon: GraduationCap, label: "Training", path: "/training" },
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
];

export function MainLayout({ children }) {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(true);

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
              const isActive = location.pathname === item.path;
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
        <header className="h-16 bg-white border-b px-8 flex items-center justify-between fixed top-0 right-0 left-[72px] z-40 transition-all duration-300">
          <h1 className="text-lg font-medium text-gray-900">Good evening, Sanuj</h1>
          <div className="flex items-center gap-2">
            <button className="p-2 text-[#3551F3] hover:bg-[#EEF2FF] rounded-lg">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 text-[#3551F3] hover:bg-[#EEF2FF] rounded-lg">
              <MessageSquare className="w-5 h-5" />
            </button>
            <div className="h-8 w-[1px] bg-gray-200 mx-2" />
            <button className="w-8 h-8 rounded-full bg-[#3551F3] text-white flex items-center justify-center font-medium">
              S
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