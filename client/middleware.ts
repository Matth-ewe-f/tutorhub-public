import { authMiddleware } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";
 
export default authMiddleware({
  publicRoutes: ['/', '/createAccount', '/signIn']
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};