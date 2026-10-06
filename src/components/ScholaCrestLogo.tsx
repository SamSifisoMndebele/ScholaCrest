import React from 'react';

export type LogoVariant = 'icon-only' | 'icon-badge' | 'text-right' | 'vertical';

export interface ScholaCrestLogoProps {
  variant?: LogoVariant;
  size?: number | string;
  className?: string;
  theme?: 'light' | 'dark';
}

/**
 * ScholaCrest Official Vector Logo Component
 * Renders the official vector assets directly from public/icon.svg, 
 * public/logo-horizontal.svg, and public/logo.svg.
 */
export const ScholaCrestLogo: React.FC<ScholaCrestLogoProps> = ({
  variant = 'text-right',
  size = 42,
  className = '',
}) => {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;

  // 1. Pure Heraldic Crest Shield Emblem
  if (variant === 'icon-only') {
    return (
      <img
        src="/icon.svg"
        alt="Schola Crest Emblem"
        style={{ width: pixelSize, height: pixelSize }}
        className={`object-contain flex-shrink-0 select-none ${className}`}
      />
    );
  }

  // 2. Shield Emblem inside a polished Badge Container
  if (variant === 'icon-badge') {
    return (
      <div 
        style={{ width: pixelSize, height: pixelSize }} 
        className={`rounded-2xl bg-white border border-slate-200/90 shadow-sm p-1.5 flex items-center justify-center select-none hover:shadow-md transition-shadow ${className}`}
      >
        <img 
          src="/icon.svg" 
          alt="Schola Crest Emblem" 
          className="w-full h-full object-contain" 
        />
      </div>
    );
  }

  // 3. Stacked / Vertical Center Lockup
  if (variant === 'vertical') {
    return (
      <img
        src="/logo.svg"
        alt="Schola Crest Logo"
        style={{ height: pixelSize }}
        className={`object-contain select-none max-w-full ${className}`}
      />
    );
  }

  // 4. Default: Horizontal Lockup (Emblem on Left, Schola Crest Text on Right)
  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src="/logo-horizontal.svg"
        alt="Schola Crest School Management System"
        style={{ height: pixelSize }}
        className="object-contain max-w-full"
      />
    </div>
  );
};
