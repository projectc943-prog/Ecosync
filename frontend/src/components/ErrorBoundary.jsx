import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });

        // Log to console in development
        if (import.meta.env.DEV) {
            console.error('Error caught by boundary:', error, errorInfo);
        }
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 p-4">
                    <div className="panel-frame max-w-2xl w-full p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center">
                                <AlertCircle size={32} className="text-rose-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl text-dynamic mb-1">SYSTEM MALFUNCTION</h2>
                                <p className="text-slate-400 text-sm">Critical error detected in monitoring interface</p>
                            </div>
                        </div>

                        {import.meta.env.DEV && this.state.error && (
                            <div className="mb-6 p-4 bg-slate-900/50 border border-white/5 rounded-xl">
                                <p className="text-xs font-mono text-rose-400 mb-2">
                                    {this.state.error.toString()}
                                </p>
                                <details className="text-xs font-mono text-slate-500">
                                    <summary className="cursor-pointer hover:text-slate-300">Stack Trace</summary>
                                    <pre className="mt-2 overflow-auto max-h-48">
                                        {this.state.errorInfo?.componentStack}
                                    </pre>
                                </details>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={this.handleReset}
                                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white h-14 rounded-xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover-premium"
                            >
                                <RefreshCw size={18} />
                                Restart System
                            </button>
                        </div>

                        <p className="text-center text-slate-500 text-xs mt-6">
                            If this error persists, please contact system administrator
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
