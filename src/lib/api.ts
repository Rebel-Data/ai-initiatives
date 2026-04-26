// Next.js `basePath` auto-prefixes <Link> and router.push(), but NOT fetch().
// Any client-side call to the app's own API must go through this helper so the
// `/ai-initiatives` prefix is applied — otherwise the browser hits the LB root
// (or localhost root in dev), which routes to a different app / 404s.
const BASE_PATH = "/ai-initiatives";

export function apiUrl(path: string): string {
  if (!path.startsWith("/")) {
    throw new Error(`apiUrl: path must start with "/", got ${path}`);
  }
  return `${BASE_PATH}${path}`;
}
