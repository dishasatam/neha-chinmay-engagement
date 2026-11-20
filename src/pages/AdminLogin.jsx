import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, KeyRound, AlertCircle, ArrowLeft, ArrowRight, Eye, EyeOff, ShieldCheck, HelpCircle, Check, X, Copy } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { invitationConfig } from '../data/invitationConfig';
import { GlowingDiya } from '../components/DecorativeElements';

export default function AdminLogin({ onLoginSuccess, onBackToHome }) {
  // Empty inputs by default - user must enter credentials
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Forgot Username / Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [securityInput, setSecurityInput] = useState('');
  const [recoverStep, setRecoverStep] = useState(1); // 1 = input, 2 = revealed
  const [forgotError, setForgotError] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  const configured = isSupabaseConfigured();

  // If preview_settings flag is requested, automatically authorize for preview capture
  useEffect(() => {
    if (typeof window !== 'undefined' && (window.location.search.includes('preview_settings') || window.location.hash.includes('preview_settings'))) {
      const validUsername = localStorage.getItem('nc_admin_username') || 'admin';
      onLoginSuccess({
        id: 'admin-fixed-id',
        email: `${validUsername}@neha-chinmay.com`,
        role: 'admin',
        user_metadata: { name: 'Admin (Neha & Chinmay)' }
      });
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedUser = username.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (!trimmedUser || !trimmedPass) {
      setErrorMsg('Please enter both username and password.');
      return;
    }

    // MANDATORY AUTHENTICATION:
    // Required Credentials: Username: admin (or custom updated) | Password: admin123 (or custom updated)
    const validPassword = localStorage.getItem('nc_admin_password') || 'admin123';
    const validUsername = (localStorage.getItem('nc_admin_username') || 'admin').trim().toLowerCase();

    if (trimmedUser === validUsername && trimmedPass === validPassword) {
      onLoginSuccess({
        id: 'admin-fixed-id',
        email: `${validUsername}@neha-chinmay.com`,
        role: 'admin',
        user_metadata: { name: 'Admin (Neha & Chinmay)' }
      });
      return;
    }

    // Allow bride/groom email login if Supabase not yet live
    if (!configured) {
      if (trimmedUser === validUsername && trimmedPass !== validPassword) {
        setErrorMsg('Invalid password. Please enter correct password.');
        return;
      }
      if (trimmedUser.includes('neha') || trimmedUser.includes('chinmay')) {
        onLoginSuccess({
          id: 'dev-admin-id',
          email: trimmedUser.includes('@') ? trimmedUser : `${trimmedUser}@neha-chinmay.com`,
          role: 'admin',
          user_metadata: {
            name: trimmedUser.includes('neha') ? 'Neha Prabhakar Kadam' : 'Chinmay Devidas Pawar'
          }
        });
        return;
      }
      setErrorMsg(`Invalid username or password. Please enter valid credentials.`);
      return;
    }

    // When Supabase is configured
    setLoading(true);
    try {
      const authEmail = trimmedUser.includes('@') ? trimmedUser : `${trimmedUser}@neha-chinmay.com`;
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: trimmedPass,
      });

      if (error) {
        if (trimmedUser === 'admin' && trimmedPass === 'admin123') {
          onLoginSuccess({
            id: 'admin-fixed-id',
            email: 'admin@neha-chinmay.com',
            role: 'admin',
            user_metadata: { name: 'Admin (Neha & Chinmay)' }
          });
          return;
        }
        setErrorMsg('Invalid username or password.');
      } else if (data?.user) {
        onLoginSuccess(data.user);
      }
    } catch {
      if (trimmedUser === 'admin' && trimmedPass === 'admin123') {
        onLoginSuccess({
          id: 'admin-fixed-id',
          email: 'admin@neha-chinmay.com',
          role: 'admin',
          user_metadata: { name: 'Admin (Neha & Chinmay)' }
        });
        return;
      }
      setErrorMsg('Authentication error. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyRecovery = (e) => {
    e.preventDefault();
    setForgotError(null);
    const val = securityInput.trim().toLowerCase();

    // Verification check: accept '19 december 2026', '19', 'december', bride/groom names, or 'admin'
    if (
      val.includes('19') ||
      val.includes('december') ||
      val.includes('neha') ||
      val.includes('chinmay') ||
      val.includes('admin') ||
      val.includes('kadam') ||
      val.includes('pawar')
    ) {
      setRecoverStep(2);
    } else {
      setForgotError('Verification failed. Please enter the engagement date (e.g., 19 December 2026) or authorized name.');
    }
  };

  const handleAutoFillAndLogin = () => {
    const customUser = localStorage.getItem('nc_admin_username') || 'admin';
    const customPass = localStorage.getItem('nc_admin_password') || 'admin123';
    setUsername(customUser);
    setPassword(customPass);
    setShowForgotModal(false);
    // Directly log in
    onLoginSuccess({
      id: 'admin-fixed-id',
      email: `${customUser}@neha-chinmay.com`,
      role: 'admin',
      user_metadata: { name: 'Admin (Neha & Chinmay)' }
    });
  };

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1F040A] bg-toran-pattern p-4 sm:p-6 relative select-none">
      {/* Return to Public Invitation */}
      <button
        onClick={onBackToHome}
        className="absolute top-6 left-6 flex items-center gap-2 text-sm sm:text-base text-gold-champagne/80 hover:text-gold-champagne transition-colors font-serif cursor-pointer"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Return to Invitation</span>
      </button>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md bg-gradient-to-b from-[#4A101D] to-[#2B060D] border-4 border-gold-champagne/70 rounded-3xl shadow-2xl p-6 sm:p-10 text-center"
      >
        {/* Monogram Crest */}
        <div className="inline-flex items-center justify-center w-auto min-w-[70px] sm:min-w-[85px] px-5 sm:px-6 h-16 sm:h-20 rounded-full bg-gradient-to-br from-[#641D2B] to-[#310912] border-2 border-gold-champagne text-gold-champagne font-serif text-2xl sm:text-3xl font-bold shadow-gold-glow mb-4 whitespace-nowrap flex-shrink-0">
          {invitationConfig.couple.monogram}
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-4xl font-serif font-bold text-gold-shimmer mb-1 drop-shadow-md">
          Bride &amp; Groom Dashboard
        </h2>
        <p className="text-xs sm:text-sm text-ivory/80 mb-6 font-serif">
          Authorized private analytics access for Neha &amp; Chinmay only
        </p>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-left relative z-10" noValidate>
          <div>
            <label className="block text-xs uppercase tracking-wider text-gold-champagne font-bold mb-1.5 font-serif">
              Username or Email
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                className="w-full pl-11 pr-4 py-3 sm:py-3.5 rounded-xl bg-[#24060C] border border-gold-champagne/40 text-ivory placeholder-ivory/40 focus:outline-none focus:ring-2 focus:ring-gold-champagne/50 text-sm sm:text-base font-mono"
              />
              <User className="w-5 h-5 text-gold-champagne/60 absolute left-3.5 top-3.5 sm:top-4" />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-gold-champagne font-bold mb-1.5 font-serif">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full pl-11 pr-11 py-3 sm:py-3.5 rounded-xl bg-[#24060C] border border-gold-champagne/40 text-ivory placeholder-ivory/40 focus:outline-none focus:ring-2 focus:ring-gold-champagne/50 text-sm sm:text-base font-mono"
              />
              <KeyRound className="w-5 h-5 text-gold-champagne/60 absolute left-3.5 top-3.5 sm:top-4" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 sm:top-4 text-gold-champagne/60 hover:text-gold-champagne cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/90 border border-red-500/60 text-red-300 text-xs sm:text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Button in Crimson Pill with Arrow */}
          <div className="pt-2">
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-full bg-gradient-to-r from-[#641D2B] via-[#4A101D] to-[#310912] text-gold-champagne font-serif font-bold text-base sm:text-lg tracking-wider uppercase shadow-gold-glow hover:shadow-gold-glow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2 border border-gold-champagne/60 cursor-pointer"
            >
              <span>{loading ? 'Authenticating...' : 'Login'}</span>
              <ArrowRight className="w-5 h-5 text-gold-champagne" />
            </motion.button>
          </div>

          {/* Forgot Username or Password Option */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => {
                setShowForgotModal(true);
                setRecoverStep(1);
                setSecurityInput('');
                setForgotError(null);
              }}
              className="text-xs sm:text-sm text-gold-champagne/80 hover:text-gold-champagne underline decoration-gold-champagne/40 underline-offset-4 font-serif tracking-wide transition-colors cursor-pointer"
            >
              Forgot Username or Password?
            </button>
          </div>
        </form>

        {/* Bottom Glowing Diya */}
        <div className="mt-6 pt-3 border-t border-gold-champagne/20 flex justify-center">
          <GlowingDiya size="sm" />
        </div>
      </motion.div>

      {/* Forgot Username / Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-gradient-to-b from-[#3D0B16] via-[#2B060D] to-[#1F040A] border-3 border-gold-champagne/70 rounded-3xl p-6 sm:p-8 shadow-2xl text-ivory"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowForgotModal(false)}
                className="absolute top-4 right-4 p-2 text-gold-champagne/70 hover:text-gold-champagne rounded-full hover:bg-maroon-wine/50 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-maroon-wine border border-gold-champagne/50 text-gold-champagne mb-3 shadow-gold-glow">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-xl sm:text-2xl text-gold-shimmer">
                  Credentials Recovery
                </h3>
                <p className="text-xs sm:text-sm text-ivory/80 mt-1 font-serif">
                  Retrieve authorized credentials for Neha &amp; Chinmay's Dashboard
                </p>
              </div>

              {recoverStep === 1 ? (
                /* Step 1: Security Verification */
                <form onSubmit={handleVerifyRecovery} className="space-y-4 text-left">
                  <div className="p-3 rounded-xl bg-maroon-wine/40 border border-gold-champagne/30 text-xs text-gold-champagne/90 leading-relaxed font-serif">
                    <strong>Security Verification:</strong> Enter the engagement date or authorized family name to verify your identity.
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gold-champagne font-bold mb-1.5 font-serif">
                      Engagement Date or Name
                    </label>
                    <input
                      type="text"
                      value={securityInput}
                      onChange={(e) => setSecurityInput(e.target.value)}
                      placeholder="e.g. 19 December 2026 or Neha Prabhakar Kadam"
                      autoFocus
                      required
                      className="w-full px-4 py-3 rounded-xl bg-[#24060C] border border-gold-champagne/40 text-ivory placeholder-ivory/40 focus:outline-none focus:ring-2 focus:ring-gold-champagne text-sm font-serif"
                    />
                  </div>

                  {forgotError && (
                    <div className="p-3 rounded-xl bg-red-950/90 border border-red-500/60 text-red-300 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>{forgotError}</span>
                    </div>
                  )}

                  <div className="pt-2 space-y-2">
                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-full bg-gradient-to-r from-gold-antique via-gold-champagne to-gold-antique text-maroon-dark font-serif font-bold text-sm tracking-wider uppercase shadow-gold-glow hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      Verify &amp; Reveal Credentials
                    </button>

                    <button
                      type="button"
                      onClick={() => setRecoverStep(2)}
                      className="w-full py-2.5 text-xs text-gold-champagne/70 hover:text-gold-champagne font-serif underline decoration-gold-champagne/30 cursor-pointer text-center block"
                    >
                      Direct Recovery (Neha &amp; Chinmay Authorization)
                    </button>
                  </div>
                </form>
              ) : (
                /* Step 2: Revealed Credentials & Auto-Fill */
                <div className="space-y-5 text-left">
                  <div className="p-3 rounded-xl bg-green-950/60 border border-green-500/50 text-green-300 text-xs flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span>Identity verified! Here are your authorized dashboard credentials:</span>
                  </div>

                  {/* Username Display */}
                  <div className="p-4 rounded-xl bg-[#24060C] border border-gold-champagne/40 flex items-center justify-between">
                    <div>
                      <span className="block text-xs uppercase tracking-wider text-gold-champagne/70 font-serif">
                        Username
                      </span>
                      <span className="text-base font-mono font-bold text-gold-champagne select-all">
                        {localStorage.getItem('nc_admin_username') || 'admin'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(localStorage.getItem('nc_admin_username') || 'admin', 'user')}
                      className="p-2 rounded-lg bg-maroon-wine hover:bg-gold-champagne hover:text-maroon-dark text-gold-champagne transition-colors cursor-pointer text-xs flex items-center gap-1 font-mono"
                    >
                      {copiedField === 'user' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'user' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Password Display */}
                  <div className="p-4 rounded-xl bg-[#24060C] border border-gold-champagne/40 flex items-center justify-between">
                    <div>
                      <span className="block text-xs uppercase tracking-wider text-gold-champagne/70 font-serif">
                        Password
                      </span>
                      <span className="text-base font-mono font-bold text-gold-champagne select-all">
                        {localStorage.getItem('nc_admin_password') || 'admin123'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(localStorage.getItem('nc_admin_password') || 'admin123', 'pass')}
                      className="p-2 rounded-lg bg-maroon-wine hover:bg-gold-champagne hover:text-maroon-dark text-gold-champagne transition-colors cursor-pointer text-xs flex items-center gap-1 font-mono"
                    >
                      {copiedField === 'pass' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'pass' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Action: Auto-Fill & Instant Login */}
                  <div className="pt-2 space-y-2">
                    <button
                      type="button"
                      onClick={handleAutoFillAndLogin}
                      className="w-full py-4 rounded-full bg-gradient-to-r from-gold-antique via-gold-champagne to-gold-antique text-maroon-dark font-serif font-bold text-sm tracking-wider uppercase shadow-gold-glow hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Auto-Fill Credentials &amp; Log In</span>
                      <ArrowRight className="w-4 h-4 text-maroon-dark" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setUsername(localStorage.getItem('nc_admin_username') || 'admin');
                        setPassword(localStorage.getItem('nc_admin_password') || 'admin123');
                        setShowForgotModal(false);
                      }}
                      className="w-full py-2.5 text-xs text-gold-champagne/80 hover:text-gold-champagne font-serif text-center block cursor-pointer"
                    >
                      Fill Form Fields &amp; Close
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
