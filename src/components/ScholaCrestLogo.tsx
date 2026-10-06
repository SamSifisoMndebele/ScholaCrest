import React from 'react';

export type LogoVariant = 'icon-only' | 'icon-badge' | 'text-right';

interface ScholaCrestLogoProps {
  variant?: LogoVariant;
  size?: number | string; // Size for icon or height for horizontal
  className?: string;
  theme?: 'light' | 'dark';
}

/**
 * ScholaCrest Official Vector SVG Component
 * Directly converts the original crest logo into razor-sharp, scale-independent vector SVG.
 * 
 * Variants:
 * 1. 'icon-only'   : Pure shield emblem cropped tightly (ideal for 24px - 48px icons & favicons)
 * 2. 'icon-badge'  : Shield emblem on a refined subtle container badge
 * 3. 'text-right'  : Shield emblem on left + SCHOLACREST and subtitle on right
 */
export const ScholaCrestLogo: React.FC<ScholaCrestLogoProps> = ({
  variant = 'icon-only',
  size = 40,
  className = '',
  theme = 'light',
}) => {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;

  // Reusable Shield Vector SVG Graphic
  const ShieldEmblem = ({ width = '100%', height = '100%' }: { width?: string; height?: string }) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 160 190" 
      style={{ width, height }}
      className="flex-shrink-0"
    >
      <defs>
        <clipPath id="shieldInnerSplit">
          <path d="M 80 16 C 112 16, 136 24, 136 44 C 136 84, 80 168, 80 168 C 80 168, 24 84, 24 44 C 24 24, 48 16, 80 16 Z" />
        </clipPath>
      </defs>

      <!-- 1. Outer Dark Navy Shield Contour -->
      <path 
        d="M 80 10 C 116 10, 144 20, 144 44 C 144 90, 80 180, 80 180 C 80 180, 16 90, 16 44 C 16 20, 44 10, 80 10 Z" 
        fill="#0E2850" 
      />

      <!-- 2. Shield Surface Two-Tone Split -->
      <g clipPath="url(#shieldInnerSplit)">
        <!-- Left: Royal Blue -->
        <rect x="0" y="0" width="80" height="190" fill="#183B70" />
        <!-- Right: Deep Midnight Navy -->
        <rect x="80" y="0" width="80" height="190" fill="#0A1C36" />
      </g>

      <!-- 3. Stylized Open Book of Wisdom (Gold) -->
      <g id="bookPages">
        <path d="M 44 64 L 78 57 L 78 107 L 44 114 Z" fill="#B36E17" />
        <path d="M 47 62 L 78 56 L 78 106 L 47 112 Z" fill="#C97F1E" />
        <path d="M 50 60 L 78 55 L 78 105 L 50 110 Z" fill="#E69E26" />
        <path d="M 53 64 L 75 60 L 75 101 L 53 105 Z" fill="#183B70" />
        <path d="M 55 67 L 75 63 L 75 98 L 55 102 Z" fill="#E69E26" />

        <path d="M 82 55 L 110 60 L 110 110 L 82 105 Z" fill="#E69E26" />
        <path d="M 85 60 L 107 64 L 107 105 L 85 101 Z" fill="#0A1C36" />
        <path d="M 85 63 L 105 67 L 105 102 L 85 98 Z" fill="#E69E26" />

        <rect x="78.5" y="54" width="3" height="52" fill="#0E2850" />
      </g>

      <!-- 4. Curved Laurel Branch (Gold) -->
      <g id="laurelLeaves" fill="#E69E26">
        <path d="M 80 120 C 88 116, 96 119, 94 127 C 88 127, 82 124, 80 120 Z" />
        <path d="M 88 110 C 98 104, 107 108, 104 117 C 96 117, 90 114, 88 110 Z" />
        <path d="M 98 98 C 110 92, 119 96, 116 106 C 107 106, 100 102, 98 98 Z" />
        <path d="M 107 84 C 120 78, 128 83, 125 93 C 116 93, 109 89, 107 84 Z" />
        <path d="M 112 69 C 124 63, 132 68, 128 78 C 120 78, 114 74, 112 69 Z" />
        <path d="M 110 54 C 120 48, 128 53, 124 63 C 116 63, 112 59, 110 54 Z" />
        <path d="M 104 40 C 112 34, 118 39, 114 49 C 108 49, 104 45, 104 40 Z" />
      </g>
    </svg>
  );

  // Variant 1: Logo Only (Tightly cropped, razor sharp)
  if (variant === 'icon-only') {
    return (
      <div 
        style={{ width: pixelSize, height: pixelSize }} 
        className={`flex items-center justify-center select-none ${className}`}
      >
        <ShieldEmblem />
      </div>
    );
  }

  // Variant 2: Logo Only on App Badge Container
  if (variant === 'icon-badge') {
    return (
      <div 
        style={{ width: pixelSize, height: pixelSize }} 
        className={`rounded-2xl bg-white border border-slate-200/90 shadow-sm p-1.5 flex items-center justify-center select-none hover:shadow-md transition-shadow ${className}`}
      >
        <ShieldEmblem />
      </div>
    );
  }

  // Variant 3: Text on Right (Horizontal Lockup)
  return (
    <div className={`inline-flex items-center gap-3.5 select-none ${className}`}>
      <div style={{ width: pixelSize, height: pixelSize }} className="flex-shrink-0">
        <ShieldEmblem />
      </div>
      <div className="flex flex-col">
        <span className={`font-serif font-black tracking-wide leading-none ${
          theme === 'dark' ? 'text-white' : 'text-blue-950'
        }`} style={{ fontSize: '1.25rem' }}>
          SCHOLACREST
        </span>
        <span className={`text-[9px] font-sans font-bold tracking-widest uppercase mt-0.5 ${
          theme === 'dark' ? 'text-amber-400' : 'text-blue-800'
        }`}>
          School Management System
        </span>
      </div>
    </div>
  );
};
