import type { APIRoute } from "astro";
import { LAUNCHED } from "../config/site.mjs";

export const GET: APIRoute = () => {
  const body = LAUNCHED ? `User-agent: *\nAllow: /\n` : `User-agent: *\nDisallow: /\n`;
  return new Response(body, { headers: { "Content-Type": "text/plain" } });
};
