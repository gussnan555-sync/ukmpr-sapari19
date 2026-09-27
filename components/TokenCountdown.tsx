'use client';

import { useState, useEffect } from 'react';
import { getRemainingTime } from '@/lib/time-utils';
import { Timer, AlertTriangle } from 'lucide-react';

interface TokenCountdownProps {
  expiresAt: string;
  onExpire?: () => void;
}

export default function TokenCountdown({ expiresAt, onExpire }: TokenCountdownProps) {
  const [remaining, setRemaining] = useState(() => getRemainingTime(expiresAt));

  useEffect(() => {
    const updateCountdown = () => {
      const state = getRemainingTime(expiresAt);
      setRemaining(state);

      if (state.isExpired) {
        if (onExpire) onExpire();
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const isUrgent = !remaining.isExpired && remaining.hours === 0 && remaining.minutes < 5;

  if (remaining.isExpired) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/40 text-rose-400 text-xs font-semibold">
        <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
        <span>Sesi Berakhir</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-colors ${
        isUrgent
          ? 'bg-rose-950/60 border-rose-500/60 text-rose-300 animate-pulse'
          : 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
      }`}
    >
      <Timer className={`w-4 h-4 ${isUrgent ? 'text-rose-400' : 'text-emerald-400'}`} />
      <div className="flex items-center gap-1">
        <span className="text-[10px] uppercase font-sans font-normal opacity-75">Sisa Waktu:</span>
        <span className="tracking-wider">{remaining.formatted}</span>
      </div>
    </div>
  );
}
