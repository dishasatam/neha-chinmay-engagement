import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

export default function OpeningEnvelope({ onOpenComplete }) {
  const { t, lang, toggleLanguage } = useLanguage();
  
  // Animation stages: 'sealed' -> 'unsealing' -> 'opening' -> 'rising' -> 'revealed'
  const [animationStage, setAnimationStage] = useState('sealed');
  const [isSkipped, setIsSkipped] = useState(false);

  const handleOpen = () => {
    if (animationStage !== 'sealed') return;

    // Stage 1: Royal wax seal pops with golden particles
    setAnimationStage('unsealing');

    // Stage 2: 3D flap unfolds backwards smoothly
    setTimeout(() => {
      setAnimationStage('opening');
    }, 600);

    // Stage 3: Invitation card slides upwards majestically
    setTimeout(() => {
      setAnimationStage('rising');
    }, 1300);

    // Stage 4: Card expands, shines and reveals celebration
    setTimeout(() => {
      setAnimationStage('revealed');
    }, 2200);

    // Stage 5: Smoothly transition to invitation website
    setTimeout(() => {
      onOpenComplete();
    }, 3600);
  };

  const handleSkip = () => {
    setIsSkipped(true);
    onOpenComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#180206] bg-toran-pattern p-3 sm:p-6 md:p-8 overflow-y-auto select-none">
      
      {/* Background Floating Petals & Ambient Sparkles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(28)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: i % 2 === 0 ? '12px' : '8px',
              height: i % 2 === 0 ? '8px' : '12px',
              backgroundColor: i % 3 === 0 ? '#E82C48' : i % 2 === 0 ? '#FF9F1A' : '#D7B66F',
              top: `${(i * 13) % 100}%`,
              left: `${(i * 19) % 100}%`,
              opacity: 0.65,
              filter: 'blur(0.4px)',
            }}
            animate={{
              y: [0, 160, 320],
              x: [0, i % 2 === 0 ? 40 : -40, 0],
              rotate: [0, 180, 360],
              opacity: [0.15, 0.85, 0],
            }}
            transition={{
              duration: 7 + (i % 5),
              repeat: Infinity,
              ease: 'linear',
              delay: (i % 7) * 0.4,
            }}
          />
        ))}
      </div>

      {/* Language Switcher Top Right */}
      <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-40">
        <button
          onClick={toggleLanguage}
          aria-label="Switch Language"
          className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-2.5 rounded-full bg-[#310912]/95 border-2 border-gold-champagne/80 text-gold-champagne hover:bg-gold-champagne hover:text-maroon-dark transition-all duration-300 text-sm sm:text-base font-serif font-bold tracking-wider shadow-2xl cursor-pointer"
        >
          <span>{lang === 'en' ? 'मराठी' : 'English'}</span>
        </button>
      </div>

      {/* Skip Button Top Left */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-40">
        <button
          onClick={handleSkip}
          className="text-sm sm:text-base text-gold-champagne/80 hover:text-gold-champagne underline decoration-gold-champagne/50 underline-offset-4 tracking-wider transition-colors font-serif py-2 px-1 cursor-pointer"
        >
          {t('envelope.skipBtn') || 'Skip to Invitation →'}
        </button>
      </div>

      {/* Main Center Stage - Majestic & Grand Proportions */}
      <div className="relative w-full max-w-2xl md:max-w-3xl lg:max-w-4xl flex flex-col items-center my-auto py-4 sm:py-6">
        
        {/* Above-Envelope Auspicious Titles */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-4 sm:mb-6 z-10"
        >
          <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-maroon-wine/80 border border-gold-champagne/50 text-gold-champagne text-xs sm:text-sm md:text-base font-serif font-bold uppercase tracking-widest mb-2 shadow-md">
            <Sparkles className="w-4 h-4 text-gold-champagne" />
            <span>॥ श्री गणेशाय नमः ॥</span>
            <Sparkles className="w-4 h-4 text-gold-champagne" />
          </div>

          <h1 className="text-gold-shimmer font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-wider mt-1 drop-shadow-xl">
            {lang === 'mr' ? 'साखरपुडा मंगल निमंत्रण' : 'Royal Sakharpuda Invitation'}
          </h1>
          <p className="text-ivory/95 font-serif italic text-sm sm:text-lg md:text-xl mt-1.5 font-light">
            {lang === 'mr' ? 'दोन जीवांचे एक बंधन, प्रीतीची रेशीमगाठ' : 'A celebration of love, promise & sacred togetherness'}
          </p>
        </motion.div>

        {/* ==================== 3D REALISTIC VELVET ENVELOPE (LARGE & RESPONSIVE) ==================== */}
        <div 
          style={{
            perspective: '1800px',
            WebkitPerspective: '1800px',
          }}
          className="relative w-full aspect-[1.55/1] min-h-[320px] sm:min-h-[420px] md:min-h-[480px] lg:min-h-[530px] flex items-center justify-center"
        >
          
          {/* Deep Ambient Shadow Under Envelope */}
          <div className="absolute -inset-6 bg-black/85 blur-3xl transform translate-y-12 rounded-3xl pointer-events-none"></div>

          {/* Envelope Outer Shell */}
          <div 
            style={{
              transformStyle: 'preserve-3d',
              WebkitTransformStyle: 'preserve-3d',
            }}
            className="relative w-full h-full rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#5C0E1F] via-[#3B0711] to-[#220308] border-3 sm:border-4 border-gold-champagne/85 shadow-[0_35px_80px_rgba(0,0,0,0.95)] overflow-visible"
          >
            
            {/* Corner Gold Embroidery Filigree */}
            <div className="absolute top-2.5 left-2.5 w-9 h-9 sm:w-14 sm:h-14 border-t-2 sm:border-t-3 border-l-2 sm:border-l-3 border-gold-champagne pointer-events-none z-30"></div>
            <div className="absolute top-2.5 right-2.5 w-9 h-9 sm:w-14 sm:h-14 border-t-2 sm:border-t-3 border-r-2 sm:border-r-3 border-gold-champagne pointer-events-none z-30"></div>
            <div className="absolute bottom-2.5 left-2.5 w-9 h-9 sm:w-14 sm:h-14 border-b-2 sm:border-b-3 border-l-2 sm:border-l-3 border-gold-champagne pointer-events-none z-30"></div>
            <div className="absolute bottom-2.5 right-2.5 w-9 h-9 sm:w-14 sm:h-14 border-b-2 sm:border-b-3 border-r-2 sm:border-r-3 border-gold-champagne pointer-events-none z-30"></div>

            {/* Subtle Inner Gold Stitching */}
            <div className="absolute inset-2 sm:inset-4 border border-gold-champagne/35 rounded-xl sm:rounded-2xl pointer-events-none z-30"></div>

            {/* Deep Crimson Silk Lining Inside Envelope (Visible when open) */}
            <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#8C162E] via-[#540917] to-[#2A040B] shadow-inner pointer-events-none">
              <div className="absolute inset-4 sm:inset-6 border border-gold-champagne/25 rounded-xl pointer-events-none"></div>
            </div>

            {/* ==================== INVITATION CARD (SLIDING OUT & EXPANDING) ==================== */}
            <motion.div
              initial={{ y: 0, scale: 0.94, opacity: 0 }}
              animate={
                animationStage === 'revealed'
                  ? { y: -190, scale: 1.05, opacity: 1, zIndex: 45 }
                  : animationStage === 'rising'
                  ? { y: -150, scale: 1.02, opacity: 1, zIndex: 45 }
                  : animationStage === 'opening'
                  ? { y: -40, scale: 0.97, opacity: 0.9, zIndex: 15 }
                  : { y: 0, scale: 0.94, opacity: 0, zIndex: 10 }
              }
              transition={{
                duration: animationStage === 'revealed' ? 0.9 : 1.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{
                WebkitBackfaceVisibility: 'hidden',
                backfaceVisibility: 'hidden',
              }}
              className="absolute left-3 right-3 sm:left-8 sm:right-8 top-4 bottom-4 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#FFFDF9] via-[#FAF5EB] to-[#F3EADB] border-3 sm:border-4 border-gold-antique shadow-[0_25px_60px_rgba(0,0,0,0.85)] p-5 sm:p-8 md:p-10 text-maroon-dark flex flex-col items-center justify-between text-center select-none"
            >
              {/* Ornate Gold Filigree Inner Border on Card */}
              <div className="absolute inset-2 sm:inset-3 border-2 border-gold-antique/40 rounded-xl sm:rounded-2xl pointer-events-none"></div>
              <div className="absolute inset-3 sm:inset-5 border border-gold-antique/20 rounded-lg sm:rounded-xl pointer-events-none"></div>

              {/* Card Top Crest */}
              <div className="relative z-10 pt-1">
                <span className="text-xs sm:text-sm md:text-base font-serif text-gold-antique tracking-widest uppercase font-bold flex items-center justify-center gap-2">
                  <span>॥ श्री गणेशाय नमः ॥</span>
                </span>
                <p className="text-xs sm:text-sm text-maroon font-serif uppercase tracking-widest mt-1">
                  {lang === 'mr' ? 'कदम व पवार परिवाराचे आदरपूर्वक आमंत्रण' : 'Cordial Invitation by Kadam & Pawar Families'}
                </p>
              </div>

              {/* Card Main Monogram & Names (Clean Neha & Chinmay per instructions) */}
              <div className="relative z-10 my-auto py-1 sm:py-2">
                <div className="w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 mx-auto rounded-full bg-gradient-to-br from-[#641D2B] to-[#310912] border-2 border-gold-champagne flex items-center justify-center text-gold-champagne font-serif font-bold text-lg sm:text-2xl shadow-md mb-2 sm:mb-3">
                  {lang === 'mr' ? 'ने & चि' : 'N & C'}
                </div>

                <h3 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-maroon-dark tracking-wide drop-shadow-sm leading-snug">
                  {lang === 'mr' ? 'नेहा आणि चिन्मय' : 'Neha & Chinmay'}
                </h3>
                
                <p className="text-sm sm:text-lg md:text-xl text-maroon-wine font-serif font-semibold mt-1.5">
                  {lang === 'mr' ? 'साखरपुडा समारंभ (Engagement Ceremony)' : 'Royal Sakharpuda Ceremony'}
                </p>
                <p className="text-xs sm:text-base md:text-lg text-maroon font-serif mt-1">
                  {lang === 'mr' ? 'सुप्रीम बँक्वेट्स हॉल, ठाणे (पश्चिम)' : 'Supreme Banquets Hall, Thane West'}
                </p>
              </div>

              {/* Card Date & Muhurat Footer */}
              <div className="relative z-10 w-full pt-3 border-t border-gold-antique/30 flex items-center justify-between text-xs sm:text-sm md:text-base font-serif text-maroon">
                <span className="font-bold text-maroon-dark">
                  {lang === 'mr' ? 'शनिवार, १९ डिसेंबर २०२६' : 'Saturday, 19 Dec 2026'}
                </span>
                <span className="px-3 py-1 rounded-full bg-gold-champagne/30 text-maroon-dark font-mono font-bold text-xs sm:text-sm">
                  {lang === 'mr' ? 'शुभ मुहूर्त: सकाळी १०:३० वा.' : 'Muhurat: 10:30 AM'}
                </span>
              </div>
            </motion.div>

            {/* ==================== ENVELOPE FRONT POCKET (V-SHAPE) ==================== */}
            <div 
              style={{
                clipPath: 'polygon(0 0, 50% 50%, 100% 0, 100% 100%, 0 100%)',
              }}
              className="absolute inset-0 bg-gradient-to-t from-[#420914] via-[#520C1A] to-[#630E1F] rounded-2xl sm:rounded-3xl border-t border-gold-champagne/40 shadow-[0_-8px_25px_rgba(0,0,0,0.45)] z-20 pointer-events-none"
            >
              {/* Pocket Trim Line */}
              <div
                style={{ clipPath: 'polygon(0 0, 50% 50%, 100% 0, 100% 3.5px, 50% calc(50% + 3.5px), 0 3.5px)' }}
                className="absolute inset-0 bg-gradient-to-r from-gold-antique via-gold-champagne to-gold-antique opacity-90"
              />
            </div>

            {/* ==================== 3D TOP FOLDING FLAP ==================== */}
            <motion.div
              initial={{ rotateX: 0 }}
              animate={
                animationStage !== 'sealed' && animationStage !== 'unsealing'
                  ? { rotateX: -180, zIndex: 5 }
                  : { rotateX: 0, zIndex: 35 }
              }
              transition={{ duration: 0.95, ease: [0.4, 0, 0.2, 1] }}
              style={{
                transformOrigin: 'top center',
                transformStyle: 'preserve-3d',
                WebkitTransformStyle: 'preserve-3d',
                WebkitBackfaceVisibility: 'hidden',
                backfaceVisibility: 'hidden',
                clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              }}
              className="absolute top-0 left-0 right-0 h-[56%] bg-gradient-to-b from-[#6D1325] via-[#520E1C] to-[#3B0711] border-b-2 border-gold-champagne/75 shadow-[0_15px_40px_rgba(0,0,0,0.85)] pointer-events-none"
            >
              {/* Flap Gold Embroidered Edge */}
              <div
                className="absolute inset-x-0 bottom-0 h-2.5 sm:h-3 bg-gradient-to-r from-gold-antique via-gold-champagne to-gold-antique opacity-95"
                style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}
              />
            </motion.div>

            {/* ==================== 3D ROYAL WAX SEAL (CLICKABLE) ==================== */}
            <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
              <motion.div
                whileHover={animationStage === 'sealed' ? { scale: 1.08 } : {}}
                whileTap={animationStage === 'sealed' ? { scale: 0.94 } : {}}
                onClick={handleOpen}
                animate={
                  animationStage === 'unsealing'
                    ? { scale: [1, 1.3, 0], opacity: [1, 1, 0], rotate: [0, 15, 30] }
                    : animationStage !== 'sealed'
                    ? { scale: 0, opacity: 0 }
                    : { scale: 1, opacity: 1 }
                }
                transition={{ duration: 0.45 }}
                className={`pointer-events-auto cursor-pointer relative group flex flex-col items-center ${
                  animationStage !== 'sealed' ? 'pointer-events-none' : ''
                }`}
              >
                {/* Radiant Pulsing Aura */}
                <div className="absolute -inset-10 bg-gold-champagne/35 rounded-full blur-2xl group-hover:bg-gold-champagne/65 group-hover:scale-125 transition-all duration-300 animate-pulse"></div>

                {/* 3D Wax Seal Image - Larger, Grand & Regal */}
                <img
                  src="/images/wax-seal.svg"
                  alt="Royal Wax Seal"
                  className="w-32 h-32 sm:w-44 sm:h-44 md:w-52 md:h-52 drop-shadow-[0_18px_35px_rgba(0,0,0,0.85)] group-hover:drop-shadow-[0_24px_50px_rgba(215,182,111,0.7)] transition-all"
                />

                <span className="text-gold-champagne text-xs sm:text-base mt-2 sm:mt-3.5 tracking-widest font-serif font-bold drop-shadow-md flex items-center gap-2 animate-pulse bg-maroon-dark/90 px-4 py-1.5 rounded-full border border-gold-champagne/60 shadow-lg">
                  <Sparkles className="w-4 h-4 text-gold-champagne" />
                  <span>{t('envelope.tapPrompt') || 'Tap Wax Seal to Open'}</span>
                  <Sparkles className="w-4 h-4 text-gold-champagne" />
                </span>
              </motion.div>
            </div>

          </div>
        </div>

        {/* ==================== "OPEN INVITATION" ACTION BUTTON ==================== */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-6 sm:mt-8 z-30 text-center w-full max-w-md sm:max-w-lg"
        >
          <motion.button
            whileHover={animationStage === 'sealed' ? { scale: 1.05 } : {}}
            whileTap={animationStage === 'sealed' ? { scale: 0.95 } : {}}
            onClick={handleOpen}
            disabled={animationStage !== 'sealed'}
            className="w-full py-4 sm:py-5 px-8 rounded-full bg-gradient-to-r from-gold-antique via-gold-champagne to-gold-antique text-maroon-dark font-serif font-bold text-base sm:text-xl tracking-widest uppercase shadow-gold-glow hover:shadow-gold-glow-lg transition-all duration-300 border-2 border-gold-light cursor-pointer flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-wait"
          >
            <span>
              {animationStage === 'sealed'
                ? t('envelope.openBtn') || 'Open Invitation'
                : lang === 'mr'
                ? 'सोहळ्यात प्रवेश करत आहे...'
                : 'Entering Royal Invitation...'}
            </span>
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-maroon-dark" />
          </motion.button>
        </motion.div>

      </div>
    </div>
  );
}
