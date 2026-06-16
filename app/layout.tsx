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
  title: {
    default: 'PaceLine — La communauté cycliste Michelin',
    template: '%s · PaceLine',
  },
  description:
    'Rejoignez PaceLine, la plateforme cycliste Michelin : créez ou rejoignez des clubs, suivez vos itinéraires et le classement, échangez avec les ambassadeurs et trouvez les pneus parfaits pour votre pratique.',
  keywords: [
    'PaceLine',
    'Michelin',
    'cyclisme',
    'vélo',
    'clubs cyclistes',
    'itinéraires',
    'classement',
    'ambassadeurs',
    'pneus vélo',
  ],
  applicationName: 'PaceLine',
  authors: [{ name: 'Michelin' }],
  openGraph: {
    title: 'PaceLine — La communauté cycliste Michelin',
    description:
      'Clubs, itinéraires, classements et ambassadeurs : la communauté cycliste réunie sur PaceLine.',
    siteName: 'PaceLine',
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PaceLine — La communauté cycliste Michelin',
    description:
      'Clubs, itinéraires, classements et ambassadeurs : la communauté cycliste Michelin.',
  },
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
