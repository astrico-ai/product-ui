import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Search } from "lucide-react";

export default function Header() {
  return (
    <header className="flex h-16 items-center px-4 border-b">
      <div className="flex items-center gap-4 flex-1">
        <form className="flex-1 max-w-xs">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              className="w-full bg-white shadow-none appearance-none pl-8"
              placeholder="Search products..."
              type="search"
            />
          </div>
        </form>
      </div>
      <div className="flex items-center gap-4">
        <Button size="icon" variant="ghost">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Notifications</span>
        </Button>
        <Button>Connect Wallet</Button>
      </div>
    </header>
  );
} 