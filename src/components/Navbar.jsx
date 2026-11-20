import React, { useState } from 'react';
import { Menu, X, User, Languages, Lock } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { invitationConfig } from '../data/invitationConfig';

export default function Navbar({ guestProfile, onSwitchGuest, onNavigateAdmin }) {
  const { t, lang, toggleLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '#hero', label: t('nav.home') },
    { href: '#invitation', label: t('nav.invitation') },
    { href: '#our-story', label: t('nav.ourStory') },
    { href: '#countdown', label: t('nav.countdown') },
    { href: '#event-details', label: t('nav.details') },
    { href: '#gallery', label: t('nav.gallery') },
    { href: '#blessings', label: t('nav.blessings') },
  ];

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-maroon-deep/95 backdrop-blur-md border-b border-gold-champagne/30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
        {/* Brand / Monogram with short names: Neha & Chinmay */}
        <a href="#hero" className="flex items-center gap-3 group whitespace-nowrap mr-3 sm:mr-6 flex-shrink-0">
          <div className="w-auto px-3.5 h-10 sm:h-11 rounded-full border border-gold-champagne/80 bg-gradient-to-r from-maroon-wine to-[#4A101D] flex items-center justify-center text-gold-champagne font-serif font-bold text-sm sm:text-base tracking-wider shadow-gold-glow group-hover:scale-105 transition-transform whitespace-nowrap">
            {lang === 'mr' ? invitationConfig.couple.monogramMarathi : invitationConfig.couple.monogram}
          </div>
          <span className="font-serif text-xl sm:text-2xl font-bold text-gold-gradient tracking-wide whitespace-nowrap">
            {invitationConfig.couple.bride[lang]} & {invitationConfig.couple.groom[lang]}
          </span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-5 lg:gap-7">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-ivory/90 hover:text-gold-champagne font-serif text-sm lg:text-base tracking-wider transition-colors font-medium"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Right Controls (Guest Badge, Language Switch, Admin) */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Identified Guest Badge with Change Option */}
          {guestProfile?.firstName && (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-maroon-dark/90 border border-gold-antique/40 text-xs sm:text-sm shadow-sm">
              <User className="w-4 h-4 text-gold-champagne" />
              <span className="text-ivory font-medium truncate max-w-[130px]">
                {guestProfile.firstName} {guestProfile.surname}
              </span>
              <button
                onClick={onSwitchGuest}
                title={t('nav.changeGuest')}
                className="text-xs text-gold-champagne/80 hover:text-gold-champagne underline ml-1 cursor-pointer"
              >
                {t('nav.changeGuest')}
              </button>
            </div>
          )}

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-gold-champagne/60 bg-maroon-wine/70 text-gold-champagne hover:bg-gold-champagne hover:text-maroon-dark text-xs sm:text-sm font-bold tracking-wider transition-all cursor-pointer shadow-md"
            aria-label="Toggle language"
          >
            <Languages className="w-4 h-4" />
            <span>{lang === 'en' ? 'मराठी' : 'EN'}</span>
          </button>

          {/* Discreet Admin Lock Icon */}
          <button
            onClick={onNavigateAdmin}
            title={t('nav.admin')}
            className="p-2.5 rounded-full text-gold-champagne/70 hover:text-gold-champagne hover:bg-maroon-wine/50 transition-colors cursor-pointer"
          >
            <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Mobile & Tablet Hamburger Button */}
        <div className="flex xl:hidden items-center gap-2.5">
          {/* Quick Language Toggle on Mobile/Tablet */}
          <button
            onClick={toggleLanguage}
            className="px-3 py-1.5 rounded-full border border-gold-champagne/50 text-gold-champagne text-xs sm:text-sm font-bold bg-maroon-wine/50 cursor-pointer"
          >
            {lang === 'en' ? 'मराठी' : 'EN'}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-gold-champagne hover:bg-maroon-wine focus:outline-none cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-maroon-deep/98 border-b border-gold-champagne/40 px-6 pt-4 pb-7 space-y-4 shadow-2xl">
          {/* Identified Guest info */}
          {guestProfile?.firstName && (
            <div className="flex items-center justify-between pb-3 border-b border-gold-champagne/25 text-sm">
              <div className="flex items-center gap-2 text-ivory">
                <User className="w-4 h-4 text-gold-champagne" />
                <span>
                  {t('nav.currentGuest')}: <strong>{guestProfile.firstName} {guestProfile.surname}</strong>
                </span>
              </div>
              <button
                onClick={() => {
                  onSwitchGuest();
                  setMobileMenuOpen(false);
                }}
                className="text-gold-champagne underline text-xs font-semibold cursor-pointer"
              >
                {t('nav.changeGuest')}
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={handleLinkClick}
                className="block py-3 px-3 text-base sm:text-lg font-serif font-medium text-ivory/95 hover:text-gold-champagne rounded-xl hover:bg-maroon-wine/40 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-4 border-t border-gold-champagne/25 flex items-center justify-between">
            <button
              onClick={() => {
                onNavigateAdmin();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-sm sm:text-base text-gold-champagne hover:underline py-1.5 cursor-pointer font-serif"
            >
              <Lock className="w-4 h-4" />
              <span>{t('nav.admin')}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
