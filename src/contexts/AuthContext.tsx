import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Authentication state interface
interface AuthState {
  isAuthenticated: boolean;
  userEmail: string | null;
  authTimestamp: number | null;
}

// Authentication context interface
interface AuthContextType {
  isAuthenticated: boolean;
  userEmail: string | null;
  login: (email: string) => void;
  logout: () => void;
  checkAuthStatus: () => boolean;
}

// Create the authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Authentication provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userEmail: null,
    authTimestamp: null,
  });

  // Check for existing authentication on mount
  useEffect(() => {
    checkExistingAuth();
    
    // Listen for Tally authentication success events
    const handleTallyAuthSuccess = (event: CustomEvent) => {
      const { email } = event.detail;
      if (email) {
        login(email);
      }
    };
    
    window.addEventListener('tallyAuthSuccess', handleTallyAuthSuccess as EventListener);
    
    // Cleanup event listener
    return () => {
      window.removeEventListener('tallyAuthSuccess', handleTallyAuthSuccess as EventListener);
    };
  }, []);

  // Check for existing authentication in localStorage
  const checkExistingAuth = () => {
    try {
      const storedAuth = localStorage.getItem('prymo_auth');
      const tallyCompleted = localStorage.getItem('tallySignupCompleted');
      
      if (storedAuth && tallyCompleted === 'true') {
        const authData = JSON.parse(storedAuth);
        
        // Check if auth is still valid (optional: add expiration logic)
        if (authData.email && authData.timestamp) {
          setAuthState({
            isAuthenticated: true,
            userEmail: authData.email,
            authTimestamp: authData.timestamp,
          });
        }
      }
    } catch (error) {
      console.error('Error checking existing auth:', error);
      // Clear invalid auth data
      localStorage.removeItem('prymo_auth');
      localStorage.removeItem('tallySignupCompleted');
    }
  };

  // Login function - called after successful Tally form submission
  const login = (email: string) => {
    const timestamp = Date.now();
    const authData = {
      email,
      timestamp,
    };

    // Store in localStorage
    localStorage.setItem('prymo_auth', JSON.stringify(authData));
    localStorage.setItem('tallySignupCompleted', 'true');

    // Update state
    setAuthState({
      isAuthenticated: true,
      userEmail: email,
      authTimestamp: timestamp,
    });
  };

  // Logout function
  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('prymo_auth');
    localStorage.removeItem('tallySignupCompleted');

    // Reset state
    setAuthState({
      isAuthenticated: false,
      userEmail: null,
      authTimestamp: null,
    });
  };

  // Check current authentication status
  const checkAuthStatus = (): boolean => {
    const tallyCompleted = localStorage.getItem('tallySignupCompleted');
    const storedAuth = localStorage.getItem('prymo_auth');
    
    return !!(tallyCompleted === 'true' && storedAuth);
  };

  const contextValue: AuthContextType = {
    isAuthenticated: authState.isAuthenticated,
    userEmail: authState.userEmail,
    login,
    logout,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the authentication context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Higher-order component for protecting routes
interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback 
}) => {
  const { isAuthenticated, checkAuthStatus } = useAuth();
  
  // Double-check authentication status
  const isAuth = isAuthenticated || checkAuthStatus();
  
  if (!isAuth) {
    return fallback || <div>Access denied. Please complete signup first.</div>;
  }
  
  return <>{children}</>;
};