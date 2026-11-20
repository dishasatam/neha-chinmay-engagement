import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Compass } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { MarigoldGarland, GlowingDiya } from './DecorativeElements';

export default function OurStory() {
  const { t, lang } = useLanguage();

  const chapters = [
    {
      num: '01',
      title: t('ourStory.milestone1Title'),
      desc: t('ourStory.milestone1Desc'),
      icon: Compass,
    },
    {
      num: '02',
      title: t('ourStory.milestone2Title'),
      desc: t('ourStory.milestone2Desc'),
      icon: Sparkles,
    },
    {
      num: '03',
      title: t('ourStory.milestone3Title'),
      desc: t('ourStory.milestone3Desc'),
      icon: Heart,
    },
  ];

  return (
    <section id="our-story" className="py-24 px-4 bg-gradient-to-b from-[#2B060D] via-[#24060C] to-[#310912] relative overflow-hidden">
      
      {/* Top Marigold Garland */}
      <div className="max-w-4xl mx-auto -mt-6 mb-8">
        <MarigoldGarland />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 flex flex-col items-center">
          <div className="flex justify-center mb-3">
            <span className="inline-flex items-center px-5 py-2 rounded-full bg-maroon-wine/80 border border-gold-champagne/50 text-gold-champagne text-xs sm:text-base font-serif uppercase tracking-widest font-semibold shadow-sm">
              {t('ourStory.badge')}
            </span>
          </div>
          <h2 className="block w-full text-4xl sm:text-6xl font-serif font-bold text-gold-shimmer pt-2 pb-2 mb-4 drop-shadow-md overflow-visible leading-relaxed">
            {t('ourStory.title')}
          </h2>
          <p className="block text-ivory/95 text-lg sm:text-2xl max-w-2xl mx-auto font-serif italic leading-relaxed pt-1">
            {t('ourStory.subtitle')}
          </p>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Visual: High-Resolution Sunset Couple Card (Crisp & High-Res) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5"
          >
            <div className="relative rounded-3xl overflow-hidden border-4 border-gold-antique/80 shadow-2xl bg-gradient-to-b from-[#5E1220] to-[#2B060D] p-2.5 sm:p-3 group">
              <div className="rounded-2xl overflow-hidden relative">
                <img
                  src="./images/story-couple-sunset.jpg"
                  alt="Our Story - Neha & Chinmay Sunset"
                  className="w-full h-auto object-cover transform group-hover:scale-104 transition-transform duration-700"
                />
                
                {/* Overlay Text */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1F040A]/90 via-transparent to-transparent flex items-end p-6">
                  <div>
                    <p className="text-gold-champagne font-serif text-xl sm:text-2xl font-bold">
                      {lang === 'mr' ? 'एकमेकांचा हात हातात' : 'Hand in Hand'}
                    </p>
                    <p className="text-ivory/90 text-sm font-light mt-1">
                      {t('ourStory.figurineNote')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Story Milestones */}
          <div className="lg:col-span-7 space-y-6">
            {chapters.map((chap, idx) => {
              const Icon = chap.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.15 }}
                  className="relative p-6 sm:p-7 rounded-2xl bg-[#3D0B16]/80 border border-gold-champagne/30 hover:border-gold-champagne/70 transition-all duration-300 shadow-xl group flex gap-5 items-start"
                >
                  {/* Step Number / Icon */}
                  <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#641D2B] to-[#310912] border-2 border-gold-champagne/50 flex items-center justify-center text-gold-champagne shadow-gold-glow group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Text Content */}
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm text-gold-champagne font-mono font-bold px-2.5 py-0.5 rounded-full bg-maroon-dark border border-gold-champagne/40">
                        {chap.num}
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-serif font-bold text-gold-champagne">
                        {chap.title}
                      </h3>
                    </div>
                    <p className="text-ivory/95 text-base sm:text-lg font-light leading-relaxed">
                      {chap.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>

        {/* Bottom Diya Accent */}
        <div className="text-center mt-12">
          <GlowingDiya size="md" />
        </div>

      </div>
    </section>
  );
}
