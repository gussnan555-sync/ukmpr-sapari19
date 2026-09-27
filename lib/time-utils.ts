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
