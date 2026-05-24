import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/library', '/stats', '/write', '/admin'],
    },
    sitemap: 'https://marginalia.app/sitemap.xml',
  }
}
