import { useState } from 'react';
import { MotionConfig, motion } from 'framer-motion';

interface HeaderProps {
  onMenuClick: () => void;
  isSidebarOpen: boolean;  // Added this prop
}

export function Header({ onMenuClick, isSidebarOpen }: HeaderProps) {
  return (
    <nav className="backdrop-blur-sm bg-gray-800/30 border-b border-white/10 p-4 flex items-center gap-5 shadow-xl rounded-b-lg">
      <HamburgerButton onMenuClick={onMenuClick} isSidebarOpen={isSidebarOpen} />
      <div
        onClick={() => (window.location.href = '/')}
        className="flex items-center gap-2 cursor-pointer"
      >
        <img src="/icon.png" width={40} alt="icon" className="rounded-full shadow-md" />
        <span className="text-xl font-semibold text-white">Royal AI</span>
      </div>
      <div className="ml-auto text-xs italic text-white">
        Developed by Saket Saurav
      </div>
    </nav>
  );
}

interface HamburgerButtonProps {
  onMenuClick: () => void;
  isSidebarOpen: boolean;  // Added this prop
}

const HamburgerButton = ({ onMenuClick, isSidebarOpen }: HamburgerButtonProps) => {
  return (
    <MotionConfig
      transition={{
        duration: 0.5,
        ease: 'easeInOut',
      }}
    >
      <motion.button
        initial={false}
        animate={isSidebarOpen ? 'open' : 'closed'}  // Sync with sidebar state
        onClick={onMenuClick}
        className="relative h-12 w-12 rounded-full bg-white/0 transition-colors hover:bg-white/20"
      >
        <motion.span
          variants={VARIANTS.top}
          className="absolute h-1 w-8 bg-white"
          style={{ y: '-50%', left: '50%', x: '-50%', top: '35%' }}
        />
        <motion.span
          variants={VARIANTS.middle}
          className="absolute h-1 w-8 bg-white"
          style={{ left: '50%', x: '-50%', top: '50%', y: '-50%' }}
        />
        <motion.span
          variants={VARIANTS.bottom}
          className="absolute h-1 w-6 bg-white"
          style={{
            x: '-50%',
            y: '50%',
            bottom: '35%',
            left: 'calc(50% + 10px)',
          }}
        />
      </motion.button>
    </MotionConfig>
  );
};

const VARIANTS = {
  top: {
    open: {
      rotate: ['0deg', '0deg', '45deg'],
      top: ['35%', '50%', '50%'],
    },
    closed: {
      rotate: ['45deg', '0deg', '0deg'],
      top: ['50%', '50%', '35%'],
    },
  },
  middle: {
    open: {
      rotate: ['0deg', '0deg', '-45deg'],
    },
    closed: {
      rotate: ['-45deg', '0deg', '0deg'],
    },
  },
  bottom: {
    open: {
      rotate: ['0deg', '0deg', '45deg'],
      bottom: ['35%', '50%', '50%'],
      left: '50%',
    },
    closed: {
      rotate: ['45deg', '0deg', '0deg'],
      bottom: ['50%', '50%', '35%'],
      left: 'calc(50% + 10px)',
    },
  },
};
