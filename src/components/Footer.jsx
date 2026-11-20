import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Share2, Copy, Check, QrCode, X, Heart } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { invitationConfig } from '../data/invitationConfig';
import { MarigoldGarland } from './DecorativeElements';

export default function Footer() {
  const { t, lang } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const currentUrl = typeof window !== 'undefined' ? window.location.href.split('#')[0] : 'https://neha-chinmay-engagement.vercel.app';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleWhatsAppShare = () => {
    const text = invitationConfig.social.whatsappShareText(currentUrl, lang);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <footer className="bg-gradient-to-b from-[#24060C] to-[#120205] text-ivory pt-16 pb-12 border-t-4 border-gold-champagne/60 relative overflow-hidden">
      
      {/* Top Garland */}
      <div className="max-w-4xl mx-auto -mt-16 mb-8">
        <MarigoldGarland />
      </div>

      <div className="max-w-5xl mx-auto px-4 text-center relative z-10 flex flex-col items-center">
        
        {/* Monogram Crest / Red Box centered on its own line */}
        <div className="flex justify-center mb-3">
          <div className="inline-flex items-center justify-center px-6 h-12 sm:h-14 rounded-full border-2 border-gold-champagne bg-gradient-to-br from-[#641D2B] to-[#310912] text-gold-champagne font-serif text-xl sm:text-2xl font-bold shadow-gold-glow whitespace-nowrap">
            {lang === 'mr' ? invitationConfig.couple.monogramMarathi : invitationConfig.couple.monogram}
          </div>
        </div>

        {/* Names below the red box, centered on their own line */}
        <h3 className="block w-full text-center font-serif text-3xl sm:text-5xl font-bold text-gold-shimmer tracking-wide mb-2 drop-shadow-md">
          {invitationConfig.couple.bride[lang]} &amp; {invitationConfig.couple.groom[lang]}
        </h3>

        {/* Subtitle below names, centered */}
        <p className="block w-full text-center text-gold-champagne font-serif italic text-lg sm:text-xl mb-8">
          {t('footer.subtitle')}
        </p>

        {/* Share Action Buttons in Circular / Rounded Pillars (Matching Panel 9) */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 mb-12">
          
          {/* WhatsApp Share */}
          <button
            onClick={handleWhatsAppShare}
            className="flex flex-col items-center gap-2 group cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-[#25D366]/20 border-2 border-[#25D366] text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-[#25D366] transition-all">
              <Share2 className="w-7 h-7 text-[#25D366] group-hover:text-maroon-dark transition-colors" />
            </div>
            <span className="text-sm sm:text-base font-serif font-bold text-ivory/95 group-hover:text-gold-champagne">
              {t('footer.whatsapp')}
            </span>
          </button>

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="flex flex-col items-center gap-2 group cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-maroon-wine/80 border-2 border-gold-champagne text-gold-champagne flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-gold-champagne group-hover:text-maroon-dark transition-all">
              {copied ? <Check className="w-7 h-7 text-green-400" /> : <Copy className="w-7 h-7" />}
            </div>
            <span className="text-sm sm:text-base font-serif font-bold text-ivory/95 group-hover:text-gold-champagne">
              {copied ? t('footer.copied') : t('footer.copyLink')}
            </span>
          </button>

          {/* QR Code */}
          <button
            onClick={() => setShowQrModal(true)}
            className="flex flex-col items-center gap-2 group cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-maroon-wine/80 border-2 border-gold-champagne text-gold-champagne flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-gold-champagne group-hover:text-maroon-dark transition-all">
              <QrCode className="w-7 h-7" />
            </div>
            <span className="text-sm sm:text-base font-serif font-bold text-ivory/95 group-hover:text-gold-champagne">
              {t('footer.qrCodeBtn')}
            </span>
          </button>

        </div>

        {/* Traditional Palace & Temple Silhouette Skyline along the bottom */}
        <div className="w-full flex items-center justify-center opacity-30 my-6">
          <svg viewBox="0 0 800 60" width="100%" height="60" fill="#D7B66F">
            <path d="M 0,60 L 50,60 L 50,40 L 70,20 L 90,40 L 90,60 L 150,60 L 150,30 L 175,10 L 200,30 L 200,60 L 260,60 L 260,45 L 280,35 L 300,45 L 300,60 L 350,60 L 375,15 L 400,0 L 425,15 L 450,60 L 500,60 L 500,45 L 520,35 L 540,45 L 540,60 L 600,60 L 600,30 L 625,10 L 650,30 L 650,60 L 710,60 L 710,40 L 730,20 L 750,40 L 750,60 L 800,60 Z"/>
          </svg>
        </div>

        {/* Tagline & Copyright */}
        <p className="text-base sm:text-lg text-ivory/90 max-w-lg mx-auto mb-4 font-serif italic">
          {t('footer.tagline')}
        </p>
        <div className="flex items-center justify-center gap-2 text-sm sm:text-base text-gold-champagne/90 font-serif border-t border-gold-champagne/20 pt-6">
          <span>{t('footer.rights')}</span>
          <Heart className="w-4 h-4 fill-gold-champagne text-gold-champagne inline" />
        </div>

      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="relative bg-[#310912] rounded-3xl border-4 border-gold-champagne p-8 max-w-sm w-full text-center shadow-2xl">
            {/* Close */}
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-gold-champagne hover:text-white p-2 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>

            <h4 className="font-serif text-2xl font-bold text-gold-champagne mb-1">
              {t('footer.qrTitle')}
            </h4>
            <p className="text-xs text-ivory/80 mb-6">
              {t('footer.qrDesc')}
            </p>

            {/* QR Code Canvas */}
            <div className="p-4 bg-white rounded-2xl inline-block shadow-lg mx-auto mb-4">
              <QRCodeSVG
                value={currentUrl}
                size={190}
                level="H"
                includeMargin={true}
              />
            </div>

            <p className="text-xs font-mono text-gold-champagne/80 truncate px-2">
              {currentUrl}
            </p>

            <button
              onClick={() => setShowQrModal(false)}
              className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-gold-antique via-gold-champagne to-gold-antique text-maroon-dark font-serif font-bold text-sm uppercase tracking-wider hover:opacity-95 transition-opacity"
            >
              {t('footer.close')}
            </button>
          </div>
        </div>
      )}
    </footer>
  );
}
