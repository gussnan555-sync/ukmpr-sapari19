import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { INITIAL_PARTICIPANTS } from '@/lib/initial-participants';

export async function POST() {
  try {
    // Deduplicate by norm_phone to avoid Postgres batch duplicate constraint error
    const phoneMap = new Map();
    for (const p of INITIAL_PARTICIPANTS) {
      if (p.normPhone) {
        phoneMap.set(p.normPhone, {
          norm_phone: p.normPhone,
          raw_phone: p.rawPhone,
          name: p.name,
          institution: p.institution,
          major: p.major,
          proof_url: p.proofUrl || null
        });
      }
    }
    const payload = Array.from(phoneMap.values());

    // Upsert in batches of 50
    const chunkSize = 50;
    let insertedCount = 0;
    let errors: any[] = [];

    for (let i = 0; i < payload.length; i += chunkSize) {
      const chunk = payload.slice(i, i + chunkSize);
      const { data, error } = await supabase
        .from('participants')
        .upsert(chunk, { onConflict: 'norm_phone' })
        .select();

      if (error) {
        errors.push(error.message);
      } else if (data) {
        insertedCount += data.length;
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Tabel "participants" belum ada di Supabase atau terjadi kendala. Jalankan script SQL di menu "Setup Database" terlebih dahulu.',
          details: errors
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      insertedCount,
      total: INITIAL_PARTICIPANTS.length,
      message: `Berhasil mensinkronkan ${insertedCount} peserta ke Supabase!`
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Gagal sinkronisasi peserta' },
      { status: 500 }
    );
  }
}
