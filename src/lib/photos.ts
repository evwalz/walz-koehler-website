import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const PHOTOS_DIR = fileURLToPath(new URL("../../public/photos/", import.meta.url));

/** Whether a photo file has been dropped into public/photos/. Checked at build time so the
 * page can fall back to the mockup's hatched placeholder while a file is missing. */
export function photoExists(filename: string): boolean {
  return existsSync(join(PHOTOS_DIR, filename));
}
