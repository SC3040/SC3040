import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { PUBLIC_PATHS } from "@/constants"
 
export function middleware(request: NextRequest) {

  // const allCookies = request.cookies.getAll();
  // console.log(`[Middleware] All cookies:`, allCookies);

  const jwt = request.cookies.get('jwt');
  console.log(`[Middleware] JWT cookie:`, jwt);

  const path : string = request.nextUrl.pathname

  // Handle all requests, including API and server action requests
  if (path.startsWith('/api/') || path.includes('/route/')) {
    console.log("[Middleware] Handling API or server action request");
    if (!jwt) {
      console.log("[Middleware] No JWT found for API or server action request");
      return new NextResponse(
        JSON.stringify({ message: 'Not authorized. JWT cookie missing or invalid.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    // If JWT exists, clone the request and add the Authorization header
    const newHeaders = new Headers(request.headers);
    newHeaders.set('Authorization', `Bearer ${jwt.value}`);
    return NextResponse.next({
      request: {
        headers: newHeaders,
      },
    });
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