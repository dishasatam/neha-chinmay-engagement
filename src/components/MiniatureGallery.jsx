import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { MarigoldGarland, GlowingDiya, HangingBell } from './DecorativeElements';

export default function MiniatureGallery() {
  const { t, lang } = useLanguage();
  const [activeImageIndex, setActiveImageIndex] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const galleryItems = [
    {
      src: '/images/gallery-rings-luxury.jpg',
      title: lang === 'mr' ? 'सुवर्ण मुद्रिका (साखरपुडा अंगठ्या)' : 'Golden Engagement Rings',
      caption: lang === 'mr' ? 'सोन्याची अंगठी आणि हिऱ्याची झळाळी, आयुष्यभराच्या साथीचे पवित्र प्रतीक' : 'Two timeless gold and diamond rings symbolizing an eternal sacred promise',
      category: lang === 'mr' ? 'शुभ मुद्रिका' : 'Sacred Rings',
    },
    {
      src: '/images/gallery-thali.jpg',
      title: lang === 'mr' ? 'साखरपुडा तबक आणि पेढे' : 'Sakharpuda Thali & Sweets',
      caption: lang === 'mr' ? 'साखर, पारंपरिक पेढे, श्रीफळ आणि ताज्या फुलांनी सजवलेले मंगल तबक' : 'Traditional ceremonial brass thali with auspicious sugar crystals, pedha sweets & sacred offerings',
      category: lang === 'mr' ? 'साखरपुडा तबक' : 'Ceremonial Thali',
    },
    {
      src: '/images/gallery-diya.jpg',
      title: lang === 'mr' ? 'मंगल समई आणि दीपमाळा' : 'Illuminating Brass Samai Diya',
      caption: lang === 'mr' ? 'सोहळ्याला मंगल प्रकाश देणाऱ्या पारंपरिक पितळी समया आणि सुगंधी फुलांची आरास' : 'Handcrafted traditional oil lamp illuminating the sacred ceremonial altar with warm festive light',
      category: lang === 'mr' ? 'मंगल पूजा' : 'Auspicious Altar',
    },
    {
      src: '/images/gallery-stage.jpg',
      title: lang === 'mr' ? 'साखरपुडा मंचाची सजावट' : 'Royal Engagement Stage',
      caption: lang === 'mr' ? 'साखरपुड्यासाठी सजवलेला मनमोहक पुष्पमंच आणि दीपमाळा' : 'Imperial floral stage set with warm ambient lighting and velvet bolster seating',
      category: lang === 'mr' ? 'राजेशाही मंच' : 'Royal Stage',
    },
    {
      src: '/images/gallery-jewellery.jpg',
      title: lang === 'mr' ? 'पारंपारिक दागिने' : 'Maharashtrian Bridal Ornaments',
      caption: lang === 'mr' ? 'कोल्हापुरी साज, ठुशी आणि मोत्याची नथ यांचे पारंपरिक सौंदर्य' : 'Timeless Kolhapuri Saaj, Thushi, and pearl Nath celebrating timeless heritage',
      category: lang === 'mr' ? 'दागिने' : 'Jewellery',
    },
    {
      src: '/images/gallery-flowers.jpg',
      title: lang === 'mr' ? 'झेंडू आणि फुलांची आरास' : 'Festive Marigold & Jasmine Blooms',
      caption: lang === 'mr' ? 'सोहळ्याची शोभा वाढवणारी मनमोहक आणि सुवासिक फुले' : 'Fragrant fresh flowers bringing auspicious blessings and vibrancy to the celebration',
      category: lang === 'mr' ? 'पुष्प सजावट' : 'Floral Decor',
    },
  ];

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveImageIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Number of cards per carousel view
  const itemsPerPage = 3;
  const maxPages = Math.ceil(galleryItems.length / itemsPerPage);

  const nextSlide = () => {
    setCarouselIndex((prev) => (prev + 1) % maxPages);
  };

  const prevSlide = () => {
    setCarouselIndex((prev) => (prev - 1 + maxPages) % maxPages);
  };

  const visibleItems = galleryItems.slice(
    carouselIndex * itemsPerPage,
    carouselIndex * itemsPerPage + itemsPerPage
  );

  return (
    <section id="gallery" className="py-24 px-4 bg-gradient-to-b from-[#2B060D] via-[#24060C] to-[#310912] relative overflow-hidden">
      
      {/* Top Garland & Bells */}
      <div className="max-w-4xl mx-auto -mt-6 mb-6">
        <MarigoldGarland />
        <div className="flex justify-between items-start px-12 -mt-2">
          <HangingBell />
          <HangingBell className="hidden sm:flex" />
          <HangingBell />
        </div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-14 flex flex-col items-center">
          <div className="flex justify-center mb-3">
            <span className="inline-flex items-center px-5 py-2 rounded-full bg-maroon-wine/80 border border-gold-champagne/50 text-gold-champagne text-xs sm:text-base font-serif uppercase tracking-widest font-semibold shadow-sm">
              {t('gallery.badge')}
            </span>
          </div>
          <h2 className="block w-full text-4xl sm:text-6xl font-serif font-bold text-gold-shimmer pt-2 pb-2 mb-2 drop-shadow-md overflow-visible leading-relaxed">
            {t('gallery.title')}
          </h2>
          {lang === 'en' && (
            <p className="block text-gold-champagne text-2xl sm:text-3xl font-serif italic mb-2 leading-relaxed">
              {t('gallery.marathiSubtitle')}
            </p>
          )}
          <p className="block text-ivory/95 text-base sm:text-xl max-w-xl mx-auto font-light leading-relaxed pt-1">
            {t('gallery.subtitle')}
          </p>
        </div>

        {/* Carousel Showcase Container with Left/Right Buttons */}
        <div className="relative max-w-5xl mx-auto px-4 sm:px-12">
          
          {/* Previous Arrow */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-maroon-wine border-2 border-gold-champagne text-gold-champagne flex items-center justify-center hover:bg-gold-champagne hover:text-maroon-dark transition-all z-20 shadow-xl cursor-pointer"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>

          {/* Cards Row (3 Cards in View) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {visibleItems.map((item, idx) => {
              const globalIdx = carouselIndex * itemsPerPage + idx;
              return (
                <motion.div
                  key={globalIdx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  onClick={() => setActiveImageIndex(globalIdx)}
                  className="group relative rounded-3xl overflow-hidden border-4 border-gold-champagne/70 bg-[#310912] shadow-2xl cursor-pointer hover:border-gold-champagne transition-all duration-300 transform hover:-translate-y-2 flex flex-col"
                >
                  {/* Image Display */}
                  <div className="aspect-[4/3] w-full overflow-hidden bg-black/40 relative">
                    <img
                      src={item.src}
                      alt={item.title}
                      className="w-full h-full object-cover transform group-hover:scale-108 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#24060C] via-transparent to-transparent opacity-70 group-hover:opacity-40 transition-opacity"></div>
                    
                    {/* Category Pill */}
                    <div className="absolute top-3 left-3 px-4 py-1.5 rounded-full bg-[#310912]/95 border border-gold-champagne/60 text-xs sm:text-sm font-serif font-bold text-gold-champagne uppercase tracking-wider backdrop-blur-sm shadow-md">
                      {item.category}
                    </div>
                  </div>

                  {/* Caption Bar with comfortable typography & full visibility */}
                  <div className="p-6 sm:p-7 bg-gradient-to-b from-[#3D0B16] to-[#24060C] border-t-2 border-gold-champagne/40 text-center flex-1 flex flex-col justify-start min-h-[170px]">
                    <h4 className="font-serif text-xl sm:text-2xl font-bold text-gold-champagne leading-relaxed overflow-visible">
                      {item.title}
                    </h4>
                    <p className="text-base sm:text-lg text-ivory/95 mt-2.5 font-light leading-relaxed">
                      {item.caption}
                    </p>
                  </div>

                  {/* Hover Zoom Icon */}
                  <div className="absolute top-3 right-3 p-2.5 rounded-full bg-maroon/95 border border-gold-champagne text-gold-champagne opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                    <ZoomIn className="w-5 h-5" />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Next Arrow */}
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-maroon-wine border-2 border-gold-champagne text-gold-champagne flex items-center justify-center hover:bg-gold-champagne hover:text-maroon-dark transition-all z-20 shadow-xl cursor-pointer"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        </div>

        {/* Carousel Pagination Dots */}
        <div className="flex items-center justify-center gap-3 mt-8">
          {[...Array(maxPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCarouselIndex(i)}
              className={`h-3 rounded-full transition-all cursor-pointer ${
                carouselIndex === i
                  ? 'w-9 bg-gold-champagne shadow-gold-glow'
                  : 'w-3 bg-gold-champagne/35 hover:bg-gold-champagne/70'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Bottom Diya Accent */}
        <div className="text-center mt-12">
          <GlowingDiya size="md" />
        </div>

        {/* ==================== LIGHTBOX MODAL WITH INSTANT BACK / CLICK ANYWHERE TO CLOSE ==================== */}
        <AnimatePresence>
          {activeImageIndex !== null && (
            <div 
              onClick={() => setActiveImageIndex(null)}
              className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md p-3 sm:p-6 cursor-pointer select-none overflow-y-auto"
            >
              {/* Floating Top Header: "Back to Website" and "Close" Buttons */}
              <div 
                onClick={(e) => e.stopPropagation()}
                className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between max-w-5xl mx-auto pointer-events-auto"
              >
                {/* Back to Website Button */}
                <button
                  onClick={() => setActiveImageIndex(null)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-maroon-wine to-[#3D0B16] border-2 border-gold-champagne text-gold-champagne font-serif text-sm sm:text-base font-bold shadow-2xl hover:bg-gold-champagne hover:text-maroon-dark hover:scale-105 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>{lang === 'mr' ? '← मुख्य पृष्ठावर परत जा' : '← Back to Website'}</span>
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setActiveImageIndex(null)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-maroon-wine to-[#3D0B16] border-2 border-gold-champagne text-gold-champagne font-serif text-sm sm:text-base font-bold shadow-2xl hover:bg-gold-champagne hover:text-maroon-dark hover:scale-105 transition-all cursor-pointer"
                  aria-label="Close Lightbox"
                >
                  <X className="w-5 h-5" />
                  <span>{lang === 'mr' ? 'बंद करा (Close)' : 'Close ✕'}</span>
                </button>
              </div>

              {/* Previous Photo Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex(
                    (prev) => (prev - 1 + galleryItems.length) % galleryItems.length
                  );
                }}
                className="fixed left-3 sm:left-8 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-maroon-wine/90 border-2 border-gold-champagne text-gold-champagne hover:bg-gold-champagne hover:text-maroon-dark transition-all z-50 shadow-2xl cursor-pointer"
                aria-label="Previous Photo"
              >
                <ChevronLeft className="w-7 h-7 sm:w-8 sm:h-8" />
              </button>

              {/* Next Photo Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex((prev) => (prev + 1) % galleryItems.length);
                }}
                className="fixed right-3 sm:right-8 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-maroon-wine/90 border-2 border-gold-champagne text-gold-champagne hover:bg-gold-champagne hover:text-maroon-dark transition-all z-50 shadow-2xl cursor-pointer"
                aria-label="Next Photo"
              >
                <ChevronRight className="w-7 h-7 sm:w-8 sm:h-8" />
              </button>

              {/* Modal Card - Clicking image or card does not close unless requested */}
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                onClick={(e) => e.stopPropagation()}
                className="max-w-4xl w-full bg-[#310912] border-3 sm:border-4 border-gold-champagne rounded-3xl overflow-hidden shadow-2xl relative my-auto cursor-default mt-16 sm:mt-0"
              >
                <div className="max-h-[65vh] overflow-hidden flex items-center justify-center bg-black relative">
                  <img
                    src={galleryItems[activeImageIndex].src}
                    alt={galleryItems[activeImageIndex].title}
                    className="w-full h-auto max-h-[65vh] object-contain"
                  />
                </div>

                <div className="p-6 sm:p-8 bg-gradient-to-b from-[#3D0B16] to-[#2B060D] border-t-2 border-gold-champagne/40 text-center">
                  <span className="text-xs sm:text-sm uppercase tracking-widest text-gold-champagne font-mono font-bold">
                    {galleryItems[activeImageIndex].category} ({activeImageIndex + 1} / {galleryItems.length})
                  </span>
                  <h3 className="text-2xl sm:text-4xl font-serif font-bold text-gold-champagne mt-2">
                    {galleryItems[activeImageIndex].title}
                  </h3>
                  <p className="text-ivory/95 text-base sm:text-lg mt-2.5 max-w-xl mx-auto font-light leading-relaxed">
                    {galleryItems[activeImageIndex].caption}
                  </p>
                  
                  {/* Prominent Back to Website prompt button inside modal */}
                  <div className="mt-5 pt-4 border-t border-gold-champagne/25 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      onClick={() => setActiveImageIndex(null)}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gold-champagne text-maroon-dark font-serif font-bold text-sm sm:text-base hover:bg-gold-light hover:scale-105 transition-all shadow-lg cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>{lang === 'mr' ? 'वेबसाईटवर परत जा' : 'Return to Website'}</span>
                    </button>
                    <span className="text-xs sm:text-sm text-ivory/60 font-serif">
                      ({lang === 'mr' ? 'किंवा स्क्रीनवर कुठेही क्लिक करा' : 'or click anywhere on background'})
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
