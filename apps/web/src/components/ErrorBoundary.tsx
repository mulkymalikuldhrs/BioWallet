import React, { Component, ReactNode, ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          backgroundColor: '#f9fafb',
        }} role="alert" aria-label="Application error">
          <div style={{
            maxWidth: '480px',
            width: '100%',
            textAlign: 'center',
            padding: '2rem',
            borderRadius: '1rem',
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            border: '1px solid #e5e7eb',
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#fef2f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              fontSize: '2rem',
            }}>
              ⚠️
            </div>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '0.5rem',
            }}>
              Something Went Wrong
            </h1>
            <p style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              marginBottom: '1.5rem',
              lineHeight: '1.5',
            }}>
              BioWallet encountered an unexpected error. This has been logged for investigation.
              You can try reloading the page or resetting the app state.
            </p>
            {this.state.error && (
              <details style={{
                marginBottom: '1.5rem',
                textAlign: 'left',
                padding: '0.75rem',
                backgroundColor: '#f9fafb',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb',
              }}>
                <summary style={{
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                }}>
                  Error Details
                </summary>
                <pre style={{
                  fontSize: '0.75rem',
                  color: '#ef4444',
                  marginTop: '0.5rem',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  overflow: 'auto',
                }}>
                  {process.env.NODE_ENV === 'development'
                    ? `${this.state.error.toString()}\n${this.state.errorInfo?.componentStack || ''}`
                    : this.state.error.message || 'An unexpected error occurred'
                  }
                </pre>
              </details>
            )}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={this.handleReset}
                aria-label="Try again"
                style={{
                  padding: '0.625rem 1.25rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #d1d5db',
                  backgroundColor: '#ffffff',
                  color: '#374151',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                aria-label="Reload page"
                style={{
                  padding: '0.625rem 1.25rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  backgroundColor: '#4f46e5',
                  color: '#ffffff',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
