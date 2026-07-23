import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'Forex Chart Collector',
  description: 'Fetch OHLC data and export clean chart images for D1, H4, H1, and M15.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
