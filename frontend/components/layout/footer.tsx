import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 py-12 text-sm text-slate-500">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">AlumniConnect</span>
            <span>— Your Campus Network, Activated.</span>
          </div>
          <div className="flex gap-6 text-slate-600">
            <Link href="/privacy" className="hover:text-blue-600">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-blue-600">Terms of Service</Link>
            <Link href="/docs" className="hover:text-blue-600">API Documentation</Link>
          </div>
          <p>© {new Date().getFullYear()} AlumniConnect. Built for higher education institutions.</p>
        </div>
      </div>
    </footer>
  );
}
