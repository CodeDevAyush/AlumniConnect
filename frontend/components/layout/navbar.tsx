"use client";

import Link from "next/link";
import Image from "next/image";
import { Users, Compass, Briefcase, GraduationCap, LogIn, ShieldCheck, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
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

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/discovery" className="flex items-center gap-1.5 hover:text-brand-orange transition-colors">
            <Compass className="h-4 w-4" />
            Discover Alumni
          </Link>
          <Link href="/mentorship" className="flex items-center gap-1.5 hover:text-brand-orange transition-colors">
            <GraduationCap className="h-4 w-4" />
            Mentorship
          </Link>
          <Link href="/opportunities" className="flex items-center gap-1.5 hover:text-brand-orange transition-colors">
            <Briefcase className="h-4 w-4" />
            Opportunities
          </Link>
          <Link href="/connections" className="flex items-center gap-1.5 hover:text-brand-orange transition-colors">
            <Users className="h-4 w-4" />
            My Network
          </Link>
          <Link href="/candidate-validation" className="flex items-center gap-1.5 hover:text-brand-orange transition-colors">
            <ShieldCheck className="h-4 w-4" />
            Candidate Assessment
          </Link>
          <Link href="/project-eval" className="flex items-center gap-1.5 hover:text-brand-orange transition-colors">
            <FileCode className="h-4 w-4" />
            Project Quality
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex gap-1.5">
              <LogIn className="h-4 w-4" />
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
