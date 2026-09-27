'use client';

import Link from 'next/link';
import LiveWitaClock from './LiveWitaClock';
import { ShieldCheck, Sparkles, LayoutDashboard } from 'lucide-react';

interface NavbarProps {
  isAdmin?: boolean;
}

export default function Navbar({ isAdmin = false }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg tracking-tight text-white">
                E-SAPARI
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                UKMPR 2026
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              UHN I Gusti Bagus Sugriwa Denpasar
            </p>
          </div>
        </Link>

        {/* Right side items */}
        <div className="flex items-center gap-3">
          <LiveWitaClock />

          {isAdmin && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300/90 hover:text-amber-200 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-800/50 rounded-lg transition"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Akses Panitia</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
