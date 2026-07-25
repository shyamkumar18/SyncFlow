import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const features = [
  {
    title: 'Gmail Integration',
    desc: 'Securely connect your Gmail to automatically fetch and categorize all bank-related emails.',
    icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  },
  {
    title: 'Bank Detection',
    desc: 'Automatically detects emails from HDFC, ICICI, SBI, Axis, Kotak, and 20+ Indian banks.',
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  },
  {
    title: 'Transaction Tracking',
    desc: 'Automatically identifies debit/credit card transactions with amounts, merchants, and dates.',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  },
  {
    title: 'Spending Analytics',
    desc: 'Visualize your spending trends, track savings, and understand your financial patterns.',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  },
  {
    title: 'Card Segmentation',
    desc: 'Separate credit and debit card transactions for clearer financial oversight.',
    icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  },
  {
    title: 'End-to-End Encryption',
    desc: 'All sensitive data is encrypted at rest. Only you can see your transaction details.',
    icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  },
];

const securityItems = [
  'AES-256 Encryption: All transaction data is encrypted before being stored',
  'Google OAuth: We only request read-only Gmail access — never modify your data',
  'Session Management: No concurrent sessions allowed with the same credentials',
  'Rate Limiting: Brute-force protection on all authentication endpoints',
];

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <span className="text-xl font-bold text-primary-600">$yncFlow</span>
              <div className="hidden md:flex items-center gap-6">
                <span className="text-gray-600 dark:text-gray-300 font-medium cursor-default">Home</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="btn-primary shadow-md"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors">
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary shadow-md"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-3">
              Track Your Bank Transactions
            </h1>
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6 text-primary-300">
              Directly from Gmail
            </h2>
            <p className="text-lg md:text-xl text-primary-100 max-w-2xl mb-10 leading-relaxed">
              Automatically fetch, categorize, and analyze your bank transaction emails. Get insights into your spending patterns across all your bank accounts in one place.
            </p>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="px-8 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-primary-100 transition-colors shadow-xl text-lg"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="px-8 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-primary-100 transition-colors shadow-xl text-lg"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    to="/login"
                    className="px-8 py-3 border-2 border-white/40 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors text-lg"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything You Need
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Powerful features to help you track and understand your banking transactions
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl shadow-sm bg-white dark:bg-[#23272E] p-6">
              <div className="w-10 h-10 rounded-lg bg-primary-500/10 dark:bg-primary-500/20 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={f.icon} />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 py-20 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Your Security is Our Priority
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-10">
            {securityItems.map((item) => (
              <div key={item} className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <svg className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm text-gray-700 dark:text-gray-300">{item}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-primary-500/10 dark:bg-primary-500/20">
              <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div className="text-left">
                <p className="font-semibold text-primary-600">Bank-grade Security</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Your financial data stays private and protected</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-900 py-20 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Take Control of Your Finances?
          </h2>
          <p className="text-primary-100 mb-8 text-lg">
            Connect your Gmail in minutes and start tracking your banking transactions automatically.
          </p>
          <Link
            to={isAuthenticated ? '/dashboard' : '/register'}
            className="inline-block px-8 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-primary-100 transition-colors shadow-xl text-lg"
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Create Free Account'}
          </Link>
        </div>
      </section>
    </div>
  );
}
