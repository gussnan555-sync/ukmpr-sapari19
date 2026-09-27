import { createClient } from '@supabase/supabase-js';
import { Participant, INITIAL_PARTICIPANTS, normalizePhoneNumber, findParticipantByPhone } from '@/lib/initial-participants';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pmhsrkboqnxwcczaxajq.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_uDl2rQQAduKBQInOUvh32Q_as1aPLnu';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface TokenRecord {
  id: string;
  token: string;
  title: string;
  duration_minutes: number;
  expires_at: string;
  is_active: boolean;
  created_at: string;
}

export interface AccessLogRecord {
  id?: number | string;
  token: string;
  norm_phone: string;
  participant_name: string;
  status: 'granted' | 'token_expired' | 'token_invalid' | 'unregistered_phone';
  user_agent?: string;
  accessed_at: string;
}

// In-memory fallback in case Supabase tables have not been created yet
let localFallbackTokens: TokenRecord[] = [];
let localFallbackLogs: AccessLogRecord[] = [];

/**
 * Check if the Supabase tokens table is available
 */
export async function checkSupabaseTokensTable(): Promise<{ ready: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('tokens').select('id').limit(1);
    if (error) {
      return { ready: false, error: error.message };
    }
    return { ready: true };
  } catch (err: any) {
    return { ready: false, error: err?.message || 'Connection error' };
  }
}

/**
 * Fetch all tokens
 */
export async function getAllTokens(): Promise<{ tokens: TokenRecord[]; source: 'supabase' | 'fallback'; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { tokens: localFallbackTokens, source: 'fallback', error: error.message };
    }

    return { tokens: (data as TokenRecord[]) || [], source: 'supabase' };
  } catch (err: any) {
    return { tokens: localFallbackTokens, source: 'fallback', error: err?.message };
  }
}

/**
 * Create a new token
 */
export async function createTokenRecord(tokenData: {
  token: string;
  title: string;
  duration_minutes: number;
  expires_at: string;
}): Promise<{ success: boolean; data?: TokenRecord; error?: string }> {
  const newRecord: TokenRecord = {
    id: `tok_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    token: tokenData.token.toUpperCase().trim(),
    title: tokenData.title || 'Token Sesi',
    duration_minutes: tokenData.duration_minutes,
    expires_at: tokenData.expires_at,
    is_active: true,
    created_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('tokens')
      .insert([
        {
          token: newRecord.token,
          title: newRecord.title,
          duration_minutes: newRecord.duration_minutes,
          expires_at: newRecord.expires_at,
          is_active: true
        }
      ])
      .select()
      .single();

    if (!error && data) {
      // Also update local fallback for consistency
      localFallbackTokens = [data as TokenRecord, ...localFallbackTokens];
      return { success: true, data: data as TokenRecord };
    }

    // Fallback if table doesn't exist
    localFallbackTokens = [newRecord, ...localFallbackTokens];
    return { success: true, data: newRecord, error: error?.message };
  } catch (err: any) {
    localFallbackTokens = [newRecord, ...localFallbackTokens];
    return { success: true, data: newRecord, error: err?.message };
  }
}

/**
 * Toggle token active status
 */
export async function toggleTokenStatus(id: string, currentStatus: boolean): Promise<boolean> {
  try {
    await supabase.from('tokens').update({ is_active: !currentStatus }).eq('id', id);
  } catch {
    // ignore
  }

  localFallbackTokens = localFallbackTokens.map(t =>
    t.id === id ? { ...t, is_active: !currentStatus } : t
  );
  return true;
}

/**
 * Delete a token
 */
export async function deleteToken(id: string): Promise<boolean> {
  try {
    await supabase.from('tokens').delete().eq('id', id);
  } catch {
    // ignore
  }

  localFallbackTokens = localFallbackTokens.filter(t => t.id !== id);
  return true;
}

/**
 * Record an access attempt log
 */
export async function recordAccessLog(log: Omit<AccessLogRecord, 'accessed_at'>): Promise<void> {
  const fullLog: AccessLogRecord = {
    ...log,
    accessed_at: new Date().toISOString()
  };

  localFallbackLogs = [fullLog, ...localFallbackLogs.slice(0, 99)];

  try {
    await supabase.from('access_logs').insert([
      {
        token: fullLog.token,
        norm_phone: fullLog.norm_phone,
        participant_name: fullLog.participant_name,
        status: fullLog.status,
        user_agent: fullLog.user_agent,
        accessed_at: fullLog.accessed_at
      }
    ]);
  } catch {
    // Supabase table may not exist yet, fallback already captured
  }
}

/**
 * Get recent access logs
 */
export async function getRecentAccessLogs(): Promise<AccessLogRecord[]> {
  try {
    const { data, error } = await supabase
      .from('access_logs')
      .select('*')
      .order('accessed_at', { ascending: false })
      .limit(50);

    if (!error && data && data.length > 0) {
      return data as AccessLogRecord[];
    }
  } catch {
    // fallback
  }

  return localFallbackLogs;
}

/**
 * Clear all access logs (from Supabase and local fallback)
 */
export async function clearAllAccessLogs(): Promise<boolean> {
  localFallbackLogs = [];
  try {
    await supabase.from('access_logs').delete().gte('id', 0);
  } catch {
    // ignore
  }
  return true;
}

/**
 * Fetch all participants from Supabase, or fallback to INITIAL_PARTICIPANTS
 */
export async function getDbParticipants(): Promise<Participant[]> {
  try {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .order('id', { ascending: true });

    if (!error && data && data.length > 0) {
      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        institution: item.institution || '-',
        major: item.major || '-',
        rawPhone: item.raw_phone || item.norm_phone,
        normPhone: item.norm_phone,
        proofUrl: item.proof_url || undefined,
        timestamp: item.created_at || ''
      }));
    }
  } catch (err) {
    console.error('Error fetching participants from Supabase:', err);
  }

  return INITIAL_PARTICIPANTS;
}

/**
 * Find a participant by phone number in Supabase, falling back to INITIAL_PARTICIPANTS
 */
export async function findParticipantInDbOrFallback(rawPhone: string): Promise<Participant | undefined> {
  const normPhone = normalizePhoneNumber(rawPhone);
  if (!normPhone) return undefined;

  try {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .or(`norm_phone.eq.${normPhone},raw_phone.eq.${rawPhone}`)
      .limit(1);

    if (!error && data && data.length > 0) {
      const item = data[0];
      return {
        id: item.id,
        name: item.name,
        institution: item.institution || '-',
        major: item.major || '-',
        rawPhone: item.raw_phone || item.norm_phone,
        normPhone: item.norm_phone,
        proofUrl: item.proof_url || undefined,
        timestamp: item.created_at || ''
      };
    }
  } catch (err) {
    console.error('Error querying participant in Supabase:', err);
  }

  return findParticipantByPhone(rawPhone);
}
