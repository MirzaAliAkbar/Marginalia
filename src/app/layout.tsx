import type { Metadata } from "next"
import { fontDisplay, fontBody, fontUi } from "@/lib/fonts"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "Marginalia — Where Readers Write",
    template: "%s — Marginalia",
  },
  description:
    "Marginalia is a beautifully designed reading journal and essay platform. Track your books, write literary essays, and build a reading portfolio to share with universities.",
  keywords: [
    "reading journal",
    "book tracker",
    "literary essays",
    "reading portfolio",
    "college application portfolio",
    "book lover",
    "reading community",
  ],
  openGraph: {
    title: "Marginalia — Where Readers Write",
    description:
      "A beautifully designed space for book lovers to track their reading, write literary essays, and build a public intellectual portfolio.",
    url: "https://marginalia.app",
    siteName: "Marginalia",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Marginalia — Where Readers Write",
    description:
      "Track your books, write essays, and share your reading portfolio with the world.",
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL("https://marginalia.app"),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${fontDisplay.variable} ${fontBody.variable} ${fontUi.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Marginalia",
              url: "https://marginalia.app",
              description:
                "A beautifully designed reading journal and essay platform for book lovers.",
              applicationCategory: "Lifestyle",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col relative">
        <div
          className="fixed inset-0 pointer-events-none z-50"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
          }}
        />
        {children}
      </body>
    </html>
  )
}
