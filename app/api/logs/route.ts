import { NextResponse } from 'next/server';
import { getRecentAccessLogs, clearAllAccessLogs } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const logs = await getRecentAccessLogs();
    return NextResponse.json({
      success: true,
      logs
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Gagal memuat log akses' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await clearAllAccessLogs();
    return NextResponse.json({
      success: true,
      message: 'Semua riwayat presensi berhasil dihapus.'
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Gagal menghapus log akses' },
      { status: 500 }
    );
  }
}
