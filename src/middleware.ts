import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  // Các route không cần đăng nhập
  const publicPaths = ["/signin", "/signup", "/_next", "/favicon.ico"];

  const isPublic = publicPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // Nếu là route private và không có token → redirect
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  // Nếu đã đăng nhập mà cố vào /signin hoặc /signup thì redirect về /
  if (token && ["/signin", "/signup"].includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|static|.*\\..*).*)"],
};