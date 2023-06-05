import React from "react";
import { theme } from "../lib/theme";

export class ErrorBoundary extends React.Component<any> {
  state = { errorMessage: "" };

  static getDerivedStateFromError(error: any) {
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
