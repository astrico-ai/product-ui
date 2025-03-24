
import { Home, MessageSquare, BookOpen, BarChart2, FileText } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function Sidebar() {
  const location = useLocation();
  
  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Chat', href: '/chat', icon: MessageSquare },
    { name: 'AI Training', href: '/training', icon: BookOpen },
    { name: 'Dashboard', href: '/dashboard', icon: BarChart2 },
    { name: 'Sources', href: '/sources', icon: FileText },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 w-[70px] xl:w-[240px] bg-sidebar z-30 flex flex-col overflow-hidden transition-all duration-300">
      <div className="flex h-16 items-center justify-center xl:justify-start xl:px-6 border-b border-sidebar-border">
        <div className="hidden xl:flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold">S</span>
          </div>
          <span className="text-sidebar-foreground font-semibold">SleekSearch</span>
        </div>
        <div className="xl:hidden">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold">S</span>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 pt-5 px-2">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <Link 
                  to={item.href} 
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="hidden xl:block">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 hidden xl:block">
        <div className="rounded-lg bg-sidebar-accent p-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-medium">VP</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-sidebar-foreground">Vraj Patel</p>
              <p className="text-xs text-sidebar-foreground/70">Premium Plan</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
