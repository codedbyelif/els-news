import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";

const GATE_COOKIE = "els_gate";

function getSecret(): string {
  return process.env.SESSION_SECRET || "els-news-dev-secret-change-me";
}

function isValidGateToken(token: string | undefined): boolean {
  if (!token) return false;
  const idx = token.lastIndexOf(".");
  if (idx === -1) return false;
  const value = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = createHmac("sha256", getSecret()).update(value).digest("hex");
  try {
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expected, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Kapı sayfası ve gate action'ı her zaman erişilebilir olmalı.
  if (pathname === "/kapi") {
    return NextResponse.next();
  }

  const token = request.cookies.get(GATE_COOKIE)?.value;
  if (isValidGateToken(token)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/kapi";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  // Statik dosyalar, görseller ve metadata hariç tüm yollarda çalış.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)",
  ],
};
