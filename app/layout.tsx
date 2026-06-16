import type { Metadata } from 'next';
import { Noto_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Header } from '@/components/header';

const notoSans = Noto_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Michelin Bike - Recommandations Pneus',
  description: 'Trouvez le pneu Michelin parfait pour votre pratique cycliste',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={notoSans.variable}>
      <body className={notoSans.className} suppressHydrationWarning>
        <Providers>
          <header>
            <Header/>
          </header>
          {children}
        </Providers>
      </body>
    </html>
  );
}
