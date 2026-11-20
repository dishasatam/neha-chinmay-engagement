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

// Production mode: zero fake demo seeds
const SEED_FAMILY_VISITORS = [];
const SEED_FAMILY_BLESSINGS = [];

export function initializeSeedsIfFirstRun() {
  if (typeof window === 'undefined') return;
  try {
    // Automatically cleanse any cached mock demo records
    const rawVisitors = localStorage.getItem('nc_local_visitors_log');
    if (rawVisitors) {
      const parsed = JSON.parse(rawVisitors);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter(v => v.id && !v.id.includes('seed'));
        localStorage.setItem('nc_local_visitors_log', JSON.stringify(cleaned));
      }
    }
    const rawBlessings = localStorage.getItem('nc_guest_blessings');
    if (rawBlessings) {
      const parsedB = JSON.parse(rawBlessings);
      if (Array.isArray(parsedB)) {
        const cleanedB = parsedB.filter(b => b.id && !b.id.includes('seed'));
        localStorage.setItem('nc_guest_blessings', JSON.stringify(cleanedB));
      }
    }
  } catch {}
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

/**
 * Fetch all blessings for Admin Moderation (Pure Real Cloud Data)
 */
export async function getAdminBlessings() {
  initializeSeedsIfFirstRun();

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('blessings')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        const serverBlessings = data.map(b => ({
          id: b.id,
          guest_name: b.guest_name || 'Esteemed Guest',
          message: b.message,
          approval_status: b.approval_status || 'approved',
          created_at: b.created_at,
        }));
        return { success: true, data: serverBlessings };
      }
    } catch (err) {
      console.error('Failed to fetch blessings from Supabase:', err);
    }
  }

  // Local fallback if offline
  let localBlessings = [];
  try {
    localBlessings = JSON.parse(localStorage.getItem('nc_guest_blessings') || '[]');
  } catch {
    localBlessings = [];
  }
  const clean = (localBlessings || []).filter(b => b.id && !b.id.includes('seed'));
  return { success: true, data: clean, localOnly: true };
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
