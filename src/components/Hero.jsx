import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Sparkles } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { invitationConfig } from '../data/invitationConfig';
import { MarigoldGarland, HangingBell, GlowingDiya } from './DecorativeElements';

export default function Hero() {
  const { t, lang } = useLanguage();

  return (
    <section id="hero" className="relative min-h-[95vh] flex flex-col items-center justify-center pt-4 pb-16 px-4 overflow-hidden bg-gradient-to-b from-[#310912] via-[#24060C] to-[#1F040A]">
      
      {/* Top Hanging Marigold Garland & Temple Bells */}
      <div className="w-full max-w-5xl mx-auto -mt-2 mb-4 relative z-20">
        <MarigoldGarland />
        <div className="flex justify-between items-start px-8 sm:px-16 -mt-2">
          <HangingBell />
          <HangingBell className="hidden sm:flex" />
          <HangingBell />
          <HangingBell className="hidden sm:flex" />
          <HangingBell />
        </div>
      </div>

      {/* Warm Ambient Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[850px] h-[600px] sm:h-[850px] bg-gradient-radial from-[#80192A]/30 via-transparent to-transparent rounded-full blur-3xl pointer-events-none"></div>

      {/* Floating Gentle Festive Petals & Sparkle Dust */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(16)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: i % 2 === 0 ? '10px' : '7px',
              height: i % 2 === 0 ? '7px' : '10px',
              backgroundColor: i % 3 === 0 ? '#FF9F1A' : i % 2 === 0 ? '#FED330' : '#E82C48',
              top: `${(i * 17) % 100}%`,
              left: `${(i * 23) % 100}%`,
              opacity: 0.5,
              filter: 'blur(0.5px)',
            }}
            animate={{
              y: [0, 120, 240],
              x: [0, i % 2 === 0 ? 30 : -30, 0],
              rotate: [0, 180, 360],
              opacity: [0.1, 0.7, 0],
            }}
            transition={{
              duration: 8 + (i % 4),
              repeat: Infinity,
              ease: 'linear',
              delay: (i % 5) * 0.7,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
        
        {/* Auspicious Ganesha Shloka */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-maroon/90 border border-gold-champagne/60 text-gold-champagne text-sm sm:text-base font-serif tracking-widest uppercase mb-3 shadow-md font-semibold"
        >
          <Sparkles className="w-4 h-4 text-gold-champagne" />
          <span>{t('hero.ganeshShloka')}</span>
          <Sparkles className="w-4 h-4 text-gold-champagne" />
        </motion.div>

        {/* Pre-title: "You Are Cordially Invited to the Engagement of" */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="text-gold-champagne font-serif italic text-lg sm:text-2xl tracking-wide mb-2 leading-relaxed"
        >
          {t('hero.preTitle')}
        </motion.p>

        {/* Main Couple Name: Neha & Chinmay (Grand, Luxurious & Bold with ample matra breathing room) */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.93 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.25 }}
          className="font-serif text-5xl sm:text-7xl md:text-8xl font-bold tracking-wide text-gold-shimmer pt-3 pb-3 mb-2 drop-shadow-[0_4px_18px_rgba(215,182,111,0.5)] overflow-visible"
        >
          {invitationConfig.couple.bride[lang]} &amp; {invitationConfig.couple.groom[lang]}
        </motion.h1>

        {/* Subtitle: "A Beautiful Beginning" */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-ivory font-serif italic text-2xl sm:text-3xl tracking-wide mb-4 text-gold-champagne leading-relaxed pt-1"
        >
          {t('hero.subtitle')}
        </motion.p>

        {/* Poetic Quote with comfortable distance between lines */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.55 }}
          className="text-ivory/95 text-base sm:text-xl font-light max-w-xl mx-auto whitespace-pre-line leading-loose mb-8"
        >
          {t('hero.quote')}
        </motion.p>

        {/* Date Plaque: 19 December 2026 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="px-8 py-3 rounded-full border-2 border-gold-champagne/60 bg-gradient-to-r from-maroon-wine via-maroon to-maroon-wine shadow-gold-glow text-gold-champagne font-serif text-base sm:text-xl tracking-widest font-bold uppercase mb-8"
        >
          {invitationConfig.event.displayDate[lang]}
        </motion.div>

        {/* Photorealistic 3D Rendered Hero Artwork (Matching Panel 3) */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.85 }}
          className="relative w-full max-w-2xl mx-auto rounded-3xl overflow-hidden border-4 border-gold-champagne/70 shadow-2xl bg-gradient-to-b from-[#3D0B16] to-[#1F040A] p-2 sm:p-3 group"
        >
          <div className="relative rounded-2xl overflow-hidden">
            <img
              src="./images/hero-couple-realistic.jpg"
              alt="Neha & Chinmay - Royal Maharashtrian Engagement"
              className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-103 drop-shadow-2xl"
              onError={(e) => {
                e.currentTarget.src = './images/hero-main-card.jpg';
              }}
            />

            {/* Bottom Glow Overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#1F040A]/90 to-transparent pointer-events-none"></div>
          </div>
        </motion.div>

        {/* Flanking Brass Diyas at Bottom of Hero */}
        <div className="flex items-center justify-center gap-8 sm:gap-16 mt-6">
          <GlowingDiya size="md" />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="flex flex-col items-center gap-1.5 text-gold-champagne text-sm sm:text-base font-serif tracking-wider cursor-pointer hover:text-gold-light transition-colors"
            onClick={() => {
              const el = document.getElementById('invitation');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <span className="font-medium drop-shadow-sm">{t('hero.scrollPrompt')}</span>
            <ChevronDown className="w-5 h-5 animate-bounce text-gold-champagne" />
          </motion.div>
          <GlowingDiya size="md" />
        </div>

      </div>
    </section>
  );
}
