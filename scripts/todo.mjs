#!/usr/bin/env node
// Lists every remaining `TODO:` placeholder in the content files, with file + key path,
// so the operators can see what still needs filling in before launch (spec §4, §11.4).
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { parse } from "yaml";

const contentDir = fileURLToPath(new URL("../src/content/", import.meta.url));
const files = readdirSync(contentDir).filter((f) => f.endsWith(".yaml")).sort();

function walk(value, path, out) {
  if (typeof value === "string") {
    if (value.startsWith("TODO:")) out.push({ path, value: value.slice("TODO:".length).trim() });
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((v, i) => walk(v, `${path}[${i}]`, out));
    return;
  }
  if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) walk(v, path ? `${path}.${k}` : k, out);
  }
}

let total = 0;
for (const file of files) {
  const doc = parse(readFileSync(join(contentDir, file), "utf8"));
  const found = [];
  walk(doc, "", found);
  console.log(`\n${file} (${found.length} placeholder${found.length === 1 ? "" : "s"})`);
  for (const { path, value } of found) {
    console.log(`  ${path}: ${value}`);
  }
  total += found.length;
}

console.log(`\n${total} placeholder${total === 1 ? "" : "s"} total.`);
