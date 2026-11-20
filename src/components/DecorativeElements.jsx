import React from 'react';

/**
 * Traditional Indian Marigold Garland (Genda Phool & Aamche Paan Toran)
 */
export function MarigoldGarland({ className = '' }) {
  return (
    <div className={`w-full overflow-hidden flex items-center justify-center select-none pointer-events-none py-1 ${className}`}>
      <div className="flex items-center gap-1 sm:gap-2">
        {[...Array(14)].map((_, i) => (
          <div key={i} className="flex items-center">
            {/* Green Mango Leaf */}
            <div className="w-2.5 h-6 sm:w-3.5 sm:h-8 bg-gradient-to-b from-[#1E7E34] to-[#0D4D1D] rounded-full transform -rotate-12 -mr-1"></div>
            {/* Orange Marigold Flower */}
            <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-[#FF9F1A] via-[#E67E22] to-[#D35400] shadow-sm flex items-center justify-center border border-[#FED330]/40">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#FED330]"></div>
            </div>
            {/* Yellow Marigold Flower */}
            <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-[#FED330] via-[#F1C40F] to-[#E67E22] shadow-sm -ml-1 flex items-center justify-center border border-[#FF9F1A]/40">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#F39C12]"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Hanging Traditional Brass Temple Bell with string and red thread
 */
export function HangingBell({ className = '' }) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="w-0.5 h-8 sm:h-12 bg-gradient-to-b from-gold-antique via-gold-champagne to-gold-antique"></div>
      <svg width="22" height="26" viewBox="0 0 22 26" fill="none" className="drop-shadow-md">
        <path d="M 11,2 C 7,2 5,8 4,14 L 2,19 L 20,19 L 18,14 C 17,8 15,2 11,2 Z" fill="url(#bellGold)" stroke="#8C662D" stroke-width="1"/>
        <ellipse cx="11" cy="19" rx="9" ry="2.5" fill="#FFEAA7"/>
        <circle cx="11" cy="22" r="2.5" fill="#B58E4C"/>
        <defs>
          <linearGradient id="bellGold" x1="0" y1="0" x2="22" y2="26" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFF3D4"/>
            <stop offset="0.5" stopColor="#D7B66F"/>
            <stop offset="1" stopColor="#8C662D"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/**
 * Traditional Brass Samai / Diya with Warm Glowing Flame
 */
export function GlowingDiya({ size = 'md', className = '' }) {
  const dimensions = size === 'lg' ? { w: 90, h: 70 } : size === 'sm' ? { w: 40, h: 32 } : { w: 60, h: 48 };
  
  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <svg width={dimensions.w} height={dimensions.h} viewBox="0 0 60 48" fill="none" className="drop-shadow-lg">
        {/* Glow */}
        <circle cx="30" cy="14" r="14" fill="#FFA500" opacity="0.4" filter="blur(6px)"/>
        {/* Flame */}
        <path d="M 30,2 C 27,8 26,14 27,17 C 28,20 32,20 33,17 C 34,14 33,8 30,2 Z" fill="#FFF2A3"/>
        <path d="M 30,5 C 28,9 28,13 29,15 C 29.5,16.5 30.5,16.5 31,15 C 32,13 32,9 30,5 Z" fill="#FF9F1A"/>
        {/* Diya Bowl */}
        <path d="M 12,20 Q 30,24 48,20 C 44,30 38,34 30,34 C 22,34 16,30 12,20 Z" fill="url(#diyaBrass)" stroke="#8C662D" strokeWidth="1"/>
        <ellipse cx="30" cy="20" rx="18" ry="4" fill="#FFEAA7"/>
        {/* Pedestal Base */}
        <path d="M 27,34 L 25,42 L 35,42 L 33,34 Z" fill="url(#diyaBrass)"/>
        <ellipse cx="30" cy="42" rx="14" ry="3" fill="url(#diyaBrass)"/>
        <defs>
          <linearGradient id="diyaBrass" x1="0" y1="0" x2="60" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFF5D6"/>
            <stop offset="0.4" stopColor="#D7B66F"/>
            <stop offset="1" stopColor="#7A561D"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
