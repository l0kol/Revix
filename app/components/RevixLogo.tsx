import React from 'react';

interface RevixLogoProps extends React.SVGProps<SVGSVGElement> {
  primaryColor?: string;
  secondaryColor?: string;
  glowColor?: string; // Hex color for the glow
  glowOpacity?: number;
  glowStdDeviation?: number;
}

const RevixLogo: React.FC<RevixLogoProps> = ({
  className,
  primaryColor = '#FF0000', // YouTube Red
  secondaryColor = '#3B82F6', // Protocol Blue
  glowColor, // e.g., '#FF0000'
  glowOpacity = 0.75,
  glowStdDeviation = 2.5,
  width = 100,
  height = 100,
  ...props
}) => {
  const uniqueId = React.useId ? React.useId() : `revix-logo-${Math.random().toString(36).substr(2, 9)}`;
  const filterId = `neon-glow-${uniqueId}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64" // Adjusted viewBox for a more compact design
      width={width}
      height={height}
      className={className}
      {...props}
      style={{ filter: glowColor ? `url(#${filterId})` : undefined, ...props.style }}
    >
      {glowColor && (
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            {/* Base glow */}
            <feGaussianBlur in="SourceAlpha" stdDeviation={glowStdDeviation} result="blur" />
            <feFlood floodColor={glowColor} floodOpacity={glowOpacity} result="glowColor" />
            <feComposite in="glowColor" in2="blur" operator="in" result="softGlow_colored" />
            
            {/* Sharper inner glow for definition */}
            <feGaussianBlur in="SourceAlpha" stdDeviation={glowStdDeviation / 2} result="innerBlur" />
            <feFlood floodColor={glowColor} floodOpacity={glowOpacity * 0.5} result="innerGlowColor" />
            <feComposite in="innerGlowColor" in2="innerBlur" operator="in" result="innerSoftGlow_colored" />

            <feMerge>
              <feMergeNode in="softGlow_colored"/>
              <feMergeNode in="innerSoftGlow_colored"/>
              <feMergeNode in="SourceGraphic" /> {/*Source graphic on top to maintain sharpness*/}
            </feMerge>
          </filter>
        </defs>
      )}
      {/* Stylized 'R' or Play/Link Symbol */}
      {/* Main stroke - suggesting a play button transforming into a link/remix */}
      <path 
        d="M16 12 L16 52 L36 32 Z" // Play button part
        fill={primaryColor}
        stroke={primaryColor}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M34 32 C 40 28, 42 22, 50 20" // Upper curve/link
        stroke={secondaryColor}
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />
       <path
        d="M34 32 C 40 36, 42 42, 50 44" // Lower curve/link
        stroke={secondaryColor}
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Glitch/accent lines */}
       <path
        d="M18 14 L18 50 L37 31 Z"
        fill="none"
        stroke="rgba(255,255,255,0.3)" // Light accent for glitch
        strokeWidth="1"
        strokeLinejoin="round"
      />
       <path
        d="M35 31 C 41 27, 43 21, 51 19"
        stroke={primaryColor}
        strokeOpacity="0.6"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default RevixLogo;
