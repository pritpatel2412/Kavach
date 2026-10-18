import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { MockBanner } from '../components/MockBanner';

export const metadata: Metadata = {
  title: "Kavach · Guardian Portal & Household Security",
  description:
    "Real-time monitoring, familial voice interventions, and alert controls for caregivers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Noto+Sans+Gujarati:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <Script
          src="https://code.iconify.design/iconify-icon/2.1.0/iconify-icon.min.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="bg-[#e3e8dc] text-white/90 antialiased selection:bg-[#c8f542] selection:text-[#0a2a12]">
        <MockBanner />
        {children}
      </body>
    </html>
  );
}
