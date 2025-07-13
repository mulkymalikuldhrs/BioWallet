import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { ThemeProvider } from 'next-themes';
import { WalletProvider } from '@/context/WalletContext';
import { AuthProvider } from '@/context/AuthContext';
import Layout from '@/components/Layout';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class">
      <AuthProvider>
        <WalletProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </WalletProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}