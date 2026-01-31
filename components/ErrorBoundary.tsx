import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white p-6 text-center">
                    <h1 className="text-4xl font-bold mb-4 text-rose-500">Oops, something went wrong.</h1>
                    <p className="text-zinc-400 mb-8 max-w-md">
                        We encountered an unexpected error. This is likely due to corrupted data.
                        Please try clearing your application data or refreshing.
                    </p>
                    <div className="bg-zinc-900 p-4 rounded-lg overflow-auto max-w-2xl w-full text-left font-mono text-xs text-rose-300 border border-rose-900/50 mb-8">
                        {this.state.error?.toString()}
                    </div>
                    <button
                        onClick={() => {
                            localStorage.clear();
                            window.location.reload();
                        }}
                        className="bg-white text-black px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform"
                    >
                        Reset App Data & Reload
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
