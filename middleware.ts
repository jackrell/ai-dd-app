import { clerkMiddleware } from '@clerk/nextjs/server';

// console.log("Clerk Secret Key:", process.env.CLERK_SECRET_KEY); // debug

export default clerkMiddleware({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export const config = {
  matcher: [
    '/((?!.*\\..*|_next).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
};
