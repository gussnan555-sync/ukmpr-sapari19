import { NextRequest, NextResponse } from 'next/server';
import {
  getAllTokens,
  createTokenRecord,
  toggleTokenStatus,
  deleteToken,
  checkSupabaseTokensTable
} from '@/lib/supabase';
import { createExpiryDate } from '@/lib/time-utils';

export async function GET() {
  try {
    const status = await checkSupabaseTokensTable();
    const { tokens, source, error } = await getAllTokens();

    return NextResponse.json({
      success: true,
      tokens,
      source,
      supabaseReady: status.ready,
      supabaseError: status.error || error
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Gagal memuat token' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { token, title, durationMinutes, customExpiresAt } = body;

    // Generate random token if not provided or requested
    if (!token || token.trim() === '') {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let rand = '';
      for (let i = 0; i < 6; i++) {
        rand += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      token = `SAPARI-${rand}`;
    }

    const duration = parseInt(durationMinutes, 10) || 60;
    let expiresAt: string;

    if (customExpiresAt) {
      expiresAt = new Date(customExpiresAt).toISOString();
    } else {
      expiresAt = createExpiryDate(duration);
    }

    const result = await createTokenRecord({
      token: token.toUpperCase().trim(),
      title: title || 'Token Sesi Seminar',
      duration_minutes: duration,
      expires_at: expiresAt
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Gagal menyimpan token' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      token: result.data
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Gagal membuat token' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, is_active } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Token ID diperlukan' }, { status: 400 });
    }

    await toggleTokenStatus(id, is_active);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Gagal update status token' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Token ID diperlukan' }, { status: 400 });
    }

    await deleteToken(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Gagal menghapus token' },
      { status: 500 }
    );
  }
}
