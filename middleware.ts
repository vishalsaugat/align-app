import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host') || ''
  
  // Extract subdomain
  const hostParts = hostname.split('.')
  let subdomain = ''
  
  // Handle different hostname patterns
  if (hostname.includes('localhost')) {
    // For local development: app.localhost:3000
    const parts = hostname.split('.')
    if (parts.length > 1 && parts[0] !== 'localhost') {
      subdomain = parts[0]
    }
  } else {
    // For production: app.align.co
    if (hostParts.length >= 3) {
      subdomain = hostParts[0]
    }
  }

  // Handle app subdomain
  if (subdomain === 'app') {
    // Rewrite to app routes
    url.pathname = `/app${url.pathname}`
    return NextResponse.rewrite(url)
  }

  // Auth protection logic
  const { pathname } = request.nextUrl
  
  // Public routes that don't require authentication
  const publicRoutes = ['/', '/api/waitlist', '/api/webhook', '/api/auth']
  
  // Auth routes (login page)
  const authRoutes = ['/']
  
  // Check if the current path is public or starts with a public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )
  
  if (isPublicRoute) {
    return NextResponse.next()
  }
  
  // Get the JWT token to check authentication
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  
  // Check if user is trying to access auth pages while logged in
  if (authRoutes.includes(pathname) && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // Check if user is trying to access protected routes without auth
  if (!token && !authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/app', request.url))
  }

  // Default behavior
  return NextResponse.next()
}

export const config = {
  // Match all paths except for API routes, static files, and Next.js internals
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp).*)',
  ],
}