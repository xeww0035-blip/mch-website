import type { Metadata } from 'next';
import { Fraunces, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Symbols } from '@/components/toyism/Symbols';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '马晨皓 · AI-Native Product Builder',
  description: '用设计理解人，用系统整理复杂度，用 AI 把想法更快推向真实世界。',
  keywords: ['马晨皓', 'AI', 'Product Builder', '产品设计', 'Toyism'],
  authors: [{ name: '马晨皓' }],
  openGraph: {
    title: '马晨皓 · AI-Native Product Builder',
    description: '用设计理解人，用系统整理复杂度，用 AI 把想法更快推向真实世界。',
    type: 'website',
    locale: 'zh_CN',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className={`${fraunces.variable} ${spaceGrotesk.variable}`}>
      <body>
        <Symbols />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
