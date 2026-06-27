import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../app/theme-provider';
import { Button } from './Button';
import { motion } from 'framer-motion';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative overflow-hidden rounded-full w-9 h-9"
      aria-label="Toggle theme"
    >
      <motion.div
        className="flex items-center justify-center"
        initial={false}
        animate={{ rotate: theme === 'dark' ? 180 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {theme === 'dark' ? (
          <Sun className="h-5 w-5 text-amber-400" />
        ) : (
          <Moon className="h-5 w-5 text-zinc-700" />
        )}
      </motion.div>
    </Button>
  );
};
