import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import { LanguageProvider } from './hooks/useLanguage';
import { supabase, isSupabaseConfigured } from './lib/supabase';

export default function App() {
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window === 'undefined') return '/';
    return window.location.pathname.startsWith('/admin') || window.location.hash.includes('admin') || window.location.search.includes('preview_settings')
      ? '/admin'
      : '/';
  });

  const [adminUser, setAdminUser] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.location.search.includes('preview_settings')) {
        return {
          id: 'admin-fixed-id',
          email: 'admin@neha-chinmay.com',
          role: 'admin',
          user_metadata: { name: 'Admin (Neha & Chinmay)' }
        };
      }
      const saved = sessionStorage.getItem('nc_active_admin_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authLoading, setAuthLoading] = useState(false);

  // Sync route on popstate/hashchange
  useEffect(() => {
    const handleRouteChange = () => {
      if (window.location.pathname === '/admin' || window.location.hash.startsWith('#admin') || window.location.hash.includes('admin')) {
        setCurrentPath('/admin');
      } else {
        setCurrentPath('/');
      }
    };

    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, []);

  // Check Supabase session for admin
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      setAuthLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAdminUser(session.user);
        sessionStorage.setItem('nc_active_admin_session', JSON.stringify(session.user));
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAdminUser(session.user);
        sessionStorage.setItem('nc_active_admin_session', JSON.stringify(session.user));
      } else if (!session) {
        setAdminUser(null);
        sessionStorage.removeItem('nc_active_admin_session');
      }
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const navigateTo = (path) => {
    if (path === '/admin') {
      window.location.hash = 'admin';
      setCurrentPath('/admin');
    } else {
      if (window.location.hash.includes('admin')) {
        window.location.hash = '';
      }
      try {
        window.history.pushState({}, '', window.location.pathname.replace(/\/admin\/?$/, '/'));
      } catch {}
      setCurrentPath('/');
    }
  };

  const handleAdminLoginSuccess = (user) => {
    setAdminUser(user);
    try {
      sessionStorage.setItem('nc_active_admin_session', JSON.stringify(user));
    } catch {}
  };

  const handleAdminLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setAdminUser(null);
    try {
      sessionStorage.removeItem('nc_active_admin_session');
    } catch {}
  };

  return (
    <LanguageProvider>
      {currentPath === '/admin' ? (
        authLoading ? (
          <div className="min-h-screen bg-maroon-dark flex items-center justify-center text-gold-champagne font-serif text-lg">
            Verifying admin credentials...
          </div>
        ) : adminUser ? (
          <AdminDashboard
            user={adminUser}
            onLogout={handleAdminLogout}
            onBackToHome={() => navigateTo('/')}
          />
        ) : (
          <AdminLogin
            onLoginSuccess={handleAdminLoginSuccess}
            onBackToHome={() => navigateTo('/')}
          />
        )
      ) : (
        <Home onNavigateAdmin={() => navigateTo('/admin')} />
      )}
    </LanguageProvider>
  );
}
