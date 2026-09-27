'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { formatWITA } from '@/lib/time-utils';

export default function LiveWitaClock() {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    // Initial update
    setTimeStr(formatWITA(new Date()));

    const timer = setInterval(() => {
      setTimeStr(formatWITA(new Date()));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!timeStr) return null;

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/60 shadow-sm text-xs font-mono text-slate-300">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <Clock className="w-3.5 h-3.5 text-amber-400" />
      <span>{timeStr}</span>
    </div>
  );
}
