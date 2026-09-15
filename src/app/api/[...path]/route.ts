import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

const BODYLESS_METHODS = new Set(["GET", "HEAD"]);

async function proxyRequest(request: Request, context: RouteContext) {
  const apiUrl = process.env.API_URL;

  if (!apiUrl) {
    return NextResponse.json(
      { message: "Сервер API не налаштований." },
      { status: 500 },
    );
  }

  const { path } = await context.params;
  const incomingUrl = new URL(request.url);
  const encodedPath = path.map(encodeURIComponent).join("/");
  const targetUrl = new URL(`/api/${encodedPath}${incomingUrl.search}`, apiUrl);
  const headers = new Headers(request.headers);

  // This is now a server-to-server request. Removing browser-only headers also
  // prevents the API from treating Vercel as an untrusted browser origin.
  headers.delete("host");
  headers.delete("content-length");
  headers.delete("origin");

  try {
    const upstreamResponse = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: BODYLESS_METHODS.has(request.method)
        ? undefined
        : await request.arrayBuffer(),
      cache: "no-store",
      redirect: "manual",
    });
    const responseHeaders = new Headers(upstreamResponse.headers);

    // The browser communicates with this route on the same origin, so upstream
    // CORS headers are unnecessary. Set-Cookie is intentionally preserved: the
    // browser will store the session for the frontend domain as a first-party cookie.
    responseHeaders.delete("access-control-allow-credentials");
    responseHeaders.delete("access-control-allow-headers");
    responseHeaders.delete("access-control-allow-methods");
    responseHeaders.delete("access-control-allow-origin");

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });
  } catch {
    return NextResponse.json(
      { message: "Сервер тимчасово недоступний. Спробуйте ще раз." },
      { status: 502 },
    );
  }
}

export const dynamic = "force-dynamic";

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
export const OPTIONS = proxyRequest;
