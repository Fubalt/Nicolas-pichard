import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
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
  title: 'Nicolas Pichard',
  description: 'Devine les vidéos cultes à partir d\'extraits de 0.1s à 26.1s !',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-full bg-zinc-950 text-zinc-100 antialiased selection:bg-orange-500/30 selection:text-orange-200`}
      >
        {children}
      </body>
    </html>
  );
}
