import type { Metadata } from 'next';
import {
  Cormorant_Garamond,
  Plus_Jakarta_Sans,
  JetBrains_Mono,
} from 'next/font/google';
import '@/styles/globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-plus-jakarta',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains',
});

export const metadata: Metadata = {
  title: 'ARBOREA — Immersive 3D Tree Growth Experience',
  description:
    'An interactive, scroll-driven 3D botanical journey from a microscopic sapling into a monumental living tree and its suspended branch stories.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${plusJakarta.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-[#060907] font-sans text-[#f4efe4] antialiased selection:bg-[#d4af37]/30 selection:text-[#f5e6c8]">
        {children}
      </body>
    </html>
  );
}
