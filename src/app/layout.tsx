import type { Metadata } from 'next';
import Providers from './Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'TechVault',
  description: 'Your online gadget store',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body className="font-sans">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en">
//       <body suppressHydrationWarning>
//         Hello
//       </body>
//     </html>
//   );
// }