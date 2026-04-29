import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const isPublic =
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/signup') ||
    pathname === '/';

  if (isPublic) return NextResponse.next();

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (pathname.startsWith('/admin') && token.role !== 'admin') {
    return NextResponse.redirect(new URL('/agent', req.url));
  }

  if (
    (pathname.startsWith('/agent') ||
      pathname.startsWith('/api/leads') ||
      pathname.startsWith('/api/users') ||
      pathname.startsWith('/api/analytics')) &&
    !token
  ) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/agent/:path*', '/api/leads/:path*', '/api/users/:path*', '/api/analytics/:path*'],
};
