"use client";

import React, { useEffect, useState } from "react";
import { SidebarProvider, useSidebar } from "./sidebar-context";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";
import { Footer } from "./footer";
import { getCurrentUser } from "@/services/api-client";

function ShellContent({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar();
  const [hasUser, setHasUser] = useState(false);

  useEffect(() => {
    const check = () => {
      const u = getCurrentUser();
      setHasUser(!!u);
    };
    check();
    window.addEventListener("alumniconnect_auth_change", check);
    return () => window.removeEventListener("alumniconnect_auth_change", check);
  }, []);

  return (
    <div className="flex min-h-screen flex-col font-sans antialiased bg-slate-50/30">
      <Navbar />

      <div className="flex flex-1 relative">
        {hasUser && <Sidebar />}

        <main
          className={`flex-1 transition-all duration-300 ease-in-out ${
            hasUser && isOpen ? "lg:pl-72" : "pl-0"
          }`}
        >
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <ShellContent>{children}</ShellContent>
    </SidebarProvider>
  );
}
