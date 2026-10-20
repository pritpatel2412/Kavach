import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { SmoothScroll } from '@kavach/ui';

export const metadata: Metadata = {
  title: "Kavach · Real-Time Scam-Call Guardian for Indian Elders",
  description:
    "The second-device tabletop guardian that listens on speakerphone, detects coercive digital arrest scams, and speaks in a trusted family voice before money is lost.",
  openGraph: {
    title: "Kavach · Real-Time Scam-Call Guardian for Indian Elders",
    description:
      "The second-device tabletop guardian that listens on speakerphone, detects coercive digital arrest scams, and speaks in a trusted family voice before money is lost.",
    url: "https://kavach.ai",
    siteName: "Kavach",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kavach · Real-Time Scam-Call Guardian for Indian Elders",
    description:
      "The second-device tabletop guardian that listens on speakerphone, detects coercive digital arrest scams, and speaks in a trusted family voice before money is lost.",
  },
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
          href="https://fonts.googleapis.com/css2?family=Mulish:wght@500;700&family=Nunito+Sans:wght@500;700&display=swap"
          rel="stylesheet"
        />
        {/* Load Iconify web component */}
        <Script
          src="https://code.iconify.design/iconify-icon/2.1.0/iconify-icon.min.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="bg-canvas text-ink antialiased selection:bg-discount-surface selection:text-green-strong">
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>

  );
}
