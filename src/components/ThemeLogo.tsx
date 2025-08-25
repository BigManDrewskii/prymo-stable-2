import { useTheme } from '@/contexts/ThemeContext';

interface ThemeLogoProps {
  className?: string;
  alt?: string;
}

export function ThemeLogo({ className = "h-10 w-auto", alt = "Prymo Logo" }: ThemeLogoProps) {
  const { theme } = useTheme();
  
  return (
    <img 
      src={theme === 'dark' ? "/prymo-dark.svg" : "/prymo-light.svg"}
      alt={alt}
      className={className}
    />
  );
}
