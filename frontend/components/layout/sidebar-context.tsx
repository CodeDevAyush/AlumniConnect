"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface SidebarContextType {
  isOpen: boolean;
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    // Read saved preference or default to open on desktop
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("alumniconnect_sidebar_open");
      if (saved !== null) {
        setIsOpen(saved === "true");
      } else {
        // Default to open on screens wider than 1024px
        setIsOpen(window.innerWidth >= 1024);
      }
    }
  }, []);

  const toggleSidebar = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("alumniconnect_sidebar_open", String(next));
      }
      return next;
    });
  };

  const openSidebar = () => {
    setIsOpen(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("alumniconnect_sidebar_open", "true");
    }
  };

  const closeSidebar = () => {
    setIsOpen(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("alumniconnect_sidebar_open", "false");
    }
  };

  return (
    <SidebarContext.Provider value={{ isOpen, toggleSidebar, openSidebar, closeSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
