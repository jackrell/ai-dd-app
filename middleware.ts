import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/folder(.*)',
]);

export default clerkMiddleware({
  publicRoutes: [
    '/', 
    '/api/(.*)'
  ],
  async beforeAuth(req, res, next) {
    if (isProtectedRoute(req)) {
      // Perform any additional checks here if needed
      next();
    } else {
      next();
    }
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};