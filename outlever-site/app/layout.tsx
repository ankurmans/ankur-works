import type { Metadata } from "next";
import localFont from "next/font/local";
import { AnalyticsHooks } from "./Interactions";
import "./globals.css";
import "./outlever-theme.css";
import "./refactor.css";
import "./native-pass.css";

const inter = localFont({
  src: "./fonts/inter-latin.woff2",
  variable: "--font-inter",
  weight: "400 900",
  display: "swap",
});

const sitePublished = process.env.SITE_PUBLISHED === "1";
const siteUrl = "https://outlever.ankur.works";
const title = "You built the media machine. | Ankur Research";
const description =
  "An independent look at Outlever's newsroom machine and a proposed search, AI, and buyer-routing layer to test.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  alternates: { canonical: "/" },
  robots: sitePublished ? { index: true, follow: true } : { index: false, follow: false, noarchive: true },
  openGraph: {
    type: "article",
    url: siteUrl,
    title,
    description,
    siteName: "Ankur Research",
    publishedTime: "2026-10-01T00:00:00Z",
    authors: ["Ankur Shrestha"],
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Ankur Research: You built the media machine." }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/opengraph-image"],
  },
};

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Ankur Research",
    url: siteUrl,
    sameAs: ["https://ankur.works/"],
  },
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "You built the media machine.",
    description,
    datePublished: "2026-10-01",
    author: { "@type": "Person", name: "Ankur Shrestha", url: "https://ankur.works/" },
    publisher: { "@type": "Organization", name: "Ankur Research", url: siteUrl },
    mainEntityOfPage: siteUrl,
    about: [
      { "@type": "Organization", name: "Outlever", url: "https://www.outlever.com/" },
      { "@type": "WebSite", name: "State of Brand", url: "https://www.thestateofbrand.com/" },
    ],
  },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <AnalyticsHooks />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
        />
        {children}
      </body>
    </html>
  );
}
