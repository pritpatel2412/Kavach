import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { SmoothScroll } from '@kavach/ui';

export const metadata: Metadata = {
  title: "Kavach · Real-Time Scam-Call Guardian for Indian Elders",
  description:
    "The second-device tabletop guardian that listens on speakerphone, detects coercive digital arrest scams, and speaks in a trusted family voice before money is lost.",
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
        {/* Load Iconify web component */}
        <Script
          src="https://code.iconify.design/iconify-icon/2.1.0/iconify-icon.min.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="bg-[#e3e8dc] text-white/90 antialiased selection:bg-[#c8f542] selection:text-[#0a2a12]">
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
