import React, { ReactNode } from "react";
import { theme } from "../lib/theme";

export class ErrorBoundary extends React.Component<{
  displayError?: boolean;
  children?: ReactNode;
}> {
  state = { errorMessage: "" };

  static getDerivedStateFromError(error: Error) {
    return { errorMessage: error.toString() };
  }

  render() {
    if (this.state.errorMessage && this.props.displayError) {
      return (
        <div style={{ color: theme.color.error }}>
          {this.state.errorMessage}
        </div>
      );
    }
    return this.props.children;
  }
}
