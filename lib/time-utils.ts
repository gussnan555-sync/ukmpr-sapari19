/**
 * Time utility functions focusing on WITA (Waktu Indonesia Tengah - UTC+8)
 * Standard timezone identifier: 'Asia/Makassar'
 */

export function formatWITA(dateInput: Date | string | number | null | undefined): string {
  if (!dateInput) return '-';
  const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '-';

  try {
    const formatted = new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Makassar',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(d);

    return `${formatted.replace(/\./g, ':')} WITA`;
  } catch {
    return d.toLocaleString() + ' WITA';
  }
}

export function getCurrentWITADateTime(): string {
  return formatWITA(new Date());
}

export function isTokenExpired(expiresAt: string | Date): boolean {
  const d = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  return new Date().getTime() > d.getTime();
}

export function getRemainingTime(expiresAt: string | Date) {
  const exp = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  const now = new Date();
  const diffMs = exp.getTime() - now.getTime();

  if (diffMs <= 0) {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
      formatted: '00:00:00 (Sudah Berakhir)'
    };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  return {
    hours,
    minutes,
    seconds,
    isExpired: false,
    formatted: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  };
}

/**
 * Creates an expiry date from now + minutes, returned as ISO string
 */
export function createExpiryDate(durationMinutes: number): string {
  const now = new Date();
  return new Date(now.getTime() + durationMinutes * 60 * 1000).toISOString();
}

/**
 * Returns current date & time parts in WITA (UTC+8)
 */
export function getWITAParts(d: Date = new Date()) {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Makassar',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    const parts = formatter.formatToParts(d);
    const map: Record<string, string> = {};
    for (const p of parts) {
      map[p.type] = p.value;
    }
    const hour = map.hour === '24' ? '00' : map.hour;
    return {
      year: map.year,
      month: map.month,
      day: map.day,
      hour: hour.padStart(2, '0'),
      minute: map.minute.padStart(2, '0'),
      dateString: `${map.year}-${map.month}-${map.day}`
    };
  } catch {
    const year = d.getFullYear().toString();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const hour = d.getHours().toString().padStart(2, '0');
    const minute = d.getMinutes().toString().padStart(2, '0');
    return {
      year,
      month,
      day,
      hour,
      minute,
      dateString: `${year}-${month}-${day}`
    };
  }
}

/**
 * Parse a datetime string assuming WITA (UTC+8) if no timezone offset is explicitly provided.
 * Prevents UTC server (like Vercel) from turning 13:00 into 21:00 WITA.
 */
export function parseWITADateTime(input: string): string {
  if (!input) return new Date().toISOString();

  const str = input.trim();
  // If input already has timezone offset (e.g. 2026-09-27T05:00:00Z or +08:00)
  if (str.includes('Z') || /[+-]\d{2}:?\d{2}$/.test(str)) {
    return new Date(str).toISOString();
  }

  // If format is YYYY-MM-DDTHH:mm or YYYY-MM-DD HH:mm
  const clean = str.replace(' ', 'T');
  const parts = clean.split('T');
  if (parts.length === 2) {
    const timeParts = parts[1].split(':');
    const hh = (timeParts[0] || '00').padStart(2, '0');
    const mm = (timeParts[1] || '00').padStart(2, '0');
    const ss = (timeParts[2] || '00').padStart(2, '0');
    return new Date(`${parts[0]}T${hh}:${mm}:${ss}+08:00`).toISOString();
  }

  return new Date(str).toISOString();
}

/**
 * Given a time string "HH:mm" on today in WITA, create an ISO string with +08:00 offset
 */
export function createWITAExpiryFromTime(timeString: string): string {
  const parts = getWITAParts();
  const [h, m] = timeString.split(':');
  const hh = (h || '00').padStart(2, '0');
  const mm = (m || '00').padStart(2, '0');
  return new Date(`${parts.dateString}T${hh}:${mm}:00+08:00`).toISOString();
}
