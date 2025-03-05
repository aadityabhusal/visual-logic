import React, { ReactNode } from "react";

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
      return <div className="text-error">{this.state.errorMessage}</div>;
    }
    return this.props.children;
  }
}
