import { existsSync } from "node:fs";
import { join } from "node:path";

// Resolved from the project root, not import.meta.url: during `astro build` this module runs from a
// bundled chunk in dist/.prerender/, where a relative URL would point at dist/public/photos/ and
// every photo would read as missing.
const PHOTOS_DIR = join(process.cwd(), "public", "photos");

/** Whether a photo file has been dropped into public/photos/. Checked at build time so the
 * page can fall back to the mockup's hatched placeholder while a file is missing. */
export function photoExists(filename: string): boolean {
  return existsSync(join(PHOTOS_DIR, filename));
}
