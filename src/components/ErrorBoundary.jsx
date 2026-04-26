import { Component } from "react";
import { BookOpen, RefreshCw, AlertTriangle } from "lucide-react";

/**
 * ErrorBoundary
 *
 * Wraps the entire app (and can wrap individual tabs) to catch
 * unhandled errors in the React tree. Without this, a single
 * bad Appwrite response or null-dereference crashes the whole app.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <App />
 *   </ErrorBoundary>
 *
 * Or per-tab:
 *   <ErrorBoundary fallbackMessage="Feed failed to load">
 *     <FeedTab />
 *   </ErrorBoundary>
 */
export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
        this.handleReset = this.handleReset.bind(this);
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        // Log to console in dev — swap for Sentry/LogRocket in production
        console.error("[ErrorBoundary] Caught error:", error?.message);
        console.error("[ErrorBoundary] Component stack:", info?.componentStack);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (!this.state.hasError) return this.props.children;

        // Inline fallback (used when wrapping a single tab)
        if (this.props.inline) {
            return (
                <div className="flex flex-col items-center gap-3 py-12 px-4 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                        <AlertTriangle size={22} className="text-red-500" />
                    </div>
                    <p className="font-semibold text-slate-600 dark:text-slate-400">
                        {this.props.fallbackMessage || "Something went wrong"}
                    </p>
                    <p className="text-sm text-slate-400 max-w-xs">
                        This section failed to load. Your data is safe.
                    </p>
                    <button
                        onClick={this.handleReset}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        <RefreshCw size={14} />
                        Try again
                    </button>
                </div>
            );
        }

        // Full-page fallback (used at app root)
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-white dark:bg-slate-950 px-6 text-center">
                <div className="w-16 h-16 bg-primary-700 rounded-2xl flex items-center justify-center">
                    <BookOpen size={28} className="text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
                        Something went wrong
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                        Eastudy hit an unexpected error. Your data is safe — tap
                        below to reload the app.
                    </p>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-2 px-6 py-3 bg-primary-700 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors"
                >
                    <RefreshCw size={16} />
                    Reload App
                </button>
                {import.meta.env.DEV && this.state.error && (
                    <pre className="text-left text-xs text-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl max-w-sm overflow-auto">
                        {this.state.error.message}
                    </pre>
                )}
            </div>
        );
    }
}
