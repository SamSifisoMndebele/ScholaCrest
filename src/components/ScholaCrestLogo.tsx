import React from 'react';

export type LogoVariant = 'icon-only' | 'icon-badge' | 'text-right' | 'vertical';

export interface ScholaCrestLogoProps {
  variant?: LogoVariant;
  size?: number | string;
  className?: string;
  theme?: 'light' | 'dark';
}

/**
 * ScholaCrest Official Vector SVG Component
 * Direct 1:1 vector conversion of the official heraldic crest logo.
 * 
 * Variants:
 * 1. 'icon-only'   : Pure shield vector emblem (tight crop, ideal for icons/favicons 16px - 128px)
 * 2. 'icon-badge'  : Shield emblem on a rounded squircle badge container
 * 3. 'text-right'  : Shield emblem on left + SCHOLACREST and subtitle on right (Primary Header Lockup)
 * 4. 'vertical'    : Centered shield emblem stacked above SCHOLACREST and subtitle
 */
export const ScholaCrestLogo: React.FC<ScholaCrestLogoProps> = ({
  variant = 'icon-only',
  size = 40,
  className = '',
  theme = 'light',
}) => {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;

  // Embedded Shield Emblem SVG with unique ID prefixes
  const ShieldEmblem: React.FC<{ style?: React.CSSProperties; className?: string }> = ({ 
    style, 
    className: emblemClass = '' 
  }) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="10 4 180 212" 
      style={style} 
      className={`flex-shrink-0 ${emblemClass}`}
    >
      <defs>
        {/* Royal Navy and Educational Gold Gradients */}
        <linearGradient id="scGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F5B945" />
          <stop offset="45%" stopColor="#D4901E" />
          <stop offset="100%" stopColor="#A8670C" />
        </linearGradient>
        <linearGradient id="scGoldHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FDE599" />
          <stop offset="60%" stopColor="#EAA62B" />
          <stop offset="100%" stopColor="#C78114" />
        </linearGradient>
        <linearGradient id="scNavyFacetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1B4782" />
          <stop offset="100%" stopColor="#0E2850" />
        </linearGradient>
        <linearGradient id="scDarkNavyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0E264E" />
          <stop offset="100%" stopColor="#07162C" />
        </linearGradient>

        {/* Clip Path for Shield Interior */}
        <clipPath id="scShieldInnerClip">
          <path d="M 100 24 L 168 44 C 168 44, 168 110, 168 116 C 168 155, 100 193, 100 193 C 100 193, 32 155, 32 116 C 32 110, 32 44, 32 44 Z" />
        </clipPath>
      </defs>

      {/* 1. Outer Dark Navy Contour */}
      <path 
        d="M 100 10 L 182 32 C 182 32, 182 114, 182 122 C 182 168, 100 210, 100 210 C 100 210, 18 168, 18 122 C 18 114, 18 32, 18 32 Z" 
        fill="#0E2850" 
      />

      {/* 2. White Separation Inset */}
      <path 
        d="M 100 18 L 174 38 C 174 38, 174 116, 174 122 C 174 163, 100 201, 100 201 C 100 201, 26 163, 26 122 C 26 116, 26 38, 26 38 Z" 
        fill="#FFFFFF" 
      />

      {/* 3. Primary Shield Frame */}
      <path 
        d="M 100 24 L 168 44 C 168 44, 168 110, 168 116 C 168 155, 100 193, 100 193 C 100 193, 32 155, 32 116 C 32 110, 32 44, 32 44 Z" 
        fill="#0E2850" 
      />

      {/* 4. Shield Interior Artwork (Clipped) */}
      <g clipPath="url(#scShieldInnerClip)">
        {/* Pure White Base Background */}
        <rect x="0" y="0" width="200" height="240" fill="#FFFFFF" />

        {/* Top Left Bevel / Facet */}
        <path d="M 100 24 L 32 44 L 40 58 L 100 36 Z" fill="url(#scNavyFacetGrad)" />

        {/* Top Center-Right Midnight Navy Column (behind right book page) */}
        <path d="M 100 24 L 136 36 L 136 102 L 100 102 Z" fill="url(#scDarkNavyGrad)" />

        {/* Lower Left Navy Field Under Book */}
        <path d="M 32 96 L 100 96 L 100 145 L 32 96 Z" fill="#143666" />
        <path d="M 32 96 L 100 145 L 100 193 C 100 193, 32 155, 32 116 Z" fill="#0E2850" />
        
        {/* Diagonal Dynamic Accent in Lower Left */}
        <path d="M 32 110 L 100 156 L 100 193 C 100 193, 32 155, 32 116 Z" fill="#184077" />

        {/* Bottom Center Bevel Split on Right Tip */}
        <path d="M 100 145 L 126 158 L 100 193 Z" fill="#0A1D38" />
      </g>

      {/* 5. Classical Open Book of Wisdom */}
      <g id="scOpenBookOfWisdom">
        {/* Stepped Page Layers on Left (gives page thickness) */}
        <path d="M 36 68 L 46 68 L 46 116 L 36 112 Z" fill="#9C5E0D" />
        <path d="M 42 63 L 54 63 L 54 118 L 42 114 Z" fill="#B87311" />

        {/* Left Open Page (Gold border) */}
        <path d="M 100 68 L 52 56 L 52 116 L 100 128 Z" fill="url(#scGoldGrad)" />
        {/* Left Open Page (Crisp White Leaf) */}
        <path d="M 97 73 L 57 62 L 57 112 L 97 122 Z" fill="#FFFFFF" />

        {/* Right Open Page (Gold border) */}
        <path d="M 100 68 L 142 56 L 142 116 L 100 128 Z" fill="url(#scGoldGrad)" />
        {/* Right Open Page (Crisp White Leaf) */}
        <path d="M 103 73 L 137 62 L 137 112 L 103 122 Z" fill="#FFFFFF" />

        {/* Center Spine Divider */}
        <path d="M 98 66 L 102 66 L 102 134 L 98 134 Z" fill="url(#scGoldHighlight)" />

        {/* Lower Book Base Arch */}
        <path d="M 52 116 C 74 126, 92 134, 100 134 C 108 134, 124 126, 142 116 L 136 123 C 120 131, 108 138, 100 138 C 92 138, 78 131, 58 123 Z" fill="url(#scGoldGrad)" />
      </g>

      {/* 6. Golden Botanical Laurel Branch on the Right */}
      <g id="scBotanicalLaurel">
        {/* Laurel Main Stem */}
        <path 
          d="M 100 142 C 122 144, 158 132, 160 90 C 161 68, 148 50, 136 38" 
          fill="none" 
          stroke="url(#scGoldGrad)" 
          strokeWidth="3.2" 
          strokeLinecap="round" 
        />
        
        {/* Laurel Leaves fronds */}
        <path d="M 106.0 142.0 Q 110.0 137.9, 118.9 142.3 Q 115.0 146.4, 106.0 142.0 Z" fill="url(#scGoldGrad)" stroke="#A6670D" strokeWidth="0.5" />
        <path d="M 106.0 142.0 Q 107.5 136.9, 114.7 137.1 Q 113.3 142.1, 106.0 142.0 Z" fill="url(#scGoldHighlight)" stroke="#A6670D" strokeWidth="0.5" />
        <path d="M 120.0 136.0 Q 124.9 130.6, 135.2 133.5 Q 130.4 138.9, 120.0 136.0 Z" fill="url(#scGoldHighlight)" stroke="#A6670D" strokeWidth="0.5" />
        <path d="M 120.0 136.0 Q 120.8 130.2, 128.8 129.5 Q 128.0 135.4, 120.0 136.0 Z" fill="url(#scGoldGrad)" stroke="#A6670D" strokeWidth="0.5" />
        <path d="M 136.0 122.0 Q 142.4 115.8, 150.3 118.6 Q 143.9 124.8, 136.0 122.0 Z" fill="url(#scGoldGrad)" stroke="#A6670D" strokeWidth="0.5" />
        <path d="M 136.0 122.0 Q 135.8 115.5, 144.1 114.2 Q 144.3 120.7, 136.0 122.0 Z" fill="url(#scGoldHighlight)" stroke="#A6670D" strokeWidth="0.5" />
        <path d="M 148.0 104.0 Q 155.5 97.4, 159.0 100.8 Q 151.6 107.3, 148.0 104.0 Z" fill="url(#scGoldHighlight)" stroke="#A6670D" strokeWidth="0.5" />
        <path d="M 148.0 104.0 Q 146.9 97.2, 154.9 95.3 Q 156.0 102.1, 148.0 104.0 Z" fill="url(#scGoldGrad)" stroke="#A6670D" strokeWidth="0.5" />
        <path d="M 153.0 84.0 Q 161.0 77.2, 160.7 81.3 Q 152.8 88.0, 153.0 84.0 Z" fill="url(#scGoldGrad)" stroke="#A6670D" strokeWidth="0.5" />
        <path d="M 153.0 84.0 Q 150.7 77.0, 158.0 74.8 Q 160.3 81.8, 153.0 84.0 Z" fill="url(#scGoldHighlight)" stroke="#A6670D" strokeWidth="0.5" />
        <path d="M 149.0 64.0 Q 157.0 57.0, 153.4 61.3 Q 145.4 68.3, 149.0 64.0 Z" fill="url(#scGoldHighlight)" stroke="#A6670D" strokeWidth="0.5" />
        <path d="M 149.0 64.0 Q 145.5 56.9, 151.8 54.7 Q 155.3 61.8, 149.0 64.0 Z" fill="url(#scGoldGrad)" stroke="#A6670D" strokeWidth="0.5" />
        <path d="M 140.0 48.0 Q 147.2 40.8, 141.5 45.4 Q 134.3 52.6, 140.0 48.0 Z" fill="url(#scGoldGrad)" stroke="#A6670D" strokeWidth="0.5" />
        <path d="M 134.0 38.0 Q 140.4 30.6, 133.7 35.3 Q 127.3 42.7, 134.0 38.0 Z" fill="url(#scGoldHighlight)" stroke="#A6670D" strokeWidth="0.5" />
      </g>
    </svg>
  );

  // Variant 1: Logo Only (Pure tight vector emblem)
  if (variant === 'icon-only') {
    return (
      <div 
        style={{ width: pixelSize, height: pixelSize }} 
        className={`inline-flex items-center justify-center select-none ${className}`}
      >
        <ShieldEmblem style={{ width: '100%', height: '100%' }} />
      </div>
    );
  }

  // Variant 2: Logo Only on Squircle Badge Container
  if (variant === 'icon-badge') {
    return (
      <div 
        style={{ width: pixelSize, height: pixelSize }} 
        className={`rounded-2xl bg-white border border-slate-200/90 shadow-sm p-1.5 flex items-center justify-center select-none hover:shadow-md transition-shadow ${className}`}
      >
        <ShieldEmblem style={{ width: '100%', height: '100%' }} />
      </div>
    );
  }

  // Variant 4: Centered Stacked / Vertical Lockup
  if (variant === 'vertical') {
    return (
      <div className={`flex flex-col items-center text-center select-none ${className}`}>
        <div style={{ width: pixelSize, height: pixelSize }} className="mb-2">
          <ShieldEmblem style={{ width: '100%', height: '100%' }} />
        </div>
        <span 
          className={`font-sans font-black tracking-wider leading-tight ${
            theme === 'dark' ? 'text-white' : 'text-blue-950'
          }`}
          style={{ fontSize: typeof size === 'number' ? `${Math.max(16, size * 0.45)}px` : '1.5rem' }}
        >
          SCHOLACREST
        </span>
        <span 
          className={`font-sans font-bold tracking-[0.22em] uppercase mt-0.5 ${
            theme === 'dark' ? 'text-amber-400' : 'text-blue-800'
          }`}
          style={{ fontSize: typeof size === 'number' ? `${Math.max(8, size * 0.16)}px` : '0.65rem' }}
        >
          School Management System
        </span>
      </div>
    );
  }

  // Variant 3: Logo on Left, Text on Right (Primary Horizontal Lockup)
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <div style={{ width: pixelSize, height: pixelSize }} className="flex-shrink-0">
        <ShieldEmblem style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5">
          <span 
            className={`font-sans font-black tracking-wide leading-none ${
              theme === 'dark' ? 'text-white' : 'text-blue-950'
            }`}
            style={{ fontSize: typeof size === 'number' ? `${Math.max(16, size * 0.52)}px` : '1.25rem' }}
          >
            SCHOLACREST
          </span>
          <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded-md font-sans">
            SaaS
          </span>
        </div>
        <span 
          className={`font-sans font-bold tracking-[0.18em] uppercase mt-1 ${
            theme === 'dark' ? 'text-amber-400' : 'text-blue-800'
          }`}
          style={{ fontSize: typeof size === 'number' ? `${Math.max(8, size * 0.22)}px` : '0.6rem' }}
        >
          School Management System
        </span>
      </div>
    </div>
  );
};
