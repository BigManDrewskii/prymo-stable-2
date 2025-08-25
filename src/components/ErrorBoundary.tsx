import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { ThemeLogo } from '@/components/ThemeLogo';
import { ThemeToggle } from '@/components/ThemeToggle';
import config from '@/lib/config';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Report to error monitoring service if enabled
    if (config.features.errorReporting && config.analytics.sentryDsn) {
      this.reportError(error, errorInfo);
    }
  }

  reportError = (error: Error, errorInfo: ErrorInfo) => {
    try {
      // Send error to monitoring service
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        errorId: this.state.errorId,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: this.getUserId(),
      };

      // Log for debugging
      console.error('Error Report:', errorReport);

      // In production, you would send this to your error monitoring service
      // Example: Sentry, LogRocket, Bugsnag, etc.
      if (config.analytics.sentryDsn) {
        // Sentry.captureException(error, { extra: errorReport });
      }
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  getUserId = (): string | null => {
    try {
      const authData = localStorage.getItem(config.auth.storageKey);
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.email || null;
      }
    } catch {
      // Ignore localStorage errors
    }
    return null;
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportBug = () => {
    const subject = encodeURIComponent(`Bug Report - Error ID: ${this.state.errorId}`);
    const body = encodeURIComponent(`
Error ID: ${this.state.errorId}
Timestamp: ${new Date().toISOString()}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}

Error Message: ${this.state.error?.message || 'Unknown error'}

Please describe what you were doing when this error occurred:
[Your description here]
    `);
    
    window.open(`mailto:${config.contact.supportEmail}?subject=${subject}&body=${body}`);
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <ThemeLogo className="h-8 w-auto" />
              <ThemeToggle />
            </div>

            {/* Error Card */}
            <Card className="border-destructive/20">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-destructive" />
                  </div>
                </div>
                <CardTitle className="text-destructive">Something went wrong</CardTitle>
                <CardDescription>
                  We're sorry, but something unexpected happened. Our team has been notified.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Error ID for support */}
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Error ID</p>
                  <code className="text-xs font-mono text-foreground">{this.state.errorId}</code>
                </div>

                {/* Development error details */}
                {config.features.developmentTools && this.state.error && (
                  <details className="bg-muted/30 rounded-lg p-3">
                    <summary className="text-sm font-medium cursor-pointer">
                      Technical Details
                    </summary>
                    <div className="mt-2 text-xs font-mono text-muted-foreground">
                      <p className="font-semibold">Error:</p>
                      <p className="mb-2">{this.state.error.message}</p>
                      {this.state.error.stack && (
                        <>
                          <p className="font-semibold">Stack Trace:</p>
                          <pre className="whitespace-pre-wrap text-xs">
                            {this.state.error.stack}
                          </pre>
                        </>
                      )}
                    </div>
                  </details>
                )}
              </CardContent>

              <CardFooter className="flex flex-col gap-3">
                {/* Primary Actions */}
                <div className="flex gap-2 w-full">
                  <Button
                    onClick={this.handleReload}
                    className="flex-1"
                    variant="default"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reload Page
                  </Button>
                  <Button
                    onClick={this.handleGoHome}
                    variant="outline"
                    className="flex-1"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </Button>
                </div>

                {/* Report Bug */}
                <Button
                  onClick={this.handleReportBug}
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground"
                >
                  <Bug className="w-4 h-4 mr-2" />
                  Report this issue
                </Button>
              </CardFooter>
            </Card>

            {/* Additional Help */}
            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>
                Need help? Contact us at{' '}
                <a
                  href={`mailto:${config.contact.supportEmail}`}
                  className="text-primary hover:underline"
                >
                  {config.contact.supportEmail}
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for wrapping components with error boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// Hook for error reporting in functional components
export const useErrorHandler = () => {
  const reportError = (error: Error, context?: string) => {
    console.error('Manual error report:', error, context);
    
    if (config.features.errorReporting) {
      // Report to monitoring service
      const errorReport = {
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
        url: window.location.href,
      };
      
      console.error('Error Report:', errorReport);
    }
  };

  return { reportError };
};

export default ErrorBoundary;