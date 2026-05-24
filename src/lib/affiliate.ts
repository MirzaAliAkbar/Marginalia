export function getAffiliateLink(isbn?: string | null): string | null {
  if (!isbn) return null

  const tag = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG || 'marginalia-20'
  const cleanIsbn = isbn.replace(/[^0-9Xx]/g, '')

  if (cleanIsbn.length < 10) return null

  return `https://www.amazon.com/dp/${cleanIsbn}?tag=${tag}`
}
