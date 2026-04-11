import { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="nebula-shell flex min-h-screen items-center justify-center px-4 py-12">
            <div className="empty-state-shell page-enter p-10">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[28px] bg-red-50/85 text-red-400 shadow-[0_20px_48px_rgba(181,71,59,0.12)]">
                <AlertTriangle size={40} />
              </div>
              <div className="mb-2 text-sm uppercase tracking-[0.24em] text-red-300">Error</div>
              <h2 className="mb-2 text-3xl font-semibold text-stone-900">页面暂时出错了</h2>
              <p className="mx-auto mb-3 max-w-md text-sm leading-6 text-stone-500">
                当前页面渲染时遇到了异常。刷新通常就能恢复，如果问题持续，再回来看看最近的改动。
              </p>
              {this.state.error?.message && (
                <p className="mx-auto mb-6 max-w-md rounded-2xl bg-white/55 px-4 py-3 text-left text-xs leading-5 text-stone-500">
                  {this.state.error.message}
                </p>
              )}
              <button onClick={() => window.location.reload()} className="btn-primary ui-inline">
                <RotateCcw size={16} />
                刷新页面
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
