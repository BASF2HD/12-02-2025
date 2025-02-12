import React from 'react';

export function CRUKLogo({ className = "h-12" }: { className?: string }) {
  return (
    <img 
      src="/static/images/CRUK_TracerX_Logo.png" 
      alt="TRACERx Logo" 
      className={className}
    />
  );
}