import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CustomCursor } from '@/components/ui/CustomCursor';
import { GestureControl } from '@/components/gesture/GestureControl';

const fraunces = localFont({
  src: [
    {
      path: './fonts/Fraunces-Variable.ttf',
      weight: '100 900',
      style: 'normal',
    },
    {
      path: './fonts/Fraunces-VariableItalic.ttf',
      weight: '100 900',
      style: 'italic',
    },
  ],
  variable: '--font-fraunces',
  display: 'swap',
});

const spaceGrotesk = localFont({
  src: './fonts/SpaceGrotesk-Variable.ttf',
  weight: '300 700',
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '马晨皓 · AI-Native Product Builder',
  description: '用设计理解人，用系统整理复杂度，用 AI 把想法更快推向真实世界。',
  keywords: ['马晨皓', 'AI', 'Product Builder', '产品设计', 'Creative Development'],
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
        <Navbar />
        <CustomCursor />
        <GestureControl />
        {children}
        <Footer />
      </body>
    </html>
  );
}
