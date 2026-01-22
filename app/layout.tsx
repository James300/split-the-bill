import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import FooterContainer from '@/containers/Footer/Footer';
import HeaderContainer from '@/containers/Header/Header';
import Separator from '@/components/Separator';

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className='layout'>
          <HeaderContainer />
          <Separator />
          <main className='main'>
            {children}
          </main>
          <Separator />
          <FooterContainer />
        </div>
      </body>
    </html>
  );
}
