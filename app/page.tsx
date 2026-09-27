'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import GoogleFormViewer from '@/components/GoogleFormViewer';
import {
  KeyRound,
  Phone,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  Clock,
  Sparkles,
  Users
} from 'lucide-react';

interface VerifiedSession {
  participant: {
    name: string;
    institution: string;
    major: string;
    normPhone: string;
  };
  token: {
    token: string;
    title: string;
    expires_at: string;
  };
  formUrl: string;
}

export default function Home() {
  const [tokenInput, setTokenInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [session, setSession] = useState<VerifiedSession | null>(null);

  // Restore session from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('sapari_participant_session');
      if (saved) {
        const parsed = JSON.parse(saved) as VerifiedSession;
        // Check if token in saved session is still valid
        const expTime = new Date(parsed.token.expires_at).getTime();
        if (expTime > Date.now()) {
          setSession(parsed);
        } else {
          sessionStorage.removeItem('sapari_participant_session');
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanToken = tokenInput.trim();
    const cleanPhone = phoneInput.trim();

    if (!cleanToken) {
      setErrorMessage('Silakan masukkan Token Akses dari panitia!');
      return;
    }
    if (!cleanPhone) {
      setErrorMessage('Silakan masukkan Nomor WhatsApp / HP terdaftar!');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: cleanToken, phone: cleanPhone })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Verifikasi gagal. Silakan periksa kembali token dan nomor HP Anda.');
        setLoading(false);
        return;
      }

      const verifiedSession: VerifiedSession = {
        participant: data.participant,
        token: data.token,
        formUrl: data.formUrl
      };

      setSession(verifiedSession);
      sessionStorage.setItem('sapari_participant_session', JSON.stringify(verifiedSession));
    } catch (err: any) {
      setErrorMessage('Terjadi gangguan jaringan: ' + (err?.message || 'Coba beberapa saat lagi.'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('sapari_participant_session');
    setSession(null);
    setTokenInput('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070b14] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,70,24,0.18),rgba(255,255,255,0))] text-slate-100">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        {session ? (
          <GoogleFormViewer
            participant={session.participant}
            tokenInfo={session.token}
            formUrl={session.formUrl}
            onLogout={handleLogout}
          />
        ) : (
          <div className="w-full max-w-xl mx-auto py-6 sm:py-12">
            {/* Header / Hero */}
            <div className="text-center mb-8 space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Portal Presensi & Evaluasi Seminar</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                E-SAPARI <span className="gold-gradient-text">2026</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-md mx-auto leading-relaxed">
                UKM Penalaran & Riset — UHN I Gusti Bagus Sugriwa Denpasar.
                Masukkan token sesi dan nomor WhatsApp terdaftar untuk membuka formulir.
              </p>
            </div>

            {/* Verification Card */}
            <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 border border-amber-500/25 shadow-2xl relative overflow-hidden">
              {/* Background ambient lighting */}
              <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

              <form onSubmit={handleVerify} className="space-y-5 relative z-10">
                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-4 rounded-2xl bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in duration-200">
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div className="flex-1 leading-relaxed">
                      <strong>Akses Ditolak:</strong> {errorMessage}
                    </div>
                  </div>
                )}

                {/* Token Input */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    1. Token Sesi Seminar
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="w-4 h-4 text-amber-400" />
                    </div>
                    <input
                      type="text"
                      value={tokenInput}
                      onChange={e => setTokenInput(e.target.value.toUpperCase())}
                      placeholder="CONTOH: SAPARI-DEMO"
                      className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-white font-mono font-bold tracking-wider placeholder:font-sans placeholder:font-normal placeholder:text-slate-500 text-sm transition outline-none"
                      disabled={loading}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    Dapatkan token dari panitia saat sesi berlangsung (WITA).
                  </p>
                </div>

                {/* WhatsApp Phone Input */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    2. Nomor WhatsApp / Handphone Terdaftar
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4 text-emerald-400" />
                    </div>
                    <input
                      type="tel"
                      value={phoneInput}
                      onChange={e => setPhoneInput(e.target.value)}
                      placeholder="08xxxxxxxxxx atau +628xxxxxxxxxx"
                      className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-white font-mono text-sm placeholder:font-sans placeholder:text-slate-500 transition outline-none"
                      disabled={loading}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Gunakan nomor yang Anda daftarkan di formulir pendaftaran E-SAPARI.
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Memverifikasi Akses...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5 text-slate-950" />
                      <span>Verifikasi & Buka Formulir</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* Info Tips Footer */}
              <div className="mt-6 pt-5 border-t border-slate-800 text-xs text-slate-400 space-y-2">
                <div className="flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p>
                    <strong>Sistem Keamanan Formulir:</strong> 1 token dapat digunakan oleh seluruh
                    peserta terdaftar selama durasi waktu yang telah ditentukan (Waktu Indonesia Tengah - WITA).
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 pl-6">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>Total 148 Peserta Terverifikasi terdaftar dalam sistem.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full py-4 border-t border-slate-800/60 text-center text-xs text-slate-500">
        © 2026 UKM Penalaran & Riset (UKMPR) • UHN I Gusti Bagus Sugriwa Denpasar. All rights reserved.
      </footer>
    </div>
  );
}
