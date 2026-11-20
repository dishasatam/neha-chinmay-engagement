import { useState, useEffect, useCallback, useRef } from 'react';
import { trackVisitorApi } from '../lib/supabase';

const STORAGE_KEYS = {
  BROWSER_ID: 'nc_browser_id',
  GUEST_PROFILE: 'nc_guest_profile',
  SESSION_ID: 'nc_current_session_id',
  LAST_ACTIVITY: 'nc_last_activity_time',
  LOCAL_VISIT_COUNT: 'nc_local_visit_count',
};

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

// Helper to generate UUID v4
function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Name validator: allows Latin and Devanagari letters, hyphens, spaces, apostrophes
export function validateGuestName(name) {
  if (!name || typeof name !== 'string') return { valid: false, reason: 'empty' };
  const trimmed = name.trim();
  if (trimmed.length < 2) return { valid: false, reason: 'minChars' };
  if (trimmed.length > 50) return { valid: false, reason: 'maxChars' };
  
  // Unicode regex for Devanagari and Latin letters (including Devanagari combining vowel marks \p{M})
  const validPattern = /^[\p{L}\p{M}\s'-]+$/u;
  if (!validPattern.test(trimmed)) {
    return { valid: false, reason: 'invalidChars' };
  }
  return { valid: true, value: trimmed };
}

export function useVisitorTracking() {
  const [browserId, setBrowserId] = useState(() => {
    let id = localStorage.getItem(STORAGE_KEYS.BROWSER_ID);
    if (!id) {
      id = generateUUID();
      localStorage.setItem(STORAGE_KEYS.BROWSER_ID, id);
    }
    return id;
  });

  const [guestProfile, setGuestProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GUEST_PROFILE);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isIdentified, setIsIdentified] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GUEST_PROFILE);
      return Boolean(saved && JSON.parse(saved)?.firstName);
    } catch {
      return false;
    }
  });

  const [visitCount, setVisitCount] = useState(() => {
    const count = parseInt(localStorage.getItem(STORAGE_KEYS.LOCAL_VISIT_COUNT) || '1', 10);
    return isNaN(count) ? 1 : count;
  });

  const [isTracking, setIsTracking] = useState(false);
  const hasTrackedSessionRef = useRef(false);

  // Check and update session activity
  const checkSession = useCallback(() => {
    const now = Date.now();
    const lastActivity = parseInt(localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY) || '0', 10);
    let currentSessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
    let isNewSession = false;

    if (!currentSessionId || now - lastActivity > SESSION_TIMEOUT_MS) {
      // 30+ minutes of inactivity or first session -> Start new session
      currentSessionId = generateUUID();
      localStorage.setItem(STORAGE_KEYS.SESSION_ID, currentSessionId);
      isNewSession = true;
    }

    localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, now.toString());
    return { sessionId: currentSessionId, isNewSession };
  }, []);

  // Track session once per session cycle
  const recordVisitSession = useCallback(async (profile) => {
    if (!profile?.firstName || !profile?.surname || hasTrackedSessionRef.current) {
      return;
    }

    const { sessionId, isNewSession } = checkSession();
    
    // Only increment local count if this is genuinely a new session
    if (isNewSession) {
      const updatedCount = (parseInt(localStorage.getItem(STORAGE_KEYS.LOCAL_VISIT_COUNT) || '0', 10)) + 1;
      localStorage.setItem(STORAGE_KEYS.LOCAL_VISIT_COUNT, updatedCount.toString());
      setVisitCount(updatedCount);
    }

    hasTrackedSessionRef.current = true;
    setIsTracking(true);

    try {
      await trackVisitorApi({
        browserId,
        firstName: profile.firstName,
        surname: profile.surname,
        sessionId,
        isNewSession,
      });
    } catch (err) {
      console.warn('Could not record visitor session to remote server:', err);
    } finally {
      setIsTracking(false);
    }
  }, [browserId, checkSession]);

  // Effect on mount: if returning visitor already identified, track returning visit
  useEffect(() => {
    if (isIdentified && guestProfile && !hasTrackedSessionRef.current) {
      recordVisitSession(guestProfile);
    }
  }, [isIdentified, guestProfile, recordVisitSession]);

  // Register or update guest profile
  const identifyGuest = async (firstNameRaw, surnameRaw) => {
    const valFirst = validateGuestName(firstNameRaw);
    if (!valFirst.valid) {
      return { success: false, field: 'firstName', reason: valFirst.reason };
    }

    const valSurname = validateGuestName(surnameRaw);
    if (!valSurname.valid) {
      return { success: false, field: 'surname', reason: valSurname.reason };
    }

    const newProfile = {
      firstName: valFirst.value,
      surname: valSurname.value,
      identifiedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.GUEST_PROFILE, JSON.stringify(newProfile));
    setGuestProfile(newProfile);
    setIsIdentified(true);

    // Track visitor API with guaranteed new session for identification
    const newSessionId = generateUUID();
    localStorage.setItem(STORAGE_KEYS.SESSION_ID, newSessionId);
    localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());

    hasTrackedSessionRef.current = true;
    setIsTracking(true);

    try {
      await trackVisitorApi({
        browserId,
        firstName: valFirst.value,
        surname: valSurname.value,
        sessionId: newSessionId,
        isNewSession: true,
      });

      // Retrieve this specific guest's visit count from local logs
      try {
        const localLogs = JSON.parse(localStorage.getItem('nc_local_visitors_log') || '[]');
        const normKey = `${valFirst.value.toLowerCase()}_${valSurname.value.toLowerCase()}`;
        const match = localLogs.find(v => `${(v.first_name || '').toLowerCase()}_${(v.surname || '').toLowerCase()}` === normKey);
        if (match) {
          setVisitCount(match.visit_count || 1);
        }
      } catch {}
    } catch (err) {
      console.warn('Could not track identified visitor:', err);
    } finally {
      setIsTracking(false);
    }

    return { success: true, profile: newProfile };
  };

  // Switch guest (allows another family member or guest to identify themselves)
  const switchGuest = () => {
    localStorage.removeItem(STORAGE_KEYS.GUEST_PROFILE);
    localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
    setGuestProfile(null);
    setIsIdentified(false);
    hasTrackedSessionRef.current = false;
  };

  return {
    browserId,
    guestProfile,
    isIdentified,
    visitCount,
    isTracking,
    identifyGuest,
    switchGuest,
  };
}
