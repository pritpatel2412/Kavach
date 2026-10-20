import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { AdminBanner } from '../components/AdminBanner';

export const metadata: Metadata = {
  title: "Kavach · Administration & Operations Console [MOCK]",
  description:
    "Internal administration console for Kavach operations, detector weights, telemetry, and data-rights queue.",
  openGraph: {
    title: "Kavach · Administration & Operations Console [MOCK]",
    description:
      "Internal administration console for Kavach operations, detector weights, telemetry, and data-rights queue.",
    url: "https://kavach.ai/admin",
    siteName: "Kavach",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kavach · Administration & Operations Console [MOCK]",
    description:
      "Internal administration console for Kavach operations, detector weights, telemetry, and data-rights queue.",
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
        <Script
          src="https://code.iconify.design/iconify-icon/2.1.0/iconify-icon.min.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="bg-canvas text-ink antialiased selection:bg-discount-surface selection:text-green-strong">
        <AdminBanner />
        {children}
      </body>
    </html>

  );
}
