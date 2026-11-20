import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Sparkles, ArrowRight } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { MarigoldGarland, GlowingDiya } from './DecorativeElements';

export default function GuestWelcome({ onIdentify, isTracking }) {
  const { t, lang, toggleLanguage } = useLanguage();
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};

    // Validate First Name (supports Latin and Devanagari with combining marks)
    const trimmedFirst = firstName.trim();
    if (!trimmedFirst) {
      newErrors.firstName = t('guest.errors.firstNameRequired');
    } else if (trimmedFirst.length < 2) {
      newErrors.firstName = t('guest.errors.minChars');
    } else if (trimmedFirst.length > 50) {
      newErrors.firstName = t('guest.errors.maxChars');
    } else if (!/^[\p{L}\p{M}\s'-]+$/u.test(trimmedFirst)) {
      newErrors.firstName = t('guest.errors.invalidChars');
    }

    // Validate Surname
    const trimmedSurname = surname.trim();
    if (!trimmedSurname) {
      newErrors.surname = t('guest.errors.surnameRequired');
    } else if (trimmedSurname.length < 2) {
      newErrors.surname = t('guest.errors.minChars');
    } else if (trimmedSurname.length > 50) {
      newErrors.surname = t('guest.errors.maxChars');
    } else if (!/^[\p{L}\p{M}\s'-]+$/u.test(trimmedSurname)) {
      newErrors.surname = t('guest.errors.invalidChars');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    const result = await onIdentify(trimmedFirst, trimmedSurname);
    setIsSubmitting(false);

    if (!result?.success) {
      if (result?.field === 'firstName') {
        setErrors({ firstName: t(`guest.errors.${result.reason}`) });
      } else if (result?.field === 'surname') {
        setErrors({ surname: t(`guest.errors.${result.reason}`) });
      } else {
        setErrors({ general: 'Validation failed. Please check inputs.' });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2B060D] bg-toran-pattern p-4 sm:p-6 overflow-y-auto">
      {/* Language Switcher Top Right */}
      <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-20">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#3B0711]/90 border-2 border-gold-champagne/70 text-gold-champagne hover:bg-gold-champagne hover:text-maroon-dark transition-all duration-300 text-sm sm:text-base font-serif font-bold tracking-wider shadow-lg cursor-pointer"
        >
          <span>{lang === 'en' ? 'मराठी' : 'English'}</span>
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-lg bg-[#FAF5EB] border-4 border-gold-antique/80 rounded-3xl shadow-2xl p-6 sm:p-10 text-maroon-dark my-auto"
      >
        {/* Top Marigold Garland Arch */}
        <div className="-mt-3 mb-3">
          <MarigoldGarland />
        </div>

        {/* Decorative Corner Accents */}
        <div className="absolute top-3 left-3 w-8 h-8 sm:w-10 sm:h-10 border-t-2 border-l-2 border-gold-antique/70 pointer-events-none"></div>
        <div className="absolute top-3 right-3 w-8 h-8 sm:w-10 sm:h-10 border-t-2 border-r-2 border-gold-antique/70 pointer-events-none"></div>
        <div className="absolute bottom-3 left-3 w-8 h-8 sm:w-10 sm:h-10 border-b-2 border-l-2 border-gold-antique/70 pointer-events-none"></div>
        <div className="absolute bottom-3 right-3 w-8 h-8 sm:w-10 sm:h-10 border-b-2 border-r-2 border-gold-antique/70 pointer-events-none"></div>

        {/* Header Content */}
        <div className="text-center mb-6">
          <p className="text-gold-antique font-serif text-sm sm:text-base tracking-widest uppercase font-bold">
            ॥ श्री गणेशाय नमः ॥
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-maroon-dark mt-1 drop-shadow-sm">
            {t('guest.title')}
          </h2>
          <p className="text-maroon-wine text-base sm:text-lg mt-2 font-serif italic max-w-md mx-auto leading-relaxed">
            {t('guest.subtitle')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 relative z-10" noValidate>
          {/* First Name Field */}
          <div>
            <label className="block text-sm sm:text-base uppercase tracking-wider text-maroon-wine font-bold mb-1.5 font-serif">
              {t('guest.firstNameLabel')} <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                if (errors.firstName) setErrors((prev) => ({ ...prev, firstName: null }));
              }}
              placeholder={t('guest.firstNamePlaceholder')}
              maxLength={50}
              autoFocus
              className={`w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl bg-white border text-base sm:text-lg text-maroon-dark placeholder-maroon/40 focus:outline-none focus:ring-2 shadow-sm transition-all ${
                errors.firstName
                  ? 'border-red-500 focus:ring-red-400'
                  : 'border-gold-antique/50 focus:border-gold-antique focus:ring-gold-champagne/40'
              }`}
            />
            {errors.firstName && (
              <p className="text-red-600 text-xs sm:text-sm mt-1 animate-fade-in font-medium">
                {errors.firstName}
              </p>
            )}
          </div>

          {/* Surname Field */}
          <div>
            <label className="block text-sm sm:text-base uppercase tracking-wider text-maroon-wine font-bold mb-1.5 font-serif">
              {t('guest.surnameLabel')} <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={surname}
              onChange={(e) => {
                setSurname(e.target.value);
                if (errors.surname) setErrors((prev) => ({ ...prev, surname: null }));
              }}
              placeholder={t('guest.surnamePlaceholder')}
              maxLength={50}
              className={`w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl bg-white border text-base sm:text-lg text-maroon-dark placeholder-maroon/40 focus:outline-none focus:ring-2 shadow-sm transition-all ${
                errors.surname
                  ? 'border-red-500 focus:ring-red-400'
                  : 'border-gold-antique/50 focus:border-gold-antique focus:ring-gold-champagne/40'
              }`}
            />
            {errors.surname && (
              <p className="text-red-600 text-xs sm:text-sm mt-1 animate-fade-in font-medium">
                {errors.surname}
              </p>
            )}
          </div>

          {/* Enter Button in Deep Crimson Pill with Arrow (Matching Panel 2) */}
          <div className="pt-2">
            <motion.button
              type="submit"
              disabled={isSubmitting || isTracking}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 sm:py-4.5 rounded-full bg-gradient-to-r from-[#641D2B] via-[#4A101D] to-[#310912] text-gold-champagne font-serif font-bold text-lg sm:text-xl tracking-wider uppercase shadow-gold-glow hover:shadow-gold-glow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-3 border border-gold-champagne/50 cursor-pointer"
            >
              <span>{isSubmitting ? t('guest.submitting') : t('guest.enterBtn')}</span>
              <ArrowRight className="w-5 h-5 text-gold-champagne" />
            </motion.button>
          </div>

          {/* Privacy Notice */}
          <div className="flex items-center justify-center gap-2 text-maroon-wine/80 text-xs sm:text-sm pt-2">
            <Shield className="w-4 h-4 text-gold-antique flex-shrink-0" />
            <p className="text-center font-normal">
              {t('guest.privacyNotice')}
            </p>
          </div>
        </form>

        {/* Bottom Glowing Diyas */}
        <div className="flex justify-between items-center px-4 mt-5 pt-3 border-t border-gold-antique/20">
          <GlowingDiya size="sm" />
          <div className="h-[1px] flex-1 bg-gold-antique/30 mx-4"></div>
          <GlowingDiya size="sm" />
        </div>
      </motion.div>
    </div>
  );
}
