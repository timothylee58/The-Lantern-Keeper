import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import '../styles/globals.css';
const fraunces = localFont({
  src: [
    { path: './fonts/fraunces.woff2', style: 'normal', weight: '100 900' },
    { path: './fonts/fraunces-italic.woff2', style: 'italic', weight: '100 900' },
  ],
  variable: '--font-fraunces',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
});
const nunito = localFont({
  src: [
    { path: './fonts/nunito.woff2', style: 'normal', weight: '200 1000' },
    { path: './fonts/nunito-italic.woff2', style: 'italic', weight: '200 1000' },
  ],
  variable: '--font-nunito',
  display: 'swap',
  adjustFontFallback: 'Arial',
});
const caveat = localFont({
  src: './fonts/caveat.woff2',
  variable: '--font-caveat',
  weight: '400 700',
  display: 'swap',
  preload: false,
});
export const metadata: Metadata = {
  metadataBase: new URL('https://lantern-keeper-valley.timothylee-lyy.chatgpt.site'),
  title: 'The Lantern Keeper · Hantu Codex',
  description:
    'Eight neighbors, playful spirits, and one gathering after the storm. A gentle Southeast Asian folklore adventure.',
  icons: { icon: '/hantu-codex/favicon.svg' },
  openGraph: {
    title: 'The Lantern Keeper · Hantu Codex',
    description: 'Bring the village’s stories home.',
    images: ['/hantu-codex/art/village.webp'],
  },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#0b1026' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      data-scroll-behavior="smooth"
      lang="en"
      className={`${fraunces.variable} ${nunito.variable} ${caveat.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
