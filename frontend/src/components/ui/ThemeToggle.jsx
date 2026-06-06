import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from './Button';
import useThemeStore from '@/store/themeStore';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="rounded-full w-9 h-9"
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4 transition-all" />
      ) : (
        <Moon className="h-4 w-4 transition-all" />
      )}
    </Button>
  );
}
