import React, { useState, useEffect } from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  status?: 'online' | 'offline' | 'busy';
}

export const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  alt = 'User', 
  size = 'md', 
  className = '',
  status 
}) => {
  const [hasError, setHasError] = useState(false);

  // Jab bhi naya link aaye, error reset karo
  useEffect(() => {
    setHasError(false);
  }, [src]);

  // --- SIZES CONFIGURATION ---
  const sizeClasses = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-24 w-24 text-xl',
    '2xl': 'h-32 w-32 text-3xl', // Added support for larger sizes
  };

  // --- HELPER: Initials Generator (e.g. "Muhammad Moaz" -> "MM") ---
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // --- HELPER: Random Color Generator ---
  const getBgColor = (name: string) => {
    const colors = [
      'bg-red-100 text-red-600',
      'bg-blue-100 text-blue-600',
      'bg-green-100 text-green-600',
      'bg-yellow-100 text-yellow-700',
      'bg-purple-100 text-purple-600',
      'bg-pink-100 text-pink-600',
      'bg-indigo-100 text-indigo-600',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className={`relative inline-block ${className}`}>
      
      {/* 1. AGAR PHOTO SAHI HAI */}
      {src && !hasError ? (
        <img
          src={src}
          alt={alt}
          className={`rounded-full object-cover border border-gray-200 ${sizeClasses[size]}`}
          onError={() => setHasError(true)} // 🔥 Agar load na ho, to Error flag on karo
        />
      ) : (
        
        /* 2. AGAR PHOTO KHARAB HAI YA NAHI HAI -> TO INITIALS DIKHAO */
        <div 
          className={`rounded-full flex items-center justify-center font-bold border border-gray-200 ${sizeClasses[size]} ${getBgColor(alt)}`}
        >
          {getInitials(alt)}
        </div>
      )}

      {/* Online/Offline Status Dot */}
      {status && (
        <span 
          className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white ${
            status === 'online' ? 'bg-green-400' : 
            status === 'busy' ? 'bg-red-400' : 'bg-gray-400'
          }`} 
        />
      )}
    </div>
  );
};