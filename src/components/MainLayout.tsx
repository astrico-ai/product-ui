
import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface MainLayoutProps {
  children: ReactNode;
  userName: string;
  greeting?: string;
}

export function MainLayout({ children, userName, greeting }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 pl-[70px] xl:pl-[240px]">
        <Header userName={userName} greeting={greeting} />
        <main className="p-5 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
