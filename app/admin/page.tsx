'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { TokenRecord, AccessLogRecord } from '@/lib/supabase';
import { formatWITA, getRemainingTime } from '@/lib/time-utils';
import {
  KeyRound,
  Users,
  Clock,
  Database,
  Plus,
  Copy,
  Check,
  Trash2,
  Power,
  RotateCcw,
  Search,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Sparkles,
  BarChart3,
  CheckCircle2,
  XCircle,
  Send
} from 'lucide-react';

interface ParticipantItem {
  id: number;
  timestamp: string;
  name: string;
  institution: string;
  major: string;
  rawPhone: string;
  normPhone: string;
  proofUrl?: string;
}

export default function AdminPage() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'tokens' | 'participants' | 'logs'>('tokens');

  // Token Form State
  const [newTokenCode, setNewTokenCode] = useState('');
  const [newTokenTitle, setNewTokenTitle] = useState('Presensi Sesi Seminar');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [customDateTime, setCustomDateTime] = useState('');
  const [isCreatingToken, setIsCreatingToken] = useState(false);

  // Data States
  const [tokens, setTokens] = useState<TokenRecord[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(false);
  const [supabaseReady, setSupabaseReady] = useState<boolean | null>(null);
  const [supabaseSource, setSupabaseSource] = useState<string>('unknown');

  // Participants State
  const [participants, setParticipants] = useState<ParticipantItem[]>([]);
  const [participantSearch, setParticipantSearch] = useState('');
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Logs State
  const [logs, setLogs] = useState<AccessLogRecord[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Copied token state
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Check persisted auth on mount
  useEffect(() => {
    const authSaved = localStorage.getItem('sapari_admin_auth');
    if (authSaved === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchTokens();
      fetchParticipants();
      fetchLogs();
    }
  }, [isAuthenticated]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);

    // Accept default PIN ukmpr-sapari19 or sapari2026 or sapari19
    const validPins = ['ukmpr-sapari19', 'sapari2026', 'sapari19', 'admin'];
    if (validPins.includes(pinInput.trim())) {
      setIsAuthenticated(true);
      localStorage.setItem('sapari_admin_auth', 'true');
    } else {
      setPinError('PIN / Kata Sandi Panitia salah! (Default: ukmpr-sapari19)');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sapari_admin_auth');
    setIsAuthenticated(false);
    setPinInput('');
  };

  const fetchTokens = async () => {
    setLoadingTokens(true);
    try {
      const res = await fetch('/api/tokens');
      const data = await res.json();
      if (data.success) {
        setTokens(data.tokens || []);
        setSupabaseReady(data.supabaseReady);
        setSupabaseSource(data.source || 'unknown');
      }
    } catch {
      // ignore
    } finally {
      setLoadingTokens(false);
    }
  };

  const fetchParticipants = async (query = '') => {
    setLoadingParticipants(true);
    try {
      const url = query ? `/api/participants?q=${encodeURIComponent(query)}` : '/api/participants';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setParticipants(data.participants || []);
      }
    } catch {
      // ignore
    } finally {
      setLoadingParticipants(false);
    }
  };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
      }
    } catch {
      // ignore
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleGenerateRandomToken = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewTokenCode(`SAPARI-${code}`);
  };

  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingToken(true);

    try {
      const res = await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: newTokenCode,
          title: newTokenTitle,
          durationMinutes,
          customExpiresAt: customDateTime || undefined
        })
      });

      const data = await res.json();
      if (data.success) {
        setNewTokenCode('');
        setCustomDateTime('');
        await fetchTokens();
      } else {
        alert('Gagal membuat token: ' + data.error);
      }
    } catch (err: any) {
      alert('Error: ' + err?.message);
    } finally {
      setIsCreatingToken(false);
    }
  };

  const handleToggleToken = async (id: string, currentStatus: boolean) => {
    try {
      await fetch('/api/tokens', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !currentStatus })
      });
      fetchTokens();
    } catch {
      // ignore
    }
  };

  const handleDeleteToken = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus token ini?')) return;

    try {
      await fetch(`/api/tokens?id=${id}`, { method: 'DELETE' });
      fetchTokens();
    } catch {
      // ignore
    }
  };

  const handleClearLogs = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus semua riwayat presensi?')) return;
    try {
      await fetch('/api/logs', { method: 'DELETE' });
      await fetchLogs();
    } catch {
      // ignore
    }
  };

  const handleSyncToSupabase = async () => {
    setIsSyncing(true);
    setSyncStatus('Sedang mensinkronkan peserta ke Supabase...');

    try {
      const res = await fetch('/api/sync-participants', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSyncStatus(`Berhasil! ${data.insertedCount} peserta tersimpan di database Supabase.`);
      } else {
        setSyncStatus(`Info: ${data.error}`);
      }
    } catch (err: any) {
      setSyncStatus(`Kendala sinkronisasi: ${err?.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(id);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  // If not authenticated, render Admin Login Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-[#070b14] text-slate-100">
        <Navbar isAdmin={true} />

        <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="glass-panel-glow max-w-md w-full rounded-3xl p-8 border border-amber-500/30 shadow-2xl relative">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-3">
                <Lock className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-bold text-white">Panel Panitia E-SAPARI</h1>
              <p className="text-xs text-slate-400 mt-1">
                Masukkan PIN Admin untuk mengelola Token dan Peserta Seminar
              </p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              {pinError && (
                <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs">
                  {pinError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  PIN / Kata Sandi Akses
                </label>
                <input
                  type="password"
                  value={pinInput}
                  onChange={e => setPinInput(e.target.value)}
                  placeholder="Masukkan PIN (Default: ukmpr-sapari19)"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-white text-sm outline-none transition"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition cursor-pointer"
              >
                Buka Panel Panitia
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-800 text-center text-[11px] text-slate-500">
              Akses khusus panitia UKMPR UHN I Gusti Bagus Sugriwa Denpasar.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const activeTokensCount = tokens.filter(
    t => t.is_active && !getRemainingTime(t.expires_at).isExpired
  ).length;

  const grantedAccessCount = logs.filter(l => l.status === 'granted').length;

  return (
    <div className="min-h-screen flex flex-col bg-[#070b14] text-slate-100">
      <Navbar isAdmin={true} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Top Header & Overview Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel rounded-2xl p-5 border border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Panitia</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                Admin E-SAPARI
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Kelola token Google Formulir, verifikasi nomor WhatsApp peserta, dan pantau kehadiran realtime.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Supabase status indicator */}
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium ${
                supabaseReady
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>
                Supabase: {supabaseReady ? 'Tersambung (Tabel Aktif)' : 'Siap Setup SQL'}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition"
            >
              Keluar
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel rounded-2xl p-4 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Token Aktif</span>
              <KeyRound className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white">{activeTokensCount}</div>
            <span className="text-[11px] text-slate-400">Siap digunakan peserta</span>
          </div>

          <div className="glass-panel rounded-2xl p-4 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Total Peserta CSV</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white">{participants.length}</div>
            <span className="text-[11px] text-slate-400">Nomor WhatsApp Terdaftar</span>
          </div>

          <div className="glass-panel rounded-2xl p-4 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Akses Formulir Berhasil</span>
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-white">{grantedAccessCount}</div>
            <span className="text-[11px] text-slate-400">Peserta membuka formulir</span>
          </div>

          <div className="glass-panel rounded-2xl p-4 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Zona Waktu</span>
              <Clock className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white">WITA (UTC+8)</div>
            <span className="text-[11px] text-slate-400">Waktu Indonesia Tengah</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 gap-2 sm:gap-4 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('tokens')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition cursor-pointer whitespace-nowrap ${
              activeTab === 'tokens'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Manajemen Token</span>
          </button>

          <button
            onClick={() => setActiveTab('participants')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition cursor-pointer whitespace-nowrap ${
              activeTab === 'participants'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Daftar Peserta ({participants.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition cursor-pointer whitespace-nowrap ${
              activeTab === 'logs'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Riwayat Presensi ({logs.length})</span>
          </button>
        </div>

        {/* TAB 1: TOKEN MANAGEMENT */}
        {activeTab === 'tokens' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create Token Box */}
            <div className="lg:col-span-1 glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-white">Buat Token Baru</h2>
              </div>
              <p className="text-xs text-slate-400">
                Token yang dibuat akan berlaku untuk semua peserta terdaftar selama durasi aktif waktu WITA.
              </p>

              <form onSubmit={handleCreateToken} className="space-y-4">
                {/* Token Code */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-slate-300">Kode Token</label>
                    <button
                      type="button"
                      onClick={handleGenerateRandomToken}
                      className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      Acak Kode
                    </button>
                  </div>
                  <input
                    type="text"
                    value={newTokenCode}
                    onChange={e => setNewTokenCode(e.target.value.toUpperCase())}
                    placeholder="Contoh: SAPARI-SESI1"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm uppercase font-bold focus:border-amber-500 outline-none"
                    required
                  />
                </div>

                {/* Token Title / Description */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Judul Sesi / Keterangan
                  </label>
                  <input
                    type="text"
                    value={newTokenTitle}
                    onChange={e => setNewTokenTitle(e.target.value)}
                    placeholder="Contoh: Presensi Sesi Pagi Seminar"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-amber-500 outline-none"
                    required
                  />
                </div>

                {/* Duration Presets */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">
                    Durasi Masa Berlaku (Waktu WITA)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[15, 30, 45, 60, 120, 1440].map(mins => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => {
                          setDurationMinutes(mins);
                          setCustomDateTime('');
                        }}
                        className={`py-2 px-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                          durationMinutes === mins && !customDateTime
                            ? 'bg-amber-500 text-slate-950 border-amber-400'
                            : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        {mins >= 60 ? `${mins / 60} Jam` : `${mins} Menit`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Expiry DateTime (Optional) */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Atau Atur Tanggal & Jam Berakhir Spesifik (Opsional)
                  </label>
                  <input
                    type="datetime-local"
                    value={customDateTime}
                    onChange={e => setCustomDateTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isCreatingToken}
                  className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {isCreatingToken ? (
                    <span>Menerbitkan Token...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Terbitkan Token Sekarang</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Tokens List */}
            <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Daftar Token Seminar</h2>
                  <p className="text-xs text-slate-400">
                    Bagikan token yang aktif kepada peserta di ruang seminar.
                  </p>
                </div>
                <button
                  onClick={fetchTokens}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  title="Muat ulang token"
                >
                  <RotateCcw className={`w-4 h-4 ${loadingTokens ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {tokens.length === 0 ? (
                <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
                  Belum ada token yang dibuat. Buat token pertama di formulir sebelah kiri.
                </div>
              ) : (
                <div className="space-y-3">
                  {tokens.map(item => {
                    const remaining = getRemainingTime(item.expires_at);
                    const isLive = item.is_active && !remaining.isExpired;

                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-xl border transition ${
                          isLive
                            ? 'bg-slate-900/90 border-amber-500/40 shadow-sm shadow-amber-500/5'
                            : 'bg-slate-950/60 border-slate-800 opacity-75'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono text-base sm:text-lg font-extrabold text-amber-300 tracking-wider">
                                {item.token}
                              </span>
                              <button
                                onClick={() => copyToClipboard(item.token, item.id)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-medium transition cursor-pointer"
                                title="Salin Token"
                              >
                                {copiedToken === item.id ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span className="text-emerald-400">Tersalin!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Salin</span>
                                  </>
                                )}
                              </button>

                              {isLive ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                  Aktif
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[10px] font-semibold">
                                  {remaining.isExpired ? 'Kedaluwarsa' : 'Nonaktif'}
                                </span>
                              )}
                            </div>

                            <p className="text-xs font-medium text-slate-200">{item.title}</p>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
                              <span>
                                Berakhir: <strong className="text-slate-300">{formatWITA(item.expires_at)}</strong>
                              </span>
                              {isLive && (
                                <span className="text-amber-400 font-mono font-semibold">
                                  Sisa: {remaining.formatted}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            {/* Toggle active switch */}
                            <button
                              onClick={() => handleToggleToken(item.id, item.is_active)}
                              className={`p-2 rounded-lg border text-xs font-medium transition cursor-pointer ${
                                item.is_active
                                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                              }`}
                              title={item.is_active ? 'Nonaktifkan Token' : 'Aktifkan Token'}
                            >
                              <Power className="w-4 h-4" />
                            </button>

                            {/* Delete button */}
                            <button
                              onClick={() => handleDeleteToken(item.id)}
                              className="p-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-400 hover:text-rose-300 transition cursor-pointer"
                              title="Hapus Token"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PARTICIPANTS */}
        {activeTab === 'participants' && (
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Database Peserta Terdaftar ({participants.length} Peserta)</h2>
                <p className="text-xs text-slate-400">
                  Data otomatis dimuat dari file pendaftaran CSV seminar E-SAPARI.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSyncToSupabase}
                  disabled={isSyncing}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-950 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan ke Supabase'}</span>
                </button>
              </div>
            </div>

            {syncStatus && (
              <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-300 text-xs">
                {syncStatus}
              </div>
            )}

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={participantSearch}
                onChange={e => {
                  setParticipantSearch(e.target.value);
                  fetchParticipants(e.target.value);
                }}
                placeholder="Cari berdasarkan Nama, Nomor WhatsApp, Jurusan, atau Instansi..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:border-amber-500 outline-none"
              />
            </div>

            {/* Participants Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-[500px]">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider sticky top-0 z-10 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">No</th>
                    <th className="px-4 py-3">Nama Lengkap</th>
                    <th className="px-4 py-3">No WA / HP</th>
                    <th className="px-4 py-3">Instansi</th>
                    <th className="px-4 py-3">Jurusan</th>
                    <th className="px-4 py-3">Bukti</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                  {participants.map((p, idx) => (
                    <tr key={p.id || idx} className="hover:bg-slate-900/50 transition">
                      <td className="px-4 py-3 font-mono text-slate-500">{idx + 1}</td>
                      <td className="px-4 py-3 font-semibold text-white">{p.name}</td>
                      <td className="px-4 py-3 font-mono text-emerald-400">
                        {p.normPhone}
                        {p.rawPhone !== p.normPhone && (
                          <span className="block text-[10px] text-slate-500">
                            raw: {p.rawPhone}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-300">{p.institution}</td>
                      <td className="px-4 py-3 text-slate-400">{p.major}</td>
                      <td className="px-4 py-3">
                        {p.proofUrl ? (
                          <a
                            href={p.proofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 underline"
                          >
                            <span>Drive</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ACCESS LOGS */}
        {activeTab === 'logs' && (
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Riwayat Presensi Realtime</h2>
                <p className="text-xs text-slate-400">
                  Pantau setiap upaya peserta saat memasukkan token dan nomor WhatsApp.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {logs.length > 0 && (
                  <button
                    onClick={handleClearLogs}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800/50 text-rose-300 hover:text-white text-xs font-medium transition cursor-pointer"
                    title="Hapus semua riwayat presensi"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Hapus Semua Log</span>
                  </button>
                )}
                <button
                  onClick={fetchLogs}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  title="Muat ulang log"
                >
                  <RotateCcw className={`w-4 h-4 ${loadingLogs ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {logs.length === 0 ? (
              <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
                Belum ada aktivitas presensi yang tercatat.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-[500px]">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider sticky top-0 z-10 border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Waktu (WITA)</th>
                      <th className="px-4 py-3">Nama Peserta</th>
                      <th className="px-4 py-3">Nomor HP</th>
                      <th className="px-4 py-3">Token</th>
                      <th className="px-4 py-3">Status Verifikasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                    {logs.map((log, idx) => {
                      const isSuccess = log.status === 'granted';
                      return (
                        <tr key={log.id || idx} className="hover:bg-slate-900/50 transition">
                          <td className="px-4 py-3 font-mono text-slate-400 whitespace-nowrap">
                            {formatWITA(log.accessed_at)}
                          </td>
                          <td className="px-4 py-3 font-semibold text-white">
                            {log.participant_name}
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-300">{log.norm_phone}</td>
                          <td className="px-4 py-3 font-mono text-amber-300">{log.token}</td>
                          <td className="px-4 py-3">
                            {isSuccess ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold">
                                <CheckCircle2 className="w-3 h-3" />
                                Akses Diberikan
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[11px] font-semibold">
                                <XCircle className="w-3 h-3" />
                                {log.status === 'unregistered_phone'
                                  ? 'No HP Tidak Terdaftar'
                                  : log.status === 'token_expired'
                                  ? 'Token Expired'
                                  : 'Token Salah'}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
