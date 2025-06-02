import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accendiaAuthCookie = request.cookies.get('accendia-auth-cookie');
  let isAuthenticatedByCookie = false;

  if (accendiaAuthCookie) {
    try {
      if (accendiaAuthCookie.value === "true") {
        isAuthenticatedByCookie = true;
      }
    } catch (error) {
      console.error("Error parsing auth cookie in middleware:", error);
    }
  }
  
  const isAuthPage = pathname.startsWith('/login');

  if (isAuthPage) {
    if (isAuthenticatedByCookie) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  } else if (pathname.startsWith('/dashboard') || pathname === '/') {
    if (!isAuthenticatedByCookie) {
      if (pathname === '/') {
         return NextResponse.redirect(new URL('/login', request.url));
      }
      return NextResponse.redirect(new URL('/login?redirect=' + encodeURIComponent(pathname), request.url));
    }
    if(pathname === '/'){
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/login'],
};
