import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Info } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { invitationConfig } from '../data/invitationConfig';
import { GlowingDiya } from './DecorativeElements';

export default function Countdown() {
  const { t } = useLanguage();

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isCompleted: false,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const targetTime = new Date(invitationConfig.event.targetCountdownISO).getTime();
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isCompleted: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isCompleted: false });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeUnits = [
    { label: t('countdown.days'), value: timeLeft.days },
    { label: t('countdown.hours'), value: timeLeft.hours },
    { label: t('countdown.minutes'), value: timeLeft.minutes },
    { label: t('countdown.seconds'), value: timeLeft.seconds },
  ];

  return (
    <section id="countdown" className="py-24 px-4 bg-gradient-to-b from-[#310912] via-[#24060C] to-[#1F040A] relative overflow-hidden">
      <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
        
        {/* Badge */}
        <div className="flex justify-center mb-3">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-maroon-wine/80 border border-gold-champagne/50 text-gold-champagne text-xs sm:text-base font-serif uppercase tracking-widest font-semibold shadow-sm">
            <Clock className="w-4 h-4 text-gold-champagne" />
            <span>{t('countdown.badge')}</span>
          </div>
        </div>

        {/* Title with full matra visibility */}
        <h2 className="block w-full text-4xl sm:text-6xl font-serif font-bold text-gold-shimmer pt-2 pb-2 mb-3 drop-shadow-md overflow-visible leading-relaxed">
          {t('countdown.title')}
        </h2>
        <p className="block text-ivory/90 text-base sm:text-xl font-serif italic mb-10 leading-relaxed pt-1">
          {t('countdown.subtitle')}
        </p>

        {/* 4 Golden Countdown Boxes (Larger, Regal, Matching Panel 6) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-3xl mx-auto mb-10">
          {timeUnits.map((unit, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05, y: -4 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#5E1220] via-[#4A0D18] to-[#2B060D] border-3 border-gold-champagne/60 shadow-royal flex flex-col items-center justify-center group hover:border-gold-champagne hover:shadow-gold-glow transition-all"
            >
              {/* Inner Glow Border */}
              <div className="absolute inset-2 border border-gold-champagne/20 rounded-2xl pointer-events-none"></div>

              {/* Number with subtle tick transition */}
              <motion.span
                key={unit.value}
                initial={{ opacity: 0.8, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="font-serif text-4xl sm:text-6xl font-bold text-gold-shimmer tabular-nums drop-shadow-md"
              >
                {String(unit.value).padStart(2, '0')}
              </motion.span>

              {/* Unit Label */}
              <span className="text-sm sm:text-base font-serif tracking-widest uppercase text-ivory/95 mt-2 font-bold">
                {unit.label}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Glowing Diya Centered Below (as in Panel 6) */}
        <div className="mb-8">
          <GlowingDiya size="lg" />
        </div>

        {/* Disclaimer / Target Note */}
        <div className="inline-flex items-start sm:items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#3D0B16]/90 border border-gold-champagne/40 text-ivory/90 text-sm sm:text-base max-w-xl mx-auto text-left sm:text-center shadow-lg">
          <Info className="w-5 h-5 text-gold-champagne flex-shrink-0 mt-0.5 sm:mt-0" />
          <p className="leading-relaxed">
            {t('countdown.targetNote')}
          </p>
        </div>

      </div>
    </section>
  );
}
