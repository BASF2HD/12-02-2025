
import React from 'react';

export function CRUKLogo({ className = "h-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 600 120" xmlns="http://www.w3.org/2000/svg">
      <g>
        {/* CRUK Dots */}
        <circle cx="20" cy="60" r="3" fill="#FF1D8E" />
        <circle cx="35" cy="45" r="3" fill="#31B5E0" />
        <circle cx="25" cy="75" r="3" fill="#2E008B" />
        <circle cx="40" cy="65" r="3" fill="#FF1D8E" />
        <circle cx="15" cy="50" r="3" fill="#31B5E0" />
        <circle cx="30" cy="55" r="3" fill="#2E008B" />
        <circle cx="45" cy="70" r="3" fill="#FF1D8E" />
        <circle cx="10" cy="40" r="3" fill="#31B5E0" />
        <circle cx="50" cy="45" r="3" fill="#2E008B" />
        
        {/* CANCER RESEARCH UK Text */}
        <text x="80" y="70" fill="#2E008B" fontSize="32" fontFamily="Arial, sans-serif" fontWeight="bold">
          CANCER RESEARCH UK
        </text>
        
        {/* Vertical Line */}
        <line x1="350" y1="30" x2="350" y2="90" stroke="#2E008B" strokeWidth="2"/>
        
        {/* TRACERx Text */}
        <text x="370" y="70" fill="#2E008B" fontSize="40" fontFamily="Arial, sans-serif" fontWeight="bold">
          TRA
          <tspan fill="#31B5E0">C</tspan>
          ER
          <tspan fill="#31B5E0">X</tspan>
        </text>
      </g>
    </svg>
  );
}
