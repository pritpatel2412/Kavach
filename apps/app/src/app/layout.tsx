import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: "Kavach · Guardian Portal & Household Security",
  description:
    "Real-time monitoring, familial voice interventions, and alert controls for caregivers.",
  openGraph: {
    title: "Kavach · Guardian Portal & Household Security",
    description:
      "Real-time monitoring, familial voice interventions, and alert controls for caregivers.",
    url: "https://kavach.ai/app",
    siteName: "Kavach",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kavach · Guardian Portal & Household Security",
    description:
      "Real-time monitoring, familial voice interventions, and alert controls for caregivers.",
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
        {children}
      </body>
    </html>

  );
}
