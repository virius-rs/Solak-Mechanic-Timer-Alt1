import React from "react";

/**
 * Global Error Boundary
 * * Catches React rendering errors to prevent the entire overlay from crashing white.
 * * Provides a reload button to attempt recovery.
 */
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "10px",
            color: "#f87171",
            background: "#1a0000",
            height: "100%",
            fontFamily: "monospace",
            fontSize: "11px",
            overflow: "auto",
          }}
        >
          <strong>Something went wrong.</strong>
          <br />
          <br />
          {this.state.error && this.state.error.toString()}
          <br />
          <br />
          <button
            onClick={() => window.location.reload()}
            style={{
              background: "#333",
              color: "#fff",
              border: "1px solid #666",
              padding: "4px 8px",
              cursor: "pointer",
            }}
          >
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}