import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Hapus semua logika pengecekan sessionId/token

  // Opsional: Jika user membuka root domain ('/'), langsung lempar ke dashboard
  // karena kita tidak lagi menggunakan halaman login/landing page.
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Loloskan semua request tanpa pengecekan
  return NextResponse.next()
}

export const config = {
  // Matcher tetap sama untuk mengabaikan file statis & API
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}