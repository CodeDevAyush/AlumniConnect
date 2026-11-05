"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Users,
  Compass,
  Briefcase,
  GraduationCap,
  LogIn,
  LogOut,
  ShieldCheck,
  MessageSquare,
  UserCheck,
  UserPlus,
  Inbox,
  Menu,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser, logout } from "@/services/api-client";
import { UserRole } from "@/types";
import { useSidebar } from "./sidebar-context";

export function Navbar() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string; role: UserRole; profile?: any } | null>(null);
  const { toggleSidebar, isOpen } = useSidebar();

  const checkAuth = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("alumniconnect_access_token") : null;
    if (token) {
      const currentUser = getCurrentUser();
      setUser(currentUser ?? { id: "user", email: "User", role: "STUDENT" as UserRole });
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    setMounted(true);
    checkAuth();

    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener("alumniconnect_auth_change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("alumniconnect_auth_change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const handleSignOut = () => {
    logout();
    setUser(null);
    router.push("/");
  };

  const isStudent = user?.role === "STUDENT";
  const isAlumni = user?.role === "ALUMNI";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8 gap-4">
        {/* Left: Hamburger Menu (for logged in) + Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {mounted && user && (
            <button
              type="button"
              onClick={toggleSidebar}
              title={isOpen ? "Collapse Sidebar" : "Open Navigation Sidebar"}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200/60 shadow-2xs"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="/alumni-connect-logo.png"
              alt="AlumniConnect"
              width={48}
              height={48}
              priority
              className="h-10 w-10 sm:h-11 sm:w-11 object-contain shrink-0"
            />
            <div className="flex flex-col shrink-0">
              <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg whitespace-nowrap">
                AlumniConnect
              </span>
              <span className="text-[10px] text-brand-orange font-semibold tracking-wider uppercase -mt-1 whitespace-nowrap">
                Campus Network
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Clean Status Indicator (NO scrollbar) */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 font-medium">
          {mounted && user ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] font-semibold text-slate-700">
                {isAlumni ? "Verified Alumni Mentor Hub" : "Verified Candidate Track • 80+ Access"}
              </span>
            </div>
          ) : (
            <span className="italic">
              Institutional verification & candidate evaluation platform
            </span>
          )}
        </div>

        {/* Right Auth Block: Clickable Profile opens LeetCode-style profile */}
        <div className="flex items-center gap-2 lg:gap-3 shrink-0">
          {mounted && user ? (
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/profile"
                title="View AlumniConnect Profile"
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 sm:px-3 py-1 text-xs shrink-0 hover:bg-blue-50/70 hover:border-blue-300 transition-all cursor-pointer group shadow-2xs"
              >
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full font-bold text-white uppercase text-[11px] shrink-0 ${
                    isAlumni ? "bg-purple-600" : "bg-blue-600"
                  }`}
                >
                  {user.profile?.firstName ? user.profile.firstName.charAt(0) : user.email.charAt(0)}
                </div>
                <div className="hidden sm:flex flex-col text-left shrink-0">
                  <span className="font-semibold text-slate-800 leading-tight truncate max-w-[120px] lg:max-w-[150px] whitespace-nowrap group-hover:text-blue-600 transition-colors">
                    {user.profile?.firstName
                      ? `${user.profile.firstName} ${user.profile.lastName || ""}`
                      : user.email}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
                    {user.role} {user.profile?.company ? `• ${user.profile.company}` : ""}
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] px-1.5 py-0 shrink-0 whitespace-nowrap ${
                    isAlumni
                      ? "border-purple-300 text-purple-700 bg-purple-50"
                      : "border-blue-300 text-blue-700 bg-blue-50"
                  }`}
                >
                  <UserCheck className="h-3 w-3 mr-0.5 inline text-emerald-600 shrink-0" />
                  {isAlumni ? "Mentor" : "Candidate"}
                </Badge>
              </Link>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="gap-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 text-xs shrink-0 whitespace-nowrap px-2.5"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">Sign Out</span>
              </Button>
            </div>
          ) : (
            /* When NOT logged in: Separate Student & Alumni login options */
            <div className="flex items-center gap-2">
              <Link href="/login?role=STUDENT">
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex gap-1.5 text-xs text-blue-700 hover:bg-blue-50">
                  <LogIn className="h-3.5 w-3.5" />
                  Student Portal
                </Button>
              </Link>
              <Link href="/login?role=ALUMNI">
                <Button variant="outline" size="sm" className="hidden sm:inline-flex gap-1.5 text-xs border-purple-300 text-purple-700 hover:bg-purple-50">
                  <LogIn className="h-3.5 w-3.5" />
                  Alumni Portal
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="gap-1.5 text-xs bg-slate-900 text-white hover:bg-slate-800">
                  <UserPlus className="h-3.5 w-3.5" />
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
