import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Navigation, Copy, Check, ExternalLink } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { invitationConfig } from '../data/invitationConfig';
import { MarigoldGarland, GlowingDiya } from './DecorativeElements';

export default function EventDetails() {
  const { t, lang } = useLanguage();
  const [copied, setCopied] = useState(false);

  const venue = invitationConfig.event.venue;
  const venueName = venue[`name${lang === 'mr' ? 'Mr' : 'En'}`];
  const venueAddress = venue[`address${lang === 'mr' ? 'Mr' : 'En'}`];
  const venueLandmark = venue[`landmark${lang === 'mr' ? 'Mr' : 'En'}`];

  const handleCopyAddress = () => {
    const fullText = `${venueName}, ${venueAddress}`;
    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }).catch(() => {
      // fallback
      const textArea = document.createElement('textarea');
      textArea.value = fullText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const details = [
    {
      icon: Calendar,
      title: t('eventDetails.dateTitle'),
      value: invitationConfig.event.displayDate[lang],
      subnote: lang === 'mr' ? 'शुभ मुहूर्त शनिवार' : 'Auspicious Saturday Celebration',
    },
    {
      icon: Clock,
      title: t('eventDetails.timeTitle'),
      value: invitationConfig.event.time[lang],
      subnote: t('eventDetails.timeNote'),
    },
    {
      icon: MapPin,
      title: t('eventDetails.venueTitle'),
      value: venueName,
      subnote: venueAddress,
    },
  ];

  return (
    <section id="event-details" className="py-24 px-4 bg-mandap-pattern relative overflow-hidden">
      
      {/* Top Marigold Garland */}
      <div className="max-w-4xl mx-auto -mt-6 mb-8">
        <MarigoldGarland />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 flex flex-col items-center">
          <div className="flex justify-center mb-3">
            <span className="inline-flex items-center px-5 py-2 rounded-full bg-maroon-wine/80 border border-gold-champagne/50 text-gold-champagne text-xs sm:text-base font-serif uppercase tracking-widest font-semibold shadow-sm">
              {t('eventDetails.badge')}
            </span>
          </div>
          <h2 className="block w-full text-4xl sm:text-6xl font-serif font-bold text-gold-shimmer pt-2 pb-2 mb-3 drop-shadow-md overflow-visible leading-relaxed">
            {t('eventDetails.title')}
          </h2>
          <p className="block text-ivory/95 text-xl sm:text-2xl font-serif italic pt-1 leading-relaxed">
            {t('eventDetails.subtitle')}
          </p>
        </div>

        {/* 3 Ivory Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto mb-14">
          {details.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className="relative bg-[#FAF5EB] rounded-3xl p-7 sm:p-8 border-4 border-gold-antique/70 shadow-2xl flex flex-col items-center text-center group hover:-translate-y-2 transition-all duration-300 min-h-[310px] justify-between"
              >
                {/* Gold Ornamental Inner Frame */}
                <div className="absolute inset-3 border border-gold-antique/30 rounded-2xl pointer-events-none"></div>

                <div className="flex flex-col items-center w-full">
                  {/* Floating Top Icon */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#641D2B] to-[#310912] border-2 border-gold-antique flex items-center justify-center text-gold-champagne shadow-lg mb-5 group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7" />
                  </div>

                  {/* Card Title */}
                  <span className="text-sm sm:text-base uppercase tracking-widest font-serif font-bold text-maroon-wine mb-2">
                    {item.title}
                  </span>

                  {/* Card Main Value */}
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-maroon-dark my-2 leading-[1.5] sm:leading-[1.55] px-2 overflow-visible">
                    {item.value}
                  </h3>
                </div>

                {/* Explanatory Subnote nicely spaced at bottom */}
                <div className="mt-4 pt-3 border-t border-gold-antique/25 w-full">
                  <p className="text-base sm:text-lg text-maroon/90 italic font-serif leading-relaxed">
                    {item.subnote}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Interactive Google Map & Directions Card */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-5xl mx-auto bg-[#FAF5EB] rounded-3xl p-6 sm:p-10 border-4 border-gold-antique/70 shadow-2xl relative overflow-hidden mb-16"
        >
          {/* Gold Decorative Corner Badges */}
          <div className="absolute top-3 left-3 text-gold-antique/40 text-xs font-serif">❖</div>
          <div className="absolute top-3 right-3 text-gold-antique/40 text-xs font-serif">❖</div>
          <div className="absolute bottom-3 left-3 text-gold-antique/40 text-xs font-serif">❖</div>
          <div className="absolute bottom-3 right-3 text-gold-antique/40 text-xs font-serif">❖</div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gold-antique/30">
            <div>
              <div className="flex items-center gap-2.5 text-maroon-wine font-serif font-bold text-sm sm:text-base uppercase tracking-wider mb-2">
                <MapPin className="w-5 h-5 text-gold-antique animate-bounce" />
                <span>{t('eventDetails.mapTitle') || 'Interactive Location Map & Route'}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-maroon-dark">
                {venueName}
              </h3>
              <p className="text-maroon/85 text-base sm:text-lg font-serif mt-1">
                {venueAddress}
              </p>
              {venueLandmark && (
                <p className="text-sm sm:text-base text-gold-dark font-sans font-medium mt-1.5">
                  📍 {venueLandmark}
                </p>
              )}
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={venue.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-maroon-wine via-maroon to-maroon-dark text-gold-champagne font-serif font-semibold text-sm sm:text-base border border-gold-antique shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <Navigation className="w-4 h-4 text-gold-champagne" />
                <span>{t('eventDetails.mapDirectionsBtn') || 'Get Directions on Google Maps'}</span>
                <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
              </a>

              <button
                type="button"
                onClick={handleCopyAddress}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-ivory-light border-2 border-gold-antique/70 text-maroon-dark font-serif font-medium text-sm sm:text-base shadow hover:bg-gold-champagne/20 transition-all duration-300"
                title="Copy Address"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">{t('eventDetails.addressCopied') || 'Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-gold-dark" />
                    <span>{t('eventDetails.copyAddressBtn') || 'Copy Address'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Embedded Google Maps View */}
          <div className="mt-6 rounded-2xl overflow-hidden border-2 border-gold-antique/40 shadow-inner bg-maroon-dark/5 relative h-72 sm:h-96 w-full">
            <iframe
              title="Supreme Banquets Hall Location Map"
              src={venue.mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full filter saturate-110"
            />
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-sm text-maroon/80 font-serif">
            <span>Supreme Banquets Hall, Manpada, Thane West, Thane - 400610</span>
            <span className="mt-1 sm:mt-0 font-medium text-gold-dark">Google Maps GPS Navigation Enabled</span>
          </div>
        </motion.div>

        {/* Bottom Glowing Samai Diyas */}
        <div className="flex items-center justify-center gap-12 sm:gap-24">
          <GlowingDiya size="lg" />
          <GlowingDiya size="lg" />
        </div>

      </div>
    </section>
  );
}
