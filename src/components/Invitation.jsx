import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Calendar, Sparkles } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { invitationConfig } from '../data/invitationConfig';
import { MarigoldGarland, GlowingDiya } from './DecorativeElements';

export default function Invitation() {
  const { t, lang } = useLanguage();

  return (
    <section id="invitation" className="py-24 px-4 bg-mandap-pattern relative overflow-hidden">
      
      {/* Top Marigold Garland */}
      <div className="max-w-4xl mx-auto -mt-6 mb-8">
        <MarigoldGarland />
      </div>

      <div className="max-w-4xl mx-auto">
        
        {/* Card Outer Shadow Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8 }}
          className="relative bg-[#FAF5EB] rounded-3xl p-8 sm:p-14 shadow-2xl border-4 border-gold-antique/80"
        >
          {/* Ornate Corner Embellishments */}
          <div className="absolute top-3 left-3 w-10 h-10 border-t-3 border-l-3 border-gold-antique pointer-events-none"></div>
          <div className="absolute top-3 right-3 w-10 h-10 border-t-3 border-r-3 border-gold-antique pointer-events-none"></div>
          <div className="absolute bottom-3 left-3 w-10 h-10 border-b-3 border-l-3 border-gold-antique pointer-events-none"></div>
          <div className="absolute bottom-3 right-3 w-10 h-10 border-b-3 border-r-3 border-gold-antique pointer-events-none"></div>

          {/* Inner Inset Border */}
          <div className="absolute inset-4 border border-gold-antique/40 rounded-2xl pointer-events-none"></div>

          {/* Card Content */}
          <div className="text-center relative z-10 text-maroon-dark flex flex-col items-center">
            
            {/* Shloka */}
            <p className="text-maroon-wine font-serif tracking-widest text-sm sm:text-base font-bold uppercase mb-2">
              {t('invitation.shloka')}
            </p>

            {/* Introductory Blessings Text */}
            <p className="text-maroon-wine/90 font-serif italic text-base sm:text-lg max-w-lg mx-auto leading-relaxed mt-2">
              {t('invitation.intro')}
            </p>

            <p className="text-maroon font-light text-base sm:text-lg max-w-xl mx-auto mt-2 leading-relaxed">
              {t('invitation.body')}
            </p>

            {/* Couple Names Featured in Grand Bold Serif Typography */}
            <div className="my-6 sm:my-8 py-5 px-8 border-y-2 border-gold-antique/50 w-full max-w-lg flex flex-col items-center">
              <span className="font-serif text-4xl sm:text-6xl font-bold text-maroon-dark tracking-wide">
                {t('invitation.bride')}
              </span>
              <div className="flex items-center gap-4 my-2.5 text-gold-antique">
                <span className="h-[1.5px] w-16 bg-gold-antique"></span>
                <Heart className="w-6 h-6 fill-[#80192A] stroke-maroon-dark" />
                <span className="h-[1.5px] w-16 bg-gold-antique"></span>
              </div>
              <span className="font-serif text-4xl sm:text-6xl font-bold text-maroon-dark tracking-wide">
                {t('invitation.groom')}
              </span>
            </div>

            {/* Ceremony and Date Details */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-center gap-2 text-maroon-dark font-serif font-bold text-lg sm:text-xl">
                <Sparkles className="w-5 h-5 text-gold-antique" />
                <span>{t('invitation.ceremonyName')}</span>
                <Sparkles className="w-5 h-5 text-gold-antique" />
              </div>

              <div className="inline-flex items-center gap-3 px-8 py-3 rounded-full bg-gradient-to-r from-[#641D2B] via-[#4A101D] to-[#310912] border-2 border-gold-antique text-gold-champagne font-serif text-base sm:text-lg font-bold shadow-md">
                <Calendar className="w-5 h-5 text-gold-champagne" />
                <span>{invitationConfig.event.displayDate[lang]}</span>
              </div>
            </div>

            {/* Closing Sentiments */}
            <p className="text-maroon/85 font-serif italic text-sm sm:text-base max-w-md mx-auto leading-relaxed mt-2 border-t border-gold-antique/30 pt-4">
              {t('invitation.footerQuote')}
            </p>

            {/* Family Sign-off */}
            <p className="text-maroon-wine font-serif text-base sm:text-lg font-bold tracking-wider mt-4">
              {t('invitation.family')}
            </p>
          </div>
        </motion.div>

        {/* Bottom Diya */}
        <div className="text-center mt-8">
          <GlowingDiya size="md" />
        </div>

      </div>
    </section>
  );
}
