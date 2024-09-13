import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { PUBLIC_PATHS } from "@/constants"
 
export function middleware(request: NextRequest) {
  console.log("Inside middleware")
  const accessToken : string | undefined = request.cookies.get('jwt')?.value

  console.log(accessToken)

  const path : string = request.nextUrl.pathname

  // api requests
  if (path.startsWith('/api/')) {
    return NextResponse.next()
  }
  
  // redirect unauthenticated users to sign in page if they try to access protected pages
  if (!accessToken && !isPublicPath(path)) {
      const prevPath : string = encodeURIComponent(path)
      return NextResponse.redirect(new URL(`/signin?from=${prevPath}`, request.url))
  }

  // redirect authenticated users entering public path to home page
  // Exclude '/home' from this check
  if (accessToken && isPublicPath(path) && path !== '/home') {
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