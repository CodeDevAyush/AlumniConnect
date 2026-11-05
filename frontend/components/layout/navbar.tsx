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
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/alumni-connect-logo.png"
            alt="AlumniConnect"
            width={48}
            height={48}
            priority
            className="h-11 w-11 object-contain"
          />
          <div className="flex flex-col">
            <span className="font-extrabold text-slate-900 tracking-tight text-lg">AlumniConnect</span>
            <span className="text-[10px] text-brand-orange font-semibold tracking-wider uppercase -mt-1">Campus Network</span>
          </div>
        </Link>

        {/* Feature Navigation: ONLY shown after Login */}
        {mounted && user ? (
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-600">
            {isStudent ? (
              <>
                <Link href="/candidate-validation" className="flex items-center gap-1.5 hover:text-brand-orange transition-colors">
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                  Candidate Assessment
                </Link>
                <Link href="/discovery" className="flex items-center gap-1.5 hover:text-brand-orange transition-colors">
                  <Compass className="h-4 w-4" />
                  Discover Alumni
                </Link>
                <Link href="/community" className="flex items-center gap-1.5 hover:text-brand-orange transition-colors">
                  <MessageSquare className="h-4 w-4 text-brand-orange" />
                  Mentorship Updates
                </Link>
                <Link href="/connections" className="flex items-center gap-1.5 hover:text-brand-orange transition-colors">
                  <Users className="h-4 w-4" />
                  My Sent Requests
                </Link>
              </>
            ) : (
              <>
                <Link href="/community" className="flex items-center gap-1.5 hover:text-brand-orange transition-colors">
                  <MessageSquare className="h-4 w-4 text-purple-600" />
                  Mentorship Updates
                </Link>
                <Link href="/connections" className="flex items-center gap-1.5 hover:text-brand-orange transition-colors">
                  <Inbox className="h-4 w-4 text-blue-600" />
                  Candidate Requests
                </Link>
                <Link href="/discovery" className="flex items-center gap-1.5 hover:text-brand-orange transition-colors">
                  <Compass className="h-4 w-4" />
                  Discover Alumni
                </Link>
              </>
            )}

            <Link href="/mentorship" className="flex items-center gap-1.5 hover:text-brand-orange transition-colors">
              <GraduationCap className="h-4 w-4" />
              Mentorship
            </Link>
            <Link href="/opportunities" className="flex items-center gap-1.5 hover:text-brand-orange transition-colors">
              <Briefcase className="h-4 w-4" />
              Opportunities
            </Link>
          </nav>
        ) : (
          /* When NOT logged in: Show intro prompt */
          <div className="hidden md:flex items-center text-xs text-slate-500 font-medium italic">
            Institutional verification & candidate evaluation platform
          </div>
        )}

        {/* Right Auth Block */}
        <div className="flex items-center gap-3">
          {mounted && user ? (
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full font-bold text-white uppercase text-[11px] ${
                  isAlumni ? "bg-purple-600" : "bg-blue-600"
                }`}>
                  {user.profile?.firstName ? user.profile.firstName.charAt(0) : user.email.charAt(0)}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="font-semibold text-slate-800 leading-tight truncate max-w-[130px]">
                    {user.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName || ""}` : user.email}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {user.role} {user.profile?.company ? `• ${user.profile.company}` : ""}
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] px-1.5 py-0 ${
                    isAlumni
                      ? "border-purple-300 text-purple-700 bg-purple-50"
                      : "border-blue-300 text-blue-700 bg-blue-50"
                  }`}
                >
                  <UserCheck className="h-3 w-3 mr-0.5 inline text-emerald-600" />
                  {isAlumni ? "Mentor" : "Candidate"}
                </Badge>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="gap-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 text-xs"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
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
