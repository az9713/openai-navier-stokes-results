import type { Metadata } from 'next';
import { Manrope, Source_Serif_4 } from 'next/font/google';
import 'katex/dist/katex.min.css';
import './globals.css';

const manrope = Manrope({ variable: '--font-sans', subsets: ['latin'] });
const sourceSerif = Source_Serif_4({ variable: '--font-serif', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'OpenAI’s Navier–Stokes Result, Explained',
  description:
    'A rigorous interactive guide to the scope, mechanism, significance, and limits of OpenAI’s claimed Navier–Stokes blowup proof.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${sourceSerif.variable}`}>{children}</body>
    </html>
  );
}
