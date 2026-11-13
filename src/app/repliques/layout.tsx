import type { Metadata } from 'next';
import { Archivo, Instrument_Serif, JetBrains_Mono } from 'next/font/google';
import '@/styles/tokens.css';
import '@/styles/bobine.css';

const archivo = Archivo({
  variable: '--font-archivo',
  subsets: ['latin'],
  axes: ['wdth'],
  display: 'swap',
});

const instrument = Instrument_Serif({
  variable: '--font-instrument',
  subsets: ['latin'],
  weight: '400',
  style: 'italic',
  display: 'swap',
});

const jbmono = JetBrains_Mono({
  variable: '--font-jbmono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Complète la réplique — Nicolas Pichard',
  // noindex jusqu'à la bascule (étape 7 du plan).
  robots: { index: false, follow: false },
};

export default function RepliquesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`bobine ${archivo.variable} ${instrument.variable} ${jbmono.variable}`}>
      {children}
    </div>
  );
}
