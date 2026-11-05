"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  Compass,
  MessageSquare,
  Users,
  Inbox,
  GraduationCap,
  Briefcase,
  User,
  ChevronRight,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/services/api-client";
import { useSidebar } from "./sidebar-context";

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, closeSidebar } = useSidebar();
  const user = getCurrentUser();

  if (!user) return null;

  const isStudent = user.role === "STUDENT";
  const isAlumni = user.role === "ALUMNI";

  const studentLinks = [
    {
      label: "Candidate Assessment",
      href: "/candidate-validation",
      icon: ShieldCheck,
      color: "text-blue-600",
      badge: "80+ Rating",
    },
    {
      label: "Discover Alumni",
      href: "/discovery",
      icon: Compass,
      color: "text-indigo-600",
    },
    {
      label: "Mentorship Updates",
      href: "/community",
      icon: MessageSquare,
      color: "text-brand-orange",
    },
    {
      label: "My Sent Requests",
      href: "/connections",
      icon: Users,
      color: "text-emerald-600",
    },
    {
      label: "Mentorship Programs",
      href: "/mentorship",
      icon: GraduationCap,
      color: "text-purple-600",
    },
    {
      label: "Opportunities",
      href: "/opportunities",
      icon: Briefcase,
      color: "text-slate-600",
    },
  ];

  const alumniLinks = [
    {
      label: "Mentorship Updates",
      href: "/community",
      icon: MessageSquare,
      color: "text-purple-600",
      badge: "Feed",
    },
    {
      label: "Candidate Requests",
      href: "/connections",
      icon: Inbox,
      color: "text-blue-600",
      badge: "Review",
    },
    {
      label: "Discover Alumni",
      href: "/discovery",
      icon: Compass,
      color: "text-indigo-600",
    },
    {
      label: "Mentorship Programs",
      href: "/mentorship",
      icon: GraduationCap,
      color: "text-emerald-600",
    },
    {
      label: "Opportunities",
      href: "/opportunities",
      icon: Briefcase,
      color: "text-slate-600",
    },
  ];

  const navLinks = isStudent ? studentLinks : alumniLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Slidebar */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 flex flex-col justify-between border-r border-slate-200 bg-white/95 backdrop-blur-md transition-all duration-300 ease-in-out shadow-xs ${
          isOpen
            ? "w-64 sm:w-72 translate-x-0"
            : "-translate-x-full lg:-translate-x-full pointer-events-none w-0 opacity-0"
        }`}
      >
        {/* Top Header & Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {/* User Role Pill & Close (on mobile) */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Navigation
              </span>
              <Badge
                variant="outline"
                className={`text-[10px] py-0 px-1.5 font-bold ${
                  isAlumni
                    ? "border-purple-300 text-purple-700 bg-purple-50"
                    : "border-blue-300 text-blue-700 bg-blue-50"
                }`}
              >
                {isAlumni ? "Mentor Hub" : "Candidate"}
              </Badge>
            </div>
            <button
              onClick={closeSidebar}
              className="rounded-lg p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Feature Navigation List */}
          <nav className="space-y-1.5">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-700 hover:bg-slate-100/80 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 truncate">
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        isActive ? "text-brand-orange" : item.color
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <Badge
                      variant="outline"
                      className={`text-[9px] py-0 px-1 shrink-0 ${
                        isActive
                          ? "border-slate-700 bg-slate-800 text-slate-200"
                          : "border-slate-200 bg-slate-50 text-slate-500"
                      }`}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Quick Hub Highlight Card */}
          <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50/30 p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <Sparkles className="h-3.5 w-3.5 text-brand-orange" />
              <span>{isStudent ? "80+ Rating Gate" : "Mentorship Capacity"}</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {isStudent
                ? "Evaluate your GitHub repository to unlock direct connection access to senior alumni."
                : "Review and respond to candidate connection requests from top-rated student engineers."}
            </p>
          </div>
        </div>

        {/* Bottom Section: LeetCode-style Profile Link */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <Link
            href="/profile"
            className="flex items-center justify-between p-2 rounded-xl hover:bg-white hover:shadow-xs transition-all border border-transparent hover:border-slate-200 group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-white text-xs uppercase shrink-0 ${
                  isAlumni ? "bg-purple-600" : "bg-blue-600"
                }`}
              >
                {user.profile?.firstName ? user.profile.firstName.charAt(0) : user.email.charAt(0)}
              </div>
              <div className="flex flex-col min-w-0 text-left truncate">
                <span className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                  {user.profile?.firstName
                    ? `${user.profile.firstName} ${user.profile.lastName || ""}`
                    : user.email}
                </span>
                <span className="text-[10px] text-slate-500 font-medium truncate">
                  View LeetCode Profile
                </span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>
        </div>
      </aside>
    </>
  );
}
