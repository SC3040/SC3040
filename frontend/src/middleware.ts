import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { PUBLIC_PATHS } from "@/constants"
 
export function middleware(request: NextRequest) {

  // const allCookies = request.cookies.getAll();
  // console.log(`[Middleware] All cookies:`, allCookies);

  const jwt = request.cookies.get('jwt');
  console.log(`[Middleware] JWT cookie:`, jwt);

  const path : string = request.nextUrl.pathname

  // api requests
  if (path.startsWith('/api/')) {
    return NextResponse.next()
  }
  
  // redirect unauthenticated users to sign in page if they try to access protected pages
  if (jwt === undefined && !isPublicPath(path)) {
      const prevPath : string = encodeURIComponent(path)
      return NextResponse.redirect(new URL(`/signin?from=${prevPath}`, request.url))
  }

  // redirect authenticated users entering public path to home page
  // Exclude '/home' from this check
  if (jwt !== undefined && isPublicPath(path) && path !== '/home') {
      return NextResponse.redirect(new URL('/home', request.url))
  }

  return NextResponse.next()
}
 
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}

const publicPaths: Set<string> = new Set(PUBLIC_PATHS)
function isPublicPath(path: string): boolean {
    return publicPaths.has(path)
}