"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error("ErrorBoundary caught:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 dark:bg-[#0a0f1a]">
          <div className="rounded-full bg-red-50 p-4 dark:bg-red-900/20">
            <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-[#0B1F3B] dark:text-white">Algo salió mal</h1>
          <p className="text-sm text-[#1F4E79]/60 dark:text-gray-400">
            Ocurrió un error inesperado. Intentá recargar la página.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-full bg-[#2EC4B6] px-6 py-2 text-sm font-semibold text-white hover:bg-[#26a89c]"
          >
            Recargar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
