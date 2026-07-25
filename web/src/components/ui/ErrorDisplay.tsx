interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
  fullPage?: boolean;
}

export default function ErrorDisplay({ message, onRetry, fullPage }: ErrorDisplayProps) {
  return (
    <div className={`${fullPage ? 'flex items-center justify-center min-h-[400px]' : ''}`}>
      <div className="p-8 bg-white dark:bg-[#23272E] rounded-xl border border-gray-200 dark:border-gray-700 text-center max-w-md mx-auto animate-fade-in">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-gray-900 dark:text-white font-medium mb-1">Something went wrong</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
