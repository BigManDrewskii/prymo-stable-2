import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="theme-toggle relative w-9 h-9 min-w-[36px] min-h-[36px] aspect-square rounded-full p-0 hover:bg-primary/15 dark:hover:bg-primary/20 transition-all duration-300"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {/* Sun Icon */}
      <Sun
        className={`h-5 w-5 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
          theme === 'light'
            ? 'rotate-0 scale-100 opacity-100'
            : 'rotate-90 scale-0 opacity-0'
        }`}
      />

      {/* Moon Icon */}
      <Moon
        className={`h-5 w-5 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
          theme === 'dark'
            ? 'rotate-0 scale-100 opacity-100'
            : '-rotate-90 scale-0 opacity-0'
        }`}
      />
    </Button>
  );
}

export function ThemeToggleWithLabel() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-muted-foreground">
        {theme === 'light' ? 'Light' : 'Dark'} Mode
      </span>
      
      <Button
        variant="outline"
        size="sm"
        onClick={toggleTheme}
        className="theme-toggle relative h-8 px-3 rounded-full border-border/50 hover:border-primary/30 transition-all duration-300"
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        <div className="flex items-center gap-2">
          {/* Sun Icon */}
          <Sun 
            className={`h-3.5 w-3.5 transition-all duration-300 ${
              theme === 'light' 
                ? 'rotate-0 scale-100 opacity-100 text-primary' 
                : 'rotate-90 scale-0 opacity-0'
            }`} 
          />
          
          {/* Moon Icon */}
          <Moon 
            className={`h-3.5 w-3.5 transition-all duration-300 ${
              theme === 'dark' 
                ? 'rotate-0 scale-100 opacity-100 text-primary' 
                : '-rotate-90 scale-0 opacity-0'
            }`} 
          />
          
          <span className="text-xs font-medium">
            {theme === 'light' ? 'Dark' : 'Light'}
          </span>
        </div>
      </Button>
    </div>
  );
}

export function ThemeToggleSwitch() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center gap-3">
      <Sun className={`h-4 w-4 transition-colors ${theme === 'light' ? 'text-primary' : 'text-muted-foreground'}`} />
      
      <button
        onClick={toggleTheme}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 ${
          theme === 'dark' ? 'bg-primary' : 'bg-muted'
        }`}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-background shadow-lg transition-transform duration-300 ${
            theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      
      <Moon className={`h-4 w-4 transition-colors ${theme === 'dark' ? 'text-primary' : 'text-muted-foreground'}`} />
    </div>
  );
}
