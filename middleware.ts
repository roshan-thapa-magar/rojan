import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define protected routes and their allowed roles
const protectedRoutes = {
  '/dashboard': ['admin', 'barber'],
  '/barbers': ['admin'],
  '/clients': ['admin', 'barber'],
  '/bookings': ['admin', 'barber'],
  '/add-services': ['admin'],
  '/inventory': ['admin', 'barber'],
  '/reports': ['admin'],
  '/profile': ['admin', 'barber'],
  '/settings': ['admin', 'barber'],
};

// Routes that should be accessible to all authenticated users
const publicRoutes = ['/', '/about', '/services', '/appointment', '/account'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for API routes, static files, and public routes
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/image/') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password') ||
    publicRoutes.includes(pathname)
  ) {
    return NextResponse.next();
  }

  // Check if the route is protected
  const isProtectedRoute = Object.keys(protectedRoutes).some(route => 
    pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  try {
    // Get the JWT token from the request
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    // If no token, redirect to login
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check if user has the required role for this route
    const userRole = token.role as string;
    const requiredRoles = Object.entries(protectedRoutes).find(([route]) => 
      pathname.startsWith(route)
    )?.[1] || [];

    if (!requiredRoles.includes(userRole)) {
      // User doesn't have permission - redirect to not found page
      const notFoundUrl = new URL('/not-found', request.url);
      return NextResponse.redirect(notFoundUrl);
    }

    // User has permission, continue
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    // On error, redirect to login for safety
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - image/ (public images)
     * - login, register, forgot-password, reset-password (auth pages)
     */
    '/((?!api|_next/static|_next/image|favicon|image|login|register|forgot-password|reset-password).*)',
  ],
};
