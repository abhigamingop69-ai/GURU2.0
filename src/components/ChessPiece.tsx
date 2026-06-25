import React from 'react';
import { cn } from '../lib/utils';

interface ChessPieceProps {
  type: string; // 'p', 'n', 'b', 'r', 'q', 'k' (can be uppercase for white)
  className?: string;
}

export const ChessPiece: React.FC<ChessPieceProps> = ({ type, className }) => {
  const isWhite = type === type.toUpperCase();
  const lowerType = type.toLowerCase();
  
  // Duolingo 3D bubbly style colors
  const fill = isWhite ? '#f2f6f9' : '#525252';
  const shadowFill = isWhite ? '#d4dfe7' : '#3b3b3b';
  const outline = isWhite ? '#879bb3' : '#1a1a1a';
  const highlight = isWhite ? '#ffffff' : '#6e6e6e';

  const filterId = `duo-3d-${isWhite ? 'w' : 'b'}`;

  const getShapes = () => {
    const base = <ellipse key="base" cx="50" cy="82" rx="28" ry="10" />;
    switch(lowerType) {
      case 'p': return [
        base,
        <path key="body" d="M 35 82 C 35 60 42 45 42 45 L 58 45 C 58 45 65 60 65 82 Z" />,
        <rect key="collar" x="38" y="41" width="24" height="6" rx="3" />,
        <circle key="head" cx="50" cy="27" r="15" />
      ];
      case 'r': return [
        base,
        <path key="body" d="M 32 82 L 32 40 L 68 40 L 68 82 Z" />,
        <rect key="collar-b" x="28" y="75" width="44" height="6" rx="3" />,
        <rect key="collar-t" x="28" y="38" width="44" height="6" rx="3" />,
        <path key="top" d="M 30 38 L 30 20 L 40 20 L 40 28 L 46 28 L 46 20 L 54 20 L 54 28 L 60 28 L 60 20 L 70 20 L 70 38 Z" />
      ];
      case 'n': return [
        base,
        <path key="horse" d="M 30 82 C 30 70 40 60 40 50 C 35 52 25 52 20 45 C 15 35 20 25 30 25 C 40 25 45 20 55 15 L 60 25 C 70 35 70 55 65 82 Z" />
      ];
      case 'b': return [
        base,
        <path key="body" d="M 35 82 C 35 60 42 45 42 45 L 58 45 C 58 45 65 60 65 82 Z" />,
        <rect key="collar" x="36" y="41" width="28" height="6" rx="3" />,
        <path key="head" d="M 50 12 C 35 20 35 45 50 45 C 65 45 65 20 50 12 Z" />,
        <circle key="ball" cx="50" cy="9" r="4.5" />
      ];
      case 'q': return [
        base,
        <path key="body" d="M 32 82 C 32 55 40 45 40 45 L 60 45 C 60 45 68 55 68 82 Z" />,
        <rect key="collar" x="34" y="41" width="32" height="6" rx="3" />,
        <path key="crown" d="M 36 45 L 64 45 L 75 22 L 60 32 L 50 15 L 40 32 L 25 22 Z" />,
        <circle key="b1" cx="25" cy="22" r="4" />,
        <circle key="b2" cx="40" cy="32" r="4" />,
        <circle key="b3" cx="50" cy="15" r="4" />,
        <circle key="b4" cx="60" cy="32" r="4" />,
        <circle key="b5" cx="75" cy="22" r="4" />
      ];
      case 'k': return [
        base,
        <path key="body" d="M 32 82 C 32 55 40 45 40 45 L 60 45 C 60 45 68 55 68 82 Z" />,
        <rect key="collar" x="34" y="41" width="32" height="6" rx="3" />,
        <path key="head" d="M 32 45 C 32 15 68 15 68 45 Z" />,
        <rect key="c1" x="47" y="5" width="6" height="15" rx="1.5" />,
        <rect key="c2" x="41" y="9" width="18" height="6" rx="1.5" />
      ];
      default: return [];
    }
  };

  const getExtras = () => {
    switch(lowerType) {
      case 'n': return <circle cx="38" cy="28" r="2.5" fill={outline} />;
      case 'b': return <path d="M 46 25 L 50 32 L 54 25" fill="none" stroke={outline} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />;
      default: return null;
    }
  };

  const shapes = getShapes();
  const extras = getExtras();

  return (
    <svg viewBox="0 0 100 100" className={cn("w-full h-full overflow-visible", className)}>
      <defs>
        <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
          {/* Inner Shadow (Bottom/Right) */}
          <feOffset dx="-5" dy="-8" in="SourceAlpha" result="innerOffset"/>
          <feComposite in="SourceAlpha" in2="innerOffset" operator="out" result="innerShadowMask"/>
          <feFlood floodColor={shadowFill} floodOpacity="1" result="innerShadowColor"/>
          <feComposite in="innerShadowColor" in2="innerShadowMask" operator="in" result="innerShadow"/>

          {/* Inner Highlight (Top/Left) */}
          <feOffset dx="4" dy="5" in="SourceAlpha" result="highlightOffset"/>
          <feComposite in="SourceAlpha" in2="highlightOffset" operator="out" result="highlightMask"/>
          <feFlood floodColor={highlight} floodOpacity="1" result="highlightColor"/>
          <feComposite in="highlightColor" in2="highlightMask" operator="in" result="highlight"/>

          {/* Combine */}
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="innerShadow" />
            <feMergeNode in="highlight" />
          </feMerge>
        </filter>
      </defs>

      {/* Puck Base Rim (Bottom shadow part) */}
      <ellipse cx="50" cy="87" rx="28" ry="10" fill={shadowFill} stroke={outline} strokeWidth="5" />

      {/* 3D Fills */}
      <g filter={`url(#${filterId})`} fill={fill} stroke="none">
        {shapes}
      </g>

      {/* Strokes */}
      <g fill="none" stroke={outline} strokeWidth="5" strokeLinejoin="round" strokeLinecap="round">
        {shapes}
      </g>

      {/* Extras (Eyes, cuts, etc) */}
      {extras}
    </svg>
  );
};

