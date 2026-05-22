import type { Metadata } from 'next';
import { AuthProvider } from '@/context/AuthContext';
import Providers from './Providers';
import Navbar from '@/components/layout/Navbar';
import CartDrawer from '@/components/layout/CartDrawer';
import ChatWidget from '@/components/layout/ChatWidget';
import Footer from '@/components/layout/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'VoltCart — Shop the Latest Gadgets',
    template: '%s | VoltCart',
  },
  description: 'Discover cutting-edge smartphones, laptops, audio gear, and more. Free shipping on orders over $50. 2-year warranty on all electronics.',
  keywords: ['electronics', 'gadgets', 'smartphones', 'laptops', 'headphones', 'tablets', 'tech store'],
  authors: [{ name: 'VoltCart' }],
  creator: 'VoltCart',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://voltcart-frontend.vercel.app',
    siteName: 'VoltCart',
    title: 'VoltCart — Shop the Latest Gadgets',
    description: 'Discover cutting-edge smartphones, laptops, audio gear, and more.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'VoltCart',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VoltCart — Shop the Latest Gadgets',
    description: 'Discover cutting-edge smartphones, laptops, audio gear, and more.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body className='font-sans' suppressHydrationWarning>
        <Providers>
          <AuthProvider>
            <Navbar />
            <main>{children}</main>
            <CartDrawer />
            <ChatWidget />
            <Footer />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}