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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser, logout } from "@/services/api-client";
import { UserRole } from "@/types";

export function Navbar() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string; role: UserRole; profile?: any } | null>(null);

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
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8 gap-2 lg:gap-6">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 mr-2 lg:mr-4">
          <Image
            src="/alumni-connect-logo.png"
            alt="AlumniConnect"
            width={48}
            height={48}
            priority
            className="h-10 w-10 sm:h-11 sm:w-11 object-contain shrink-0"
          />
          <div className="flex flex-col shrink-0">
            <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg whitespace-nowrap">AlumniConnect</span>
            <span className="text-[10px] text-brand-orange font-semibold tracking-wider uppercase -mt-1 whitespace-nowrap">Campus Network</span>
          </div>
        </Link>

        {/* Feature Navigation: ONLY shown after Login */}
        {mounted && user ? (
          <nav className="hidden md:flex items-center gap-3 lg:gap-5 text-xs lg:text-sm font-medium text-slate-600 whitespace-nowrap overflow-x-auto py-1">
            {isStudent ? (
              <>
                <Link href="/candidate-validation" className="flex items-center gap-1.5 hover:text-brand-orange transition-colors shrink-0 whitespace-nowrap">
                  <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0" />
                  Candidate Assessment
                </Link>
                <Link href="/discovery" className="flex items-center gap-1.5 hover:text-brand-orange transition-colors shrink-0 whitespace-nowrap">
                  <Compass className="h-4 w-4 shrink-0" />
                  Discover Alumni
                </Link>
                <Link href="/community" className="flex items-center gap-1.5 hover:text-brand-orange transition-colors shrink-0 whitespace-nowrap">
                  <MessageSquare className="h-4 w-4 text-brand-orange shrink-0" />
                  Mentorship Updates
                </Link>
                <Link href="/connections" className="flex items-center gap-1.5 hover:text-brand-orange transition-colors shrink-0 whitespace-nowrap">
                  <Users className="h-4 w-4 shrink-0" />
                  My Sent Requests
                </Link>
              </>
            ) : (
              <>
                <Link href="/community" className="flex items-center gap-1.5 hover:text-brand-orange transition-colors shrink-0 whitespace-nowrap">
                  <MessageSquare className="h-4 w-4 text-purple-600 shrink-0" />
                  Mentorship Updates
                </Link>
                <Link href="/connections" className="flex items-center gap-1.5 hover:text-brand-orange transition-colors shrink-0 whitespace-nowrap">
                  <Inbox className="h-4 w-4 text-blue-600 shrink-0" />
                  Candidate Requests
                </Link>
                <Link href="/discovery" className="flex items-center gap-1.5 hover:text-brand-orange transition-colors shrink-0 whitespace-nowrap">
                  <Compass className="h-4 w-4 shrink-0" />
                  Discover Alumni
                </Link>
              </>
            )}

            <Link href="/mentorship" className="flex items-center gap-1.5 hover:text-brand-orange transition-colors shrink-0 whitespace-nowrap">
              <GraduationCap className="h-4 w-4 shrink-0" />
              Mentorship
            </Link>
            <Link href="/opportunities" className="flex items-center gap-1.5 hover:text-brand-orange transition-colors shrink-0 whitespace-nowrap">
              <Briefcase className="h-4 w-4 shrink-0" />
              Opportunities
            </Link>
          </nav>
        ) : (
          /* When NOT logged in: Show intro prompt */
          <div className="hidden md:flex items-center text-xs text-slate-500 font-medium italic shrink-0">
            Institutional verification & candidate evaluation platform
          </div>
        )}

        {/* Right Auth Block */}
        <div className="flex items-center gap-2 lg:gap-3 shrink-0">
          {mounted && user ? (
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 sm:px-3 py-1 text-xs shrink-0">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full font-bold text-white uppercase text-[11px] shrink-0 ${
                  isAlumni ? "bg-purple-600" : "bg-blue-600"
                }`}>
                  {user.profile?.firstName ? user.profile.firstName.charAt(0) : user.email.charAt(0)}
                </div>
                <div className="hidden sm:flex flex-col text-left shrink-0">
                  <span className="font-semibold text-slate-800 leading-tight truncate max-w-[120px] lg:max-w-[150px] whitespace-nowrap">
                    {user.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName || ""}` : user.email}
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
              </div>

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
