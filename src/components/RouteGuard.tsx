import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThemeLogo } from '@/components/ThemeLogo';
import { ThemeToggle } from '@/components/ThemeToggle';

interface RouteGuardProps {
  children: React.ReactNode;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const { isAuthenticated, checkAuthStatus, login } = useAuth();
  const location = useLocation();
  
  // Auto-authenticate only for demo purposes
  useEffect(() => {
    // Check if user came from a demo link (has demo=true in URL params or state)
    const urlParams = new URLSearchParams(location.search);
    const isDemoAccess = urlParams.get('demo') === 'true' || location.state?.demo === true;
    
    // Only auto-authenticate if:
    // 1. User is not already authenticated
    // 2. This is a demo access (from View Demo button or footer Get Started)
    const shouldAutoAuth = !isAuthenticated && !checkAuthStatus() && isDemoAccess;
    
    if (shouldAutoAuth) {
      // Auto-authenticate with demo user for UI/UX showcase
      login('demo@prymo.com');
    }
  }, [isAuthenticated, checkAuthStatus, login, location]);
  
  // Check authentication status
  const isAuth = isAuthenticated || checkAuthStatus();
  
  // If user is authenticated, render the protected content
  if (isAuth) {
    return <>{children}</>;
  }
  
  // If not authenticated, show the access denied page
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
          <ThemeToggle />
        </div>

        {/* Access Denied Card */}
        <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-lg">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <ThemeLogo className="h-12 w-auto" />
          </div>

          {/* Shield Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </div>

          {/* Title and Description */}
          <h1 className="text-2xl font-bold text-foreground mb-3">
            Access Required
          </h1>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            To access the PRYMO text enhancement tool, please complete the quick signup process first.
          </p>

          {/* Features List */}
          <div className="bg-muted/30 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              What you'll get:
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                AI-powered text enhancement
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                Multiple AI model support
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                Secure and private processing
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                No credit card required
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              asChild
              className="w-full btn-primary"
              size="lg"
            >
              <Link to="/">
                Complete Signup
              </Link>
            </Button>
            
            <p className="text-xs text-muted-foreground">
              Takes less than 30 seconds • No spam, ever
            </p>
          </div>
        </div>

        {/* Development Override */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-xs text-yellow-600 dark:text-yellow-400 text-center mb-3">
              Development Mode: Bypass Authentication
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-yellow-500/30 text-yellow-600 hover:bg-yellow-500/10 dark:text-yellow-400"
              onClick={() => {
                // Simulate authentication for development
                login('dev@example.com');
              }}
            >
              Skip for Development
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};