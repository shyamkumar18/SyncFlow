import { Component, type ReactNode, type ErrorInfo } from 'react';
import ErrorDisplay from './ui/ErrorDisplay';

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error: Error): State { return { hasError: true, error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('[ErrorBoundary]', error, info.componentStack); }
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return <ErrorDisplay message="A rendering error occurred. This has been logged." onRetry={() => window.location.reload()} fullPage />;
    }
    return this.props.children;
  }
}
