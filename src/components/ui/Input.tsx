import React, { forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  
  // ✅ Nayi Update: Icon prop add kiya
  icon?: LucideIcon | React.ElementType; 

  // Purani cheezein waise hi rakhi hain taake baaki pages na tootein
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  icon: Icon, // Icon prop ko rename kiya render karne ke liye
  startAdornment,
  endAdornment,
  fullWidth = false,
  className = '',
  ...props
}, ref) => {
  
  const widthClass = fullWidth ? 'w-full' : 'w-full'; // Default to full width mostly
  const errorClass = error 
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500';
  
  // Padding Logic: Agar Icon hai ya StartAdornment hai to left padding barha do
  const leftPadding = Icon || startAdornment ? 'pl-10' : 'pl-3';
  const rightPadding = endAdornment ? 'pr-10' : 'pr-3';

  const inputBaseClass = `block rounded-xl shadow-sm py-2.5 sm:text-sm transition-all outline-none border focus:ring-2 focus:ring-opacity-20 ${errorClass} ${leftPadding} ${rightPadding} ${widthClass}`;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      
      <div className="relative">
        {/* ✅ Case 1: Agar Lucide Icon pass hua hai */}
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Icon size={18} />
          </div>
        )}

        {/* ✅ Case 2: Agar purana StartAdornment pass hua hai */}
        {!Icon && startAdornment && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
            {startAdornment}
          </div>
        )}
        
        <input
          ref={ref}
          className={inputBaseClass}
          {...props}
        />
        
        {endAdornment && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
            {endAdornment}
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <p className={`mt-1.5 text-sm ${error ? 'text-red-500' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';