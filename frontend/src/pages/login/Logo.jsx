import React from "react";

const Logo = ({ width = 180, height = 60, color = "#004aad" }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 320 100" // Widen the viewbox to fit text
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="NextUp Logo"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor="#0070f3" />
        </linearGradient>
      </defs>

      {/* --- THE MONOGRAM ICON (Shifted slightly left) --- */}
      <g transform="translate(-10, 0)"> 
          {/* Modern Abstract Version */}
          <path
            d="M25 75 V 25 Q 25 15, 35 15 H 45 L 70 50 V 25 Q 70 15, 80 15 H 85 V 45 L 55 15 H 35 V 65 L 65 95 H 25 Z" 
            fill="none" 
          />
          
          {/* ACTUAL PATH: Dynamic N + Arrow */}
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M30 85C27.2386 85 25 82.7614 25 80V30C25 27.2386 27.2386 25 30 25H40C41.878 25 43.6143 25.9981 44.524 27.6438L65 64.382V30C65 27.2386 67.2386 25 70 25H75C77.7614 25 80 27.2386 80 30V50L80 55V80C80 82.7614 77.7614 85 75 85H65C63.122 85 61.3857 84.0019 60.476 82.3562L40 45.618V80C40 82.7614 37.7614 85 35 85H30ZM70 20L95 45H70V20Z"
            fill="url(#logoGradient)"
          />
          
          {/* Arrow Head Accent */}
          <path
            d="M65 25 L90 25 L90 50 L65 25 Z"
            fill="#00c6ff" 
          />
      </g>

      {/* --- THE TEXT "NextUp" --- */}
      <text
        x="110"
        y="68"
        fontFamily="'Poppins', sans-serif"
        fontWeight="700"
        fontSize="55"
        fill={color} // Uses the brand dark blue
      >
        NextUp
      </text>
    </svg>
  );
};

export default Logo;