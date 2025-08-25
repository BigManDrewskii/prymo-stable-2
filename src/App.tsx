import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { RouteGuard } from "@/components/RouteGuard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageLoading } from "@/components/LoadingSpinner";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import config, { validateConfig } from "@/lib/config";
import { useEffect, useState } from "react";

// Create QueryClient with production-ready configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => {
  const [isConfigValid, setIsConfigValid] = useState<boolean | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  // Validate configuration on app start
  useEffect(() => {
    try {
      const isValid = validateConfig();
      setIsConfigValid(isValid);
      
      if (!isValid) {
        setConfigError('Application configuration is invalid. Please check environment variables.');
      }
      
      // Log configuration in development
      if (config.features.developmentTools) {
        console.log('App Configuration:', config);
      }
    } catch (error) {
      console.error('Configuration validation failed:', error);
      setIsConfigValid(false);
      setConfigError(error instanceof Error ? error.message : 'Unknown configuration error');
    }
  }, []);

  // Show loading while validating configuration
  if (isConfigValid === null) {
    return <PageLoading message="Initializing application..." />;
  }

  // Show error if configuration is invalid
  if (!isConfigValid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-2xl font-bold text-destructive">Configuration Error</h1>
          <p className="text-muted-foreground">{configError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner 
                position="bottom-right"
                toastOptions={{
                  duration: 5000,
                  style: {
                    background: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    color: 'hsl(var(--foreground))',
                  },
                }}
              />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={
                    <ErrorBoundary>
                      <Landing />
                    </ErrorBoundary>
                  } />
                  <Route 
                    path="/app" 
                    element={
                      <ErrorBoundary>
                        <RouteGuard>
                          <Index />
                        </RouteGuard>
                      </ErrorBoundary>
                    } 
                  />
                  {/* Health check endpoint for monitoring */}
                  <Route 
                    path="/health" 
                    element={
                      <div className="p-4 text-center">
                        <h1>PRYMO Health Check</h1>
                        <p>Status: OK</p>
                        <p>Version: {config.app.version}</p>
                        <p>Environment: {config.app.environment}</p>
                        <p>Timestamp: {new Date().toISOString()}</p>
                      </div>
                    } 
                  />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={
                    <ErrorBoundary>
                      <NotFound />
                    </ErrorBoundary>
                  } />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;