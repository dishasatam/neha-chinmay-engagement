import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import OpeningEnvelope from '../components/OpeningEnvelope';
import GuestWelcome from '../components/GuestWelcome';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Invitation from '../components/Invitation';
import OurStory from '../components/OurStory';
import Countdown from '../components/Countdown';
import EventDetails from '../components/EventDetails';
import MiniatureGallery from '../components/MiniatureGallery';
import Blessings from '../components/Blessings';
import Footer from '../components/Footer';
import { useVisitorTracking } from '../hooks/useVisitorTracking';

export default function Home({ onNavigateAdmin }) {
  const {
    guestProfile,
    isIdentified,
    visitCount,
    isTracking,
    identifyGuest,
    switchGuest,
  } = useVisitorTracking();

  // Envelope state: if guest is already identified in this browser and has opened before in session, don't block
  const [envelopeOpened, setEnvelopeOpened] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.location.search.includes('preview')) return true;
      return sessionStorage.getItem('nc_envelope_opened') === 'true';
    } catch {
      return false;
    }
  });

  const handleEnvelopeComplete = () => {
    setEnvelopeOpened(true);
    try {
      sessionStorage.setItem('nc_envelope_opened', 'true');
    } catch {}
  };

  const handleSwitchGuest = () => {
    switchGuest();
    setEnvelopeOpened(false);
    sessionStorage.removeItem('nc_envelope_opened');
  };

  return (
    <div className="min-h-screen bg-maroon-deep text-ivory">
      <AnimatePresence mode="wait">
        {/* 1. Opening Envelope (Cinematic Entry) */}
        {!envelopeOpened && (
          <motion.div
            key="envelope"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.85, ease: 'easeInOut' }}
          >
            <OpeningEnvelope onOpenComplete={handleEnvelopeComplete} />
          </motion.div>
        )}

        {/* 2. Mandatory Guest Identification (Appears smoothly after envelope) */}
        {envelopeOpened && !isIdentified && !(typeof window !== 'undefined' && window.location.search.includes('preview')) && (
          <motion.div
            key="guest-welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <GuestWelcome onIdentify={identifyGuest} isTracking={isTracking} />
          </motion.div>
        )}

        {/* 3. Main Public Website Sections (Majestic Reveal) */}
        {envelopeOpened && (isIdentified || (typeof window !== 'undefined' && window.location.search.includes('preview'))) && (
          <motion.div
            key="main-invitation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="relative"
          >
            <Navbar
              guestProfile={guestProfile}
              onSwitchGuest={handleSwitchGuest}
              onNavigateAdmin={onNavigateAdmin}
            />
            <main>
              <Hero />
              <Invitation />
              <OurStory />
              <Countdown />
              <EventDetails />
              <MiniatureGallery />
              <Blessings guestProfile={guestProfile} />
            </main>
            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
