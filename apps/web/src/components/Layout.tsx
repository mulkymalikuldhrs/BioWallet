import { ReactNode } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col">
      <Head>
        <title>BioWallet - Your Body is Your Password</title>
        <meta name="description" content="Futuristic biometric crypto wallet" />
      </Head>

      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span
                className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer"
                onClick={() => router.push('/')}
              >
                BioWallet
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={logout}
                    className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => router.push('/login')}
                    className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => router.push('/register')}
                    className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    Register
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow">{children}</main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 dark:text-gray-400">
          <p>© 2025 BioWallet. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
