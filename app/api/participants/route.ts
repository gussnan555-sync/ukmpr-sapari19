import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_PARTICIPANTS } from '@/lib/initial-participants';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get('q') || '').toLowerCase().trim();

    let results = INITIAL_PARTICIPANTS;
    if (search) {
      results = results.filter(
        p =>
          p.name.toLowerCase().includes(search) ||
          p.institution.toLowerCase().includes(search) ||
          p.major.toLowerCase().includes(search) ||
          p.normPhone.includes(search) ||
          p.rawPhone.includes(search)
      );
    }

    return NextResponse.json({
      success: true,
      total: INITIAL_PARTICIPANTS.length,
      filteredCount: results.length,
      participants: results
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Gagal memuat peserta' },
      { status: 500 }
    );
  }
}
