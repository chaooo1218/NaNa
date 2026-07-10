export function GET() {
  return new Response("User-agent: *\nAllow: /\n# Sitemap will be enabled after the canonical public domain is confirmed.\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
