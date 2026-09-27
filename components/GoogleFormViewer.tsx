'use client';

import { useState } from 'react';
import TokenCountdown from './TokenCountdown';
import {
  ShieldAlert,
  CheckCircle2,
  Lock,
  UserCheck,
  Building2,
  GraduationCap,
  LogOut,
  RefreshCw,
  Sparkles,
  Info
} from 'lucide-react';

interface ParticipantInfo {
  name: string;
  institution: string;
  major: string;
  normPhone: string;
}

interface TokenInfo {
  token: string;
  title: string;
  expires_at: string;
}

interface GoogleFormViewerProps {
  participant: ParticipantInfo;
  tokenInfo: TokenInfo;
  formUrl: string;
  onLogout: () => void;
}

export default function GoogleFormViewer({
  participant,
  tokenInfo,
  formUrl,
  onLogout
}: GoogleFormViewerProps) {
  const [isExpired, setIsExpired] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [showDoneModal, setShowDoneModal] = useState(false);

  const handleExpire = () => {
    setIsExpired(true);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-4 sm:px-6">
      {/* Participant Identity & Token Bar */}
      <div className="glass-panel rounded-2xl p-5 mb-6 shadow-xl border border-slate-700/60 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <UserCheck className="w-3.5 h-3.5" />
                Peserta Terverifikasi
              </span>
              <span className="text-xs text-slate-400">
                Token: <strong className="text-amber-300 font-mono">{tokenInfo.token}</strong>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {participant.name}
            </h2>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 pt-0.5">
              <span className="inline-flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {participant.institution || 'UHN I Gusti Bagus Sugriwa'}
              </span>
              {participant.major && (
                <span className="inline-flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                  {participant.major}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <TokenCountdown expiresAt={tokenInfo.expires_at} onExpire={handleExpire} />

            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-xl transition"
              title="Keluar dari sesi formulir"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* Security Notice Banner */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Formulir ini dikhususkan untuk peserta terdaftar. Dilarang membagikan ke pihak luar.</span>
          </span>
          <span className="hidden sm:inline-block font-mono text-[10px] text-slate-500">
            ID: {participant.normPhone.slice(-4).padStart(participant.normPhone.length, '*')}
          </span>
        </div>
      </div>

      {/* Embedded Google Form Card */}
      <div
        onContextMenu={handleContextMenu}
        className="glass-panel rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl relative select-none"
      >
        {/* Anti-tamper banner overlay at top of iframe */}
        <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Formulir Resmi Seminar • {tokenInfo.title || 'Sesi E-SAPARI'}
            </span>
          </div>

          <button
            onClick={() => setShowDoneModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-md shadow-emerald-950 transition"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Selesai Mengisi</span>
          </button>
        </div>

        {/* Loading State */}
        {iframeLoading && !isExpired && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-sm p-6 text-center">
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mb-3" />
            <p className="text-sm font-medium text-slate-200">Memuat Formulir Google...</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Menghubungkan sesi terverifikasi ke Google Form. Mohon tunggu sejenak.
            </p>
          </div>
        )}

        {/* Expired Overlay */}
        {isExpired && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-md p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-4 text-rose-400">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Waktu Sesi Telah Berakhir</h3>
            <p className="text-sm text-slate-300 max-w-md mb-6 leading-relaxed">
              Masa aktif token untuk sesi ini telah kedaluwarsa sesuai waktu WITA. Jika Anda belum
              selesai mengisi, silakan hubungi panitia seminar untuk token sesi berikutnya.
            </p>
            <button
              onClick={onLogout}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition shadow-lg shadow-amber-500/20"
            >
              Kembali ke Halaman Masuk
            </button>
          </div>
        )}

        {/* Responsive Google Form iframe */}
        <div className="w-full bg-white relative">
          <iframe
            src={formUrl}
            className="w-full min-h-[750px] sm:min-h-[820px] md:min-h-[880px] border-none"
            title="Google Formulir E-SAPARI"
            onLoad={() => setIframeLoading(false)}
          >
            Memuat Formulir...
          </iframe>
        </div>

        {/* Bottom security strip */}
        <div className="bg-slate-950 px-4 py-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <span>Portal Akses Resmi UKMPR - Universitas Hindu Negeri I Gusti Bagus Sugriwa Denpasar</span>
          <span className="font-mono">Peserta: {participant.name}</span>
        </div>
      </div>

      {/* Done Confirmation Modal */}
      {showDoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-panel-glow max-w-md w-full rounded-2xl p-6 text-center border border-amber-500/30">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Terima Kasih, {participant.name}!</h3>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              Pastikan Anda sudah mengklik tombol <strong>Kirim / Submit</strong> di dalam Google Formulir
              di atas sebelum keluar dari halaman ini.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowDoneModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              >
                Cek Formulir Lagi
              </button>
              <button
                onClick={onLogout}
                className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-emerald-500/20"
              >
                Sudah Kirim & Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
