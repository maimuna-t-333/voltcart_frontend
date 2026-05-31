import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = [
  '/checkout',
  '/orders',
  '/profile',
  '/wishlist',
];

const adminRoutes = [
  '/admin',
];

const authRoutes = [
  '/auth/login',
  '/auth/register',
];

function decodeRefreshToken(token: string) {
  try {
    const base64Payload = token.split('.')[1];
    const payload = JSON.parse(
      Buffer.from(base64Payload, 'base64').toString('utf-8')
    );
    return payload;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const refreshToken = request.cookies.get('refreshToken')?.value;
  const isLoggedIn = !!refreshToken;
  const payload = refreshToken ? decodeRefreshToken(refreshToken) : null;
  const isAdmin = payload?.role === 'admin';

  if (isLoggedIn && authRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (!isLoggedIn && protectedRoutes.some(route => pathname.startsWith(route))) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (adminRoutes.some(route => pathname.startsWith(route))) {
    if (!isLoggedIn) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};