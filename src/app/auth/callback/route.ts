import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  return handleCallback(request)
}

export async function POST(request: Request) {
  return handleCallback(request)
}

async function handleCallback(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host')
      const forwardedProto = request.headers.get('x-forwarded-proto')
      const base = forwardedHost
        ? `${forwardedProto || 'https'}://${forwardedHost}`
        : origin
      return NextResponse.redirect(`${base}/dashboard`)
    }
  }

  return NextResponse.redirect(`${origin}/?auth=error`)
}
