import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/folder(.*)',
]);

export default clerkMiddleware({
  secretKey: process.env.CLERK_SECRET_KEY,
  async onAuth(req, res, next) {
    if (isProtectedRoute(req)) {
      try {
        await req.auth.verify();
        next();
      } catch (err) {
        res.status(401).send('Unauthorized');
      }
    } else {
      next();
    }
  },
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
