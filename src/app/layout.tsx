import type { Metadata } from 'next';
import { AuthProvider } from '@/context/AuthContext';
import Providers from './Providers';
import Navbar from '@/components/layout/Navbar';
import CartDrawer from '@/components/layout/CartDrawer';
import ChatWidget from '@/components/layout/ChatWidget';
import './globals.css';

export const metadata: Metadata = {
  title: 'TechVault',
  description: 'Your online gadget store',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body className="font-sans" suppressHydrationWarning>
        <Providers>
          <AuthProvider>
            <Navbar />
            <main>{children}</main>
            <CartDrawer />
            <ChatWidget />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
