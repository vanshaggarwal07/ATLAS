import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-xl bg-secondary/50 border border-border flex items-center justify-center transition-all duration-300 hover:bg-secondary hover:border-primary/30"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <motion.div
        initial={false}
        animate={{ 
          rotate: theme === 'dark' ? 0 : 180,
          scale: 1 
        }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {theme === 'dark' ? (
          <Moon size={18} className="text-primary" />
        ) : (
          <Sun size={18} className="text-amber-500" />
        )}
      </motion.div>
      
      {/* Subtle glow effect */}
      <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${
        theme === 'dark' 
          ? 'opacity-0' 
          : 'opacity-20 bg-gradient-to-br from-amber-300 to-orange-400'
      }`} />
    </motion.button>
  );
}
