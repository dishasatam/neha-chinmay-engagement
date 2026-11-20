import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vipdwboiormqkhkzlwpq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_TJmYc4p1iEIUaSbHt3bghQ_Cg8NhHBC';

export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    supabaseAnonKey.length > 20 &&
    !supabaseUrl.includes('your-project-ref')
  );
};

// Create client if configured, otherwise create a mock-safe instance
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

/**
 * Track or update visitor session in Supabase
 * @param {Object} payload { browserId, firstName, surname, sessionId, isNewSession }
 */
export async function trackVisitorApi({ browserId, firstName, surname, sessionId, isNewSession }) {
  // Store locally for developer testing and persistent multi-guest visit history
  try {
    const localLogs = JSON.parse(localStorage.getItem('nc_local_visitors_log') || '[]');
    const cleanFirst = (firstName || '').trim();
    const cleanSurname = (surname || '').trim();
    if (!cleanFirst || !cleanSurname) return { success: false };

    // Match strictly by normalized name so every person has their own distinct visitor record
    const normKey = `${cleanFirst.toLowerCase()}_${cleanSurname.toLowerCase()}`;
    const existingIdx = localLogs.findIndex(v => {
      const vKey = `${(v.first_name || '').trim().toLowerCase()}_${(v.surname || '').trim().toLowerCase()}`;
      return vKey === normKey;
    });

    const nowIso = new Date().toISOString();
    const deviceInfo = typeof navigator !== 'undefined' && /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'Mobile Device' : 'Desktop Browser';

    if (existingIdx >= 0) {
      // Existing guest revisiting! Increment visit count and add new session
      const prevCount = localLogs[existingIdx].visit_count || 1;
      const newCount = prevCount + 1;
      localLogs[existingIdx].visit_count = newCount;
      localLogs[existingIdx].last_visit = nowIso;
      localLogs[existingIdx].first_name = cleanFirst;
      localLogs[existingIdx].surname = cleanSurname;

      if (!Array.isArray(localLogs[existingIdx].visit_history)) {
        localLogs[existingIdx].visit_history = [];
      }

      localLogs[existingIdx].visit_history.unshift({
        visit_number: newCount,
        session_id: sessionId || crypto.randomUUID(),
        timestamp: nowIso,
        device: deviceInfo,
      });
    } else {
      // BRAND NEW DISTINCT VISITOR! Add to the persistent log
      const newVisitorId = crypto.randomUUID();
      localLogs.unshift({
        id: newVisitorId,
        browser_id: browserId || newVisitorId,
        first_name: cleanFirst,
        surname: cleanSurname,
        first_visit: nowIso,
        last_visit: nowIso,
        visit_count: 1,
        created_at: nowIso,
        device: deviceInfo,
        visit_history: [
          {
            visit_number: 1,
            session_id: sessionId || newVisitorId,
            timestamp: nowIso,
            device: deviceInfo,
          }
        ],
      });
    }

    localStorage.setItem('nc_local_visitors_log', JSON.stringify(localLogs));

    // Dispatch custom event for real-time dashboard reactivity
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nc_visitor_updated', {
        detail: { firstName: cleanFirst, surname: cleanSurname }
      }));
    }
  } catch (e) {
    console.warn('Could not save to local visitors log:', e);
  }

  if (!isSupabaseConfigured() || !supabase) {
    return { success: true, localOnly: true };
  }

  try {
    const nowIso = new Date().toISOString();
    const deviceInfo = typeof navigator !== 'undefined' && /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'Mobile Device' : 'Desktop Browser';
    const cleanFirst = (firstName || '').trim();
    const cleanSurname = (surname || '').trim();

    // Check if visitor with this name or browser_id exists in Supabase
    let existingVisitor = null;
    const { data: byName } = await supabase
      .from('visitors')
      .select('id, visit_count')
      .ilike('first_name', cleanFirst)
      .ilike('surname', cleanSurname)
      .maybeSingle();

    if (byName) {
      existingVisitor = byName;
    } else if (browserId) {
      const { data: byBrowser } = await supabase
        .from('visitors')
        .select('id, visit_count')
        .eq('browser_id', browserId)
        .maybeSingle();
      if (byBrowser) existingVisitor = byBrowser;
    }

    let visitorRecordId = existingVisitor?.id;

    if (existingVisitor) {
      const newCount = (existingVisitor.visit_count || 1) + (isNewSession ? 1 : 0);
      const { data: updated, error: updateError } = await supabase
        .from('visitors')
        .update({
          last_visit: nowIso,
          first_name: cleanFirst,
          surname: cleanSurname,
          visit_count: newCount,
          device: deviceInfo,
        })
        .eq('id', existingVisitor.id)
        .select()
        .single();

      if (updateError) console.warn('Supabase visitor update note:', updateError.message);
      visitorRecordId = updated?.id || existingVisitor.id;
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from('visitors')
        .insert({
          browser_id: browserId || crypto.randomUUID(),
          first_name: cleanFirst,
          surname: cleanSurname,
          first_visit: nowIso,
          last_visit: nowIso,
          visit_count: 1,
          device: deviceInfo,
        })
        .select()
        .single();

      if (insertError) console.warn('Supabase visitor insert note:', insertError.message);
      visitorRecordId = inserted?.id;
    }

    if (isNewSession && visitorRecordId && sessionId) {
      try {
        await supabase.from('visitor_sessions').insert({
          visitor_id: visitorRecordId,
          session_id: sessionId,
          started_at: nowIso,
          device: deviceInfo,
        });
      } catch {}
    }

    return { success: true, visitorId: visitorRecordId };
  } catch (err) {
    console.error('Error tracking visitor to Supabase:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Submit guest blessing to Supabase & local storage
 */
export async function submitBlessing({ visitorId, guestName, message }) {
  const nowIso = new Date().toISOString();
  const newBlessing = {
    id: crypto.randomUUID(),
    visitor_id: visitorId || null,
    guest_name: guestName || 'Esteemed Guest',
    message: message.trim(),
    approval_status: 'approved',
    created_at: nowIso,
  };

  // Always write immediately to local blessings database
  try {
    const localBlessings = JSON.parse(localStorage.getItem('nc_guest_blessings') || '[]');
    localBlessings.unshift(newBlessing);
    localStorage.setItem('nc_guest_blessings', JSON.stringify(localBlessings));

    // Also link to visitor log if found
    const localLogs = JSON.parse(localStorage.getItem('nc_local_visitors_log') || '[]');
    const cleanGuestName = (guestName || '').trim().toLowerCase();
    const vIdx = localLogs.findIndex(v => {
      const vFull = `${(v.first_name || '').trim()} ${(v.surname || '').trim()}`.toLowerCase();
      return vFull === cleanGuestName || (visitorId && v.id === visitorId);
    });
    if (vIdx >= 0) {
      if (!Array.isArray(localLogs[vIdx].blessings)) localLogs[vIdx].blessings = [];
      localLogs[vIdx].blessings.unshift(newBlessing);
      localLogs[vIdx].blessings_count = localLogs[vIdx].blessings.length;
      localStorage.setItem('nc_local_visitors_log', JSON.stringify(localLogs));
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nc_blessing_updated', { detail: newBlessing }));
      window.dispatchEvent(new CustomEvent('nc_visitor_updated', { detail: { guestName } }));
    }
  } catch (e) {
    console.warn('Could not save blessing to localStorage:', e);
  }

  if (!isSupabaseConfigured() || !supabase) {
    return { success: true, localOnly: true, data: newBlessing };
  }

  try {
    const { data, error } = await supabase
      .from('blessings')
      .insert({
        visitor_id: visitorId || null,
        guest_name: guestName || 'Esteemed Guest',
        message: message.trim(),
        approval_status: 'approved',
      })
      .select()
      .single();

    if (error) {
      console.warn('Supabase blessing insert note:', error.message);
      return { success: true, localOnly: true, data: newBlessing };
    }
    return { success: true, data };
  } catch (err) {
    console.warn('Supabase blessing exception, saved locally:', err.message);
    return { success: true, localOnly: true, data: newBlessing };
  }
}

// Seed family visitors to provide a rich, authentic wedding portal experience
const SEED_FAMILY_VISITORS = [
  {
    id: 'visitor-seed-disha-satam',
    first_name: 'Disha',
    surname: 'Satam',
    visit_count: 7,
    first_visit: new Date(Date.now() - 3600000 * 24).toISOString(),
    last_visit: new Date().toISOString(),
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    device: 'Desktop Browser',
    visit_history: [
      { visit_number: 7, session_id: 'session-disha-7', timestamp: new Date().toISOString(), device: 'Desktop Browser' },
      { visit_number: 6, session_id: 'session-disha-6', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), device: 'Desktop Browser' },
      { visit_number: 5, session_id: 'session-disha-5', timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), device: 'Mobile Device' },
      { visit_number: 4, session_id: 'session-disha-4', timestamp: new Date(Date.now() - 3600000 * 10).toISOString(), device: 'Mobile Device' },
      { visit_number: 3, session_id: 'session-disha-3', timestamp: new Date(Date.now() - 3600000 * 16).toISOString(), device: 'Desktop Browser' },
      { visit_number: 2, session_id: 'session-disha-2', timestamp: new Date(Date.now() - 3600000 * 20).toISOString(), device: 'Mobile Device' },
      { visit_number: 1, session_id: 'session-disha-1', timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), device: 'Desktop Browser' },
    ],
  },
  {
    id: 'visitor-seed-aarti-pawar',
    first_name: 'Aarti',
    surname: 'Pawar',
    visit_count: 4,
    first_visit: new Date(Date.now() - 3600000 * 18).toISOString(),
    last_visit: new Date(Date.now() - 3600000 * 1).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    device: 'Mobile (Android)',
    visit_history: [
      { visit_number: 4, session_id: 'session-aarti-4', timestamp: new Date(Date.now() - 3600000 * 1).toISOString(), device: 'Mobile (Android)' },
      { visit_number: 3, session_id: 'session-aarti-3', timestamp: new Date(Date.now() - 3600000 * 6).toISOString(), device: 'Mobile (Android)' },
      { visit_number: 2, session_id: 'session-aarti-2', timestamp: new Date(Date.now() - 3600000 * 12).toISOString(), device: 'Mobile (Android)' },
      { visit_number: 1, session_id: 'session-aarti-1', timestamp: new Date(Date.now() - 3600000 * 18).toISOString(), device: 'Desktop Browser' },
    ],
  },
  {
    id: 'visitor-seed-rahul-patil',
    first_name: 'Rahul',
    surname: 'Patil',
    visit_count: 3,
    first_visit: new Date(Date.now() - 3600000 * 14).toISOString(),
    last_visit: new Date(Date.now() - 3600000 * 3).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 14).toISOString(),
    device: 'Mobile (iPhone)',
    visit_history: [
      { visit_number: 3, session_id: 'session-rahul-3', timestamp: new Date(Date.now() - 3600000 * 3).toISOString(), device: 'Mobile (iPhone)' },
      { visit_number: 2, session_id: 'session-rahul-2', timestamp: new Date(Date.now() - 3600000 * 8).toISOString(), device: 'Mobile (iPhone)' },
      { visit_number: 1, session_id: 'session-rahul-1', timestamp: new Date(Date.now() - 3600000 * 14).toISOString(), device: 'Desktop Browser' },
    ],
  },
  {
    id: 'visitor-seed-sneha-kadam',
    first_name: 'Sneha',
    surname: 'Kadam',
    visit_count: 5,
    first_visit: new Date(Date.now() - 3600000 * 22).toISOString(),
    last_visit: new Date(Date.now() - 3600000 * 2).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 22).toISOString(),
    device: 'Mobile (iPhone)',
    visit_history: [
      { visit_number: 5, session_id: 'session-sneha-5', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), device: 'Mobile (iPhone)' },
      { visit_number: 4, session_id: 'session-sneha-4', timestamp: new Date(Date.now() - 3600000 * 7).toISOString(), device: 'Mobile (iPhone)' },
      { visit_number: 3, session_id: 'session-sneha-3', timestamp: new Date(Date.now() - 3600000 * 13).toISOString(), device: 'Desktop Browser' },
      { visit_number: 2, session_id: 'session-sneha-2', timestamp: new Date(Date.now() - 3600000 * 17).toISOString(), device: 'Mobile (iPhone)' },
      { visit_number: 1, session_id: 'session-sneha-1', timestamp: new Date(Date.now() - 3600000 * 22).toISOString(), device: 'Desktop Browser' },
    ],
  },
  {
    id: 'visitor-seed-vikram-shinde',
    first_name: 'Vikram',
    surname: 'Shinde',
    visit_count: 2,
    first_visit: new Date(Date.now() - 3600000 * 12).toISOString(),
    last_visit: new Date(Date.now() - 3600000 * 4).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    device: 'Desktop Browser',
    visit_history: [
      { visit_number: 2, session_id: 'session-vikram-2', timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), device: 'Desktop Browser' },
      { visit_number: 1, session_id: 'session-vikram-1', timestamp: new Date(Date.now() - 3600000 * 12).toISOString(), device: 'Desktop Browser' },
    ],
  },
  {
    id: 'visitor-seed-priya-kulkarni',
    first_name: 'Priya',
    surname: 'Kulkarni',
    visit_count: 2,
    first_visit: new Date(Date.now() - 3600000 * 10).toISOString(),
    last_visit: new Date(Date.now() - 3600000 * 5).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 10).toISOString(),
    device: 'Mobile (Android)',
    visit_history: [
      { visit_number: 2, session_id: 'session-priya-2', timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), device: 'Mobile (Android)' },
      { visit_number: 1, session_id: 'session-priya-1', timestamp: new Date(Date.now() - 3600000 * 10).toISOString(), device: 'Mobile (Android)' },
    ],
  },
  {
    id: 'visitor-seed-mahesh-pawar',
    first_name: 'Mahesh',
    surname: 'Pawar',
    visit_count: 3,
    first_visit: new Date(Date.now() - 3600000 * 15).toISOString(),
    last_visit: new Date(Date.now() - 3600000 * 6).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 15).toISOString(),
    device: 'Desktop Browser',
    visit_history: [
      { visit_number: 3, session_id: 'session-mahesh-3', timestamp: new Date(Date.now() - 3600000 * 6).toISOString(), device: 'Desktop Browser' },
      { visit_number: 2, session_id: 'session-mahesh-2', timestamp: new Date(Date.now() - 3600000 * 11).toISOString(), device: 'Desktop Browser' },
      { visit_number: 1, session_id: 'session-mahesh-1', timestamp: new Date(Date.now() - 3600000 * 15).toISOString(), device: 'Mobile (Android)' },
    ],
  },
  {
    id: 'visitor-seed-kunal-joshi',
    first_name: 'Kunal',
    surname: 'Joshi',
    visit_count: 1,
    first_visit: new Date(Date.now() - 3600000 * 8).toISOString(),
    last_visit: new Date(Date.now() - 3600000 * 8).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    device: 'Mobile (iPhone)',
    visit_history: [
      { visit_number: 1, session_id: 'session-kunal-1', timestamp: new Date(Date.now() - 3600000 * 8).toISOString(), device: 'Mobile (iPhone)' },
    ],
  },
];

export function initializeSeedsIfFirstRun() {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem('nc_seeds_initialized')) {
    if (!localStorage.getItem('nc_local_visitors_log')) {
      localStorage.setItem('nc_local_visitors_log', JSON.stringify(SEED_FAMILY_VISITORS));
    }
    if (!localStorage.getItem('nc_guest_blessings')) {
      localStorage.setItem('nc_guest_blessings', JSON.stringify(SEED_FAMILY_BLESSINGS));
    }
    localStorage.setItem('nc_seeds_initialized', 'true');
  }
}

/**
 * Fetch all visitors for Admin Dashboard
 */
export async function getAdminVisitors() {
  initializeSeedsIfFirstRun();
  if (!isSupabaseConfigured() || !supabase) {
    let localLogs = [];
    try {
      localLogs = JSON.parse(localStorage.getItem('nc_local_visitors_log') || '[]');
    } catch {
      localLogs = [];
    }
    if (!Array.isArray(localLogs)) localLogs = [];

    // Fetch all blessings and link directly to each visitor
    const blessingsRes = await getAdminBlessings();
    const blessingsList = blessingsRes.data || [];

    const visitorsList = localLogs.map(v => {
      const vFullName = `${(v.first_name || '').trim()} ${(v.surname || '').trim()}`.toLowerCase();
      const matchedBlessings = blessingsList.filter(b => {
        const bName = (b.guest_name || '').trim().toLowerCase();
        return bName === vFullName || (b.visitor_id && b.visitor_id === v.id);
      });

      return {
        ...v,
        blessings: matchedBlessings,
        blessings_count: matchedBlessings.length,
      };
    });

    // Sort by last visit descending
    visitorsList.sort((a, b) => new Date(b.last_visit || 0).getTime() - new Date(a.last_visit || 0).getTime());

    return { success: true, data: visitorsList, localOnly: true };
  }

  try {
    const { data, error } = await supabase
      .from('visitors')
      .select('*')
      .order('last_visit', { ascending: false });

    if (error) throw error;

    const blessingsRes = await getAdminBlessings();
    const blessingsList = blessingsRes.data || [];

    const enriched = (data || []).map(v => {
      const vFullName = `${(v.first_name || '').trim()} ${(v.surname || '').trim()}`.toLowerCase();
      const matchedBlessings = blessingsList.filter(b => {
        const bName = (b.guest_name || '').trim().toLowerCase();
        return bName === vFullName || (b.visitor_id && b.visitor_id === v.id);
      });
      return {
        ...v,
        blessings: matchedBlessings,
        blessings_count: matchedBlessings.length,
      };
    });

    return { success: true, data: enriched };
  } catch (err) {
    console.error('Failed to fetch visitors for admin:', err);
    return { success: false, error: err.message, data: [] };
  }
}

/**
 * Fetch visitor sessions
 */
export async function getAdminSessions() {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, reason: 'SUPABASE_NOT_CONFIGURED', data: [] };
  }

  try {
    const { data, error } = await supabase
      .from('visitor_sessions')
      .select('*')
      .order('started_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err) {
    console.error('Failed to fetch sessions for admin:', err);
    return { success: false, error: err.message, data: [] };
  }
}

// Seed family blessings to give a realistic and heartwarming guestbook
const SEED_FAMILY_BLESSINGS = [
  {
    id: 'blessing-seed-disha',
    guest_name: 'Disha Satam',
    message: 'stay blessed',
    approval_status: 'approved',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'blessing-seed-aarti',
    guest_name: 'Aarti Pawar',
    message: 'Heartiest congratulations to my dearest Chinmay Dada & Neha Vahini! May your journey together be blessed with endless happiness, prosperity, and divine love.',
    approval_status: 'approved',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'blessing-seed-sneha',
    guest_name: 'Sneha Kadam',
    message: 'So thrilled and overjoyed for my sweetest sister Neha & Chinmay Dada! Wishing you both the most romantic Sakharpuda and a lifetime of smiles!',
    approval_status: 'approved',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'blessing-seed-rahul',
    guest_name: 'Rahul Patil',
    message: 'Heartiest congratulations to Neha and Chinmay! Wishing you both a lifetime of love, laughter, and endless togetherness.',
    approval_status: 'approved',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'blessing-seed-mahesh',
    guest_name: 'Mahesh Pawar',
    message: 'अखंड सौभाग्यवती भव! नेहा आणि चिन्मय यांना साखरपुड्याच्या आणि भावी वैवाहिक आयुष्याच्या मनःपूर्वक मंगल शुभेच्छा!',
    approval_status: 'approved',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'blessing-seed-priya',
    guest_name: 'Priya Kulkarni',
    message: 'नेहा आणि चिन्मय, तुम्हा दोघांना साखरपुड्याच्या आणि भावी आयुष्यासाठी मनापासून हार्दिक शुभेच्छा! सदैव आनंदी राहा.',
    approval_status: 'approved',
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: 'blessing-seed-vikram',
    guest_name: 'Vikram Shinde',
    message: 'Warmest congratulations Chinmay & Neha on your engagement! Wishing you a wonderful partnership filled with mutual trust and joy.',
    approval_status: 'approved',
    created_at: new Date(Date.now() - 3600000 * 22).toISOString(),
  },
];

/**
 * Fetch all blessings for Admin Moderation
 */
export async function getAdminBlessings() {
  initializeSeedsIfFirstRun();
  let localBlessings = [];
  try {
    localBlessings = JSON.parse(localStorage.getItem('nc_guest_blessings') || '[]');
  } catch {
    localBlessings = [];
  }
  if (!Array.isArray(localBlessings)) localBlessings = [];

  // Sort latest first
  localBlessings.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

  if (!isSupabaseConfigured() || !supabase) {
    return { success: true, data: localBlessings, localOnly: true };
  }

  try {
    const { data, error } = await supabase
      .from('blessings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    const serverBlessings = (data || []).map(b => ({
      id: b.id,
      guest_name: b.guest_name || 'Esteemed Guest',
      message: b.message,
      approval_status: b.approval_status,
      created_at: b.created_at,
    }));

    // Merge server with any local submissions
    const merged = [...localBlessings];
    serverBlessings.forEach(sb => {
      if (!merged.some(m => m.id === sb.id)) {
        merged.push(sb);
      }
    });

    return { success: true, data: merged };
  } catch (err) {
    console.error('Failed to fetch blessings for admin from Supabase, returning local:', err);
    return { success: true, data: localBlessings, localOnly: true };
  }
}

/**
 * Update blessing approval status
 */
export async function updateBlessingStatus(blessingId, status) {
  if (!isSupabaseConfigured() || !supabase) {
    const local = JSON.parse(localStorage.getItem('nc_guest_blessings') || '[]');
    const updated = local.map(b => b.id === blessingId ? { ...b, approval_status: status } : b);
    localStorage.setItem('nc_guest_blessings', JSON.stringify(updated));
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from('blessings')
      .update({ approval_status: status })
      .eq('id', blessingId);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Delete a specific visitor record from database/localStorage
 */
export async function deleteVisitorRecord(visitorId, fullName = '') {
  try {
    const local = JSON.parse(localStorage.getItem('nc_local_visitors_log') || '[]');
    const normName = fullName.toLowerCase().trim();
    const updated = local.filter(v => {
      if (v.id && visitorId && v.id === visitorId) return false;
      if (v.browser_id && visitorId && v.browser_id === visitorId) return false;
      const vName = `${v.first_name || ''} ${v.surname || ''}`.toLowerCase().trim();
      if (normName && vName === normName) return false;
      return true;
    });
    localStorage.setItem('nc_local_visitors_log', JSON.stringify(updated));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nc_visitor_updated', { detail: { deletedId: visitorId } }));
    }

    if (isSupabaseConfigured() && supabase && visitorId) {
      await supabase.from('visitors').delete().eq('id', visitorId);
    }
    return { success: true };
  } catch (err) {
    console.error('Error deleting visitor record:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Clear all visitor records
 */
export async function clearAllVisitors() {
  try {
    localStorage.removeItem('nc_local_visitors_log');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nc_visitor_updated', { detail: { cleared: true } }));
    }
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('visitors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    }
    return { success: true };
  } catch (err) {
    console.error('Error clearing all visitors:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Delete a specific blessing record from database/localStorage
 */
export async function deleteBlessingRecord(blessingId) {
  try {
    const local = JSON.parse(localStorage.getItem('nc_guest_blessings') || '[]');
    const updated = local.filter(b => b.id !== blessingId);
    localStorage.setItem('nc_guest_blessings', JSON.stringify(updated));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nc_blessing_updated', { detail: { deletedId: blessingId } }));
    }

    if (isSupabaseConfigured() && supabase && blessingId) {
      await supabase.from('blessings').delete().eq('id', blessingId);
    }
    return { success: true };
  } catch (err) {
    console.error('Error deleting blessing record:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Clear all blessing records
 */
export async function clearAllBlessings() {
  try {
    localStorage.setItem('nc_guest_blessings', JSON.stringify([]));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nc_blessing_updated', { detail: { cleared: true } }));
    }
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('blessings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    }
    return { success: true };
  } catch (err) {
    console.error('Error clearing all blessings:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Restore sample demo records if admin wants them back
 */
export async function restoreDemoRecords() {
  try {
    localStorage.setItem('nc_local_visitors_log', JSON.stringify(SEED_FAMILY_VISITORS));
    localStorage.setItem('nc_guest_blessings', JSON.stringify(SEED_FAMILY_BLESSINGS));
    localStorage.setItem('nc_seeds_initialized', 'true');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nc_visitor_updated', { detail: { restored: true } }));
      window.dispatchEvent(new CustomEvent('nc_blessing_updated', { detail: { restored: true } }));
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
