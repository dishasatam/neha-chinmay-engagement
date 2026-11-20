import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, HeartHandshake, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../hooks/useLanguage';
import { submitBlessing } from '../lib/supabase';
import { MarigoldGarland, GlowingDiya } from './DecorativeElements';

export default function Blessings({ guestProfile }) {
  const { t } = useLanguage();
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const MAX_CHARS = 300;
  const MIN_CHARS = 10;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const trimmed = message.trim();
    if (!trimmed || trimmed.length < MIN_CHARS) {
      setError(`Please write at least ${MIN_CHARS} characters for your blessing.`);
      return;
    }
    if (trimmed.length > MAX_CHARS) {
      setError(`Blessing cannot exceed ${MAX_CHARS} characters.`);
      return;
    }

    setIsSubmitting(true);
    const fullName = `${guestProfile?.firstName || 'Esteemed'} ${guestProfile?.surname || 'Guest'}`;

    try {
      const res = await submitBlessing({
        guestName: fullName,
        message: trimmed,
      });

      if (res.success) {
        setSubmitted(true);
        setMessage('');

        // Celebratory soft gold & rose petal confetti
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#D7B66F', '#B58E4C', '#FF9F1A', '#E82C48'],
          });
        } catch {}
      } else {
        setError(res.error || 'Could not submit blessing. Please try again.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="blessings" className="py-24 px-4 bg-gradient-to-b from-[#310912] via-[#24060C] to-[#1F040A] relative overflow-hidden">
      
      {/* Top Garland */}
      <div className="max-w-3xl mx-auto -mt-6 mb-8">
        <MarigoldGarland />
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        
        {/* Section Header (Matching Panel 8) */}
        <div className="text-center mb-12 flex flex-col items-center">
          <div className="flex justify-center mb-3">
            <span className="inline-flex items-center px-5 py-2 rounded-full bg-maroon-wine/80 border border-gold-champagne/50 text-gold-champagne text-xs sm:text-base font-serif uppercase tracking-widest font-semibold shadow-sm">
              {t('blessings.badge')}
            </span>
          </div>
          <h2 className="block w-full text-4xl sm:text-6xl font-serif font-bold text-gold-shimmer mb-2 drop-shadow-md">
            {t('blessings.title')}
          </h2>
          <p className="block text-ivory/90 text-xl sm:text-2xl font-serif italic">
            {t('blessings.subtitle')}
          </p>
        </div>

        {/* Blessings Card with Marigold & Ivory Interior */}
        <div className="bg-[#FAF5EB] rounded-3xl p-6 sm:p-10 border-4 border-gold-antique/70 shadow-2xl text-maroon-dark relative">
          
          {/* Guest Identity Tag */}
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gold-antique/30 text-sm sm:text-base text-maroon-wine font-serif font-semibold">
            <HeartHandshake className="w-5 h-5 text-gold-antique flex-shrink-0" />
            <span>
              {t('blessings.guestGreeting')}{' '}
              <strong className="text-maroon-dark">
                {guestProfile?.firstName} {guestProfile?.surname}
              </strong>
            </span>
          </div>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="thank-you"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8 space-y-4"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#641D2B] border-2 border-gold-antique text-gold-champagne shadow-lg">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-maroon-dark">
                  {t('blessings.thankYou')}
                </h3>
                <p className="text-maroon-wine/80 text-sm max-w-md mx-auto">
                  {t('blessings.disclaimer')}
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-8 py-2.5 rounded-full border border-gold-antique/50 text-sm font-serif font-bold text-maroon-dark hover:bg-gold-champagne transition-colors"
                >
                  Write another blessing
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="blessings-form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div>
                  <div className="flex justify-between items-center mb-2 text-sm text-maroon-wine font-bold">
                    <label className="uppercase tracking-wider">
                      {t('blessings.messageLabel')}
                    </label>
                    <span className={message.length > MAX_CHARS ? 'text-red-500' : 'text-maroon/70'}>
                      {message.length} / {MAX_CHARS} {t('blessings.charCount')}
                    </span>
                  </div>

                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t('blessings.messagePlaceholder')}
                    maxLength={MAX_CHARS}
                    className="w-full px-5 py-3.5 rounded-2xl bg-white border border-gold-antique/50 text-maroon-dark placeholder-maroon/40 focus:outline-none focus:ring-2 focus:ring-gold-antique/50 text-base sm:text-lg resize-none shadow-sm"
                  />
                  {error && (
                    <p className="text-red-600 text-sm mt-1 animate-fade-in font-medium">
                      {error}
                    </p>
                  )}
                </div>

                {/* Privacy Notice */}
                <div className="flex items-center gap-2 text-sm text-maroon-wine/80">
                  <ShieldCheck className="w-4 h-4 text-gold-antique flex-shrink-0" />
                  <span>{t('blessings.disclaimer')}</span>
                </div>

                {/* Submit Action in Crimson Pill (as in Panel 8) */}
                <div className="pt-2">
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 rounded-full bg-gradient-to-r from-[#641D2B] via-[#4A101D] to-[#310912] text-gold-champagne font-serif font-bold text-base sm:text-lg tracking-widest uppercase shadow-lg hover:shadow-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2 border border-gold-champagne/40"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? t('blessings.submitting') : t('blessings.submitBtn')}</span>
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

        </div>

        {/* Bottom Diya */}
        <div className="text-center mt-10">
          <GlowingDiya size="md" />
        </div>

      </div>
    </section>
  );
}
