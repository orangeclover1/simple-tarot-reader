import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: "fixed", inset: 0,
          background: "#1a0a00", color: "#f4d9a0",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "2rem", fontFamily: "monospace", gap: "1rem",
          zIndex: 9999,
        }}>
          <div style={{ fontSize: "2rem" }}>🏮</div>
          <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>Something went wrong</div>
          <div style={{
            background: "#2d1200", border: "1px solid #8b4513",
            borderRadius: "0.5rem", padding: "1rem",
            maxWidth: "100%", overflowX: "auto",
            fontSize: "0.8rem", whiteSpace: "pre-wrap", wordBreak: "break-all",
          }}>
            {this.state.error?.message ?? "Unknown error"}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "1rem", padding: "0.75rem 1.5rem",
              background: "#8b4513", color: "#fff",
              border: "none", borderRadius: "0.5rem",
              fontSize: "1rem", cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
