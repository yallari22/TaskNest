"use client";

import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="p-4 border border-red-300 bg-red-50 dark:bg-red-900/20 rounded-md">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-400">Something went wrong</h2>
          {this.props.fallback || (
            <div className="mt-2">
              <p className="text-sm text-red-600 dark:text-red-300">
                {this.state.error && this.state.error.toString()}
              </p>
              {process.env.NODE_ENV !== "production" && (
                <details className="mt-2 text-xs text-red-500 dark:text-red-400">
                  <summary>Error details</summary>
                  <pre className="mt-2 whitespace-pre-wrap">
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
