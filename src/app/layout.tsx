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
  metadataBase: new URL('https://nicolas-pichard.vercel.app'),
  title: {
    default: 'Nicolas Pichard - Le jeu de devinette des vidéos de Cyprien',
    template: '%s | Nicolas Pichard',
  },
  description:
    'Joue à Nicolas Pichard (nicolas-pichard.vercel.app) : le blind test en ligne inspiré de Heardle sur les vidéos YouTube de Cyprien. Devine la vidéo à partir d\'extraits de 0.1s à 26.1s !',
  applicationName: 'Nicolas Pichard',
  authors: [{ name: 'Nicolas Pichard' }],
  keywords: [
    'Nicolas Pichard',
    'nicolas pichard vercel',
    'nicolas-pichard',
    'nicolas pichard jeu',
    'jeu cyprien',
    'blind test cyprien',
    'cyprien heardle',
    'cyprien blind test',
    'deviner video cyprien',
    'cyprien youtube quiz',
    'cyprien iov jeu',
    'heardle français',
  ],
  creator: 'Nicolas Pichard',
  publisher: 'Nicolas Pichard',
  formatDetection: {
    telephone: false,
  },
  alternates: {
    canonical: 'https://nicolas-pichard.vercel.app',
  },
  openGraph: {
    title: 'Nicolas Pichard - Le jeu de devinette des vidéos de Cyprien',
    description:
      'Devine les vidéos cultes de Cyprien à partir de micro-extraits de 0.1s à 26.1s ! 2 modes de jeu : Toutes les époques (205 vidéos) ou Classique ≤ 2016 (89 vidéos).',
    url: 'https://nicolas-pichard.vercel.app',
    siteName: 'Nicolas Pichard',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nicolas Pichard - Jeu de devinette des vidéos de Cyprien',
    description:
      'Retrouve le titre de la vidéo de Cyprien à partir d\'extraits de 0.1s à 26.1s ! Joue gratuitement en ligne.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Nicolas Pichard',
              url: 'https://nicolas-pichard.vercel.app',
              description:
                'Jeu de devinette en ligne inspiré de Heardle sur les vidéos YouTube de Cyprien.',
              applicationCategory: 'GameApplication',
              genre: 'Quiz / Trivia / Blind Test',
              operatingSystem: 'All',
              inLanguage: 'fr',
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
