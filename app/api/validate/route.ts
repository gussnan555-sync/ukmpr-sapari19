import { NextRequest, NextResponse } from 'next/server';
import { normalizePhoneNumber } from '@/lib/initial-participants';
import { getAllTokens, recordAccessLog, findParticipantInDbOrFallback } from '@/lib/supabase';
import { isTokenExpired } from '@/lib/time-utils';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawToken = (body.token || '').toString().trim().toUpperCase();
    const rawPhone = (body.phone || '').toString().trim();
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    if (!rawToken || !rawPhone) {
      return NextResponse.json(
        { success: false, error: 'Token dan Nomor WhatsApp/HP wajib diisi!' },
        { status: 400 }
      );
    }

    const normPhone = normalizePhoneNumber(rawPhone);

    // 1. Verify Phone Number (from Supabase DB with fallback)
    const participant = await findParticipantInDbOrFallback(rawPhone);
    if (!participant) {
      await recordAccessLog({
        token: rawToken,
        norm_phone: normPhone || rawPhone,
        participant_name: 'Tidak Terdaftar',
        status: 'unregistered_phone',
        user_agent: userAgent
      });

      return NextResponse.json(
        {
          success: false,
          error: `Nomor Handphone (${rawPhone}) tidak terdaftar sebagai peserta E-SAPARI. Pastikan nomor yang dimasukkan sama dengan saat mendaftar.`
        },
        { status: 403 }
      );
    }

    // 2. Verify Token
    const { tokens } = await getAllTokens();
    const matchedToken = tokens.find(
      t => t.token.toUpperCase().trim() === rawToken
    );

    if (!matchedToken) {
      await recordAccessLog({
        token: rawToken,
        norm_phone: normPhone,
        participant_name: participant.name,
        status: 'token_invalid',
        user_agent: userAgent
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Token yang Anda masukkan tidak valid atau salah ketik. Silakan periksa kembali token dari panitia.'
        },
        { status: 400 }
      );
    }

    if (!matchedToken.is_active) {
      await recordAccessLog({
        token: rawToken,
        norm_phone: normPhone,
        participant_name: participant.name,
        status: 'token_invalid',
        user_agent: userAgent
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Token ini telah dinonaktifkan oleh panitia acara.'
        },
        { status: 403 }
      );
    }

    // 3. Verify Expiry Time (WITA)
    if (isTokenExpired(matchedToken.expires_at)) {
      await recordAccessLog({
        token: rawToken,
        norm_phone: normPhone,
        participant_name: participant.name,
        status: 'token_expired',
        user_agent: userAgent
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Waktu pengisian formulir untuk token ini telah berakhir (Expired).'
        },
        { status: 403 }
      );
    }

    // 4. Access Granted
    await recordAccessLog({
      token: rawToken,
      norm_phone: normPhone,
      participant_name: participant.name,
      status: 'granted',
      user_agent: userAgent
    });

    const googleFormUrl =
      process.env.NEXT_PUBLIC_GOOGLE_FORM_URL ||
      'https://docs.google.com/forms/d/e/1FAIpQLScnQ3eY0WEWIy7u4zuABj8mm_NbqX3P6SqNRlPjKwLDO1y2QA/viewform?embedded=true';

    return NextResponse.json({
      success: true,
      participant: {
        name: participant.name,
        institution: participant.institution,
        major: participant.major,
        normPhone: participant.normPhone
      },
      token: {
        token: matchedToken.token,
        title: matchedToken.title,
        expires_at: matchedToken.expires_at
      },
      formUrl: googleFormUrl
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan sistem: ' + (err?.message || 'Internal error') },
      { status: 500 }
    );
  }
}
