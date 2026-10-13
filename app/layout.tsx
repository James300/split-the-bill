import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Separator from '@/components/Separator';
import FooterContainer from '@/containers/Footer/Footer';
import HeaderContainer from '@/containers/Header/Header';
import Toaster from '@/components/Toaster';
import { authClient } from '@/lib/auth/client'; 
import Providers from '@/providers/AuthProvider/AuthProvider';
// import { OverlayProvider } from '@/providers/OverlayProvider/OverlayProvider';

import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Split The Bill',
  applicationName: 'Split The Bill',
  description: 'Track shared expenses, split payments, and settle up with your group.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    title: 'Split The Bill',
    statusBarStyle: 'default',
  },
};

export const viewport: Viewport = {
  themeColor: '#64245d',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className='layout'>
          <Providers>
            <HeaderContainer />
            <Separator />
            {/* <OverlayProvider> */}
              <main className='main'>
                {children}
              </main>
            {/* </OverlayProvider> */}
            {/* <FooterContainer /> */}
          </Providers>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
