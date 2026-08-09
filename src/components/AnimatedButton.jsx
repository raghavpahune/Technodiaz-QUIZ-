import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * AnimatedButton — Global interactive wrapper for all clickable elements.
 * Provides a unified, snappy micro-animation system while respecting OS accessibility settings.
 */
export default function AnimatedButton({ 
  children, 
  onClick, 
  disabled, 
  className = '', 
  type = 'button',
  title = '',
  id,
  as = 'button', // Allows rendering as 'button' or 'div'
  ...props
}) {
  const shouldReduceMotion = useReducedMotion();

  // Snappy spring transition
  const springTransition = {
    type: 'spring',
    stiffness: 400,
    damping: 17,
  };

  // If user prefers reduced motion, only use opacity/filter changes
  const hoverAnim = shouldReduceMotion 
    ? { filter: 'brightness(1.1)' } 
    : { scale: 1.025, filter: 'brightness(1.05)' };
    
  const tapAnim = shouldReduceMotion
    ? { opacity: 0.8 }
    : { scale: 0.95 };

  const Component = as === 'div' ? motion.div : motion.button;

  return (
    <Component
      id={id}
      type={as === 'button' ? type : undefined}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={title}
      className={`${className} ${disabled ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'} outline-none`}
      whileHover={disabled ? {} : hoverAnim}
      whileTap={disabled ? {} : tapAnim}
      transition={springTransition}
      {...props}
    >
      {children}
    </Component>
  );
}
