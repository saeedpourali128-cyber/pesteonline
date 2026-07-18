import fs from "node:fs/promises";
import { relative, walkFiles } from "./utils.mjs";

const files = await walkFiles("src", new Set([".tsx", ".jsx", ".ts", ".js"]));
const changed = [];

function addSafeRel(tag) {
  if (!/\btarget\s*=\s*["']_blank["']/iu.test(tag) || /\brel\s*=/iu.test(tag)) {
    return tag;
  }
  return tag.replace(/>$/u, ' rel="noopener noreferrer">');
}

function fixImageTag(tag) {
  let next = tag;

  if (
    /\bloading\s*=\s*["']lazy["']/iu.test(next) &&
    !/\bdecoding\s*=/iu.test(next)
  ) {
    next = next.replace(/>$/u, ' decoding="async">');
  }

  const loadingMatches = [
    ...next.matchAll(/\sloading\s*=\s*(\{[^}]*\}|["'][^"']*["'])/giu),
  ];

  if (loadingMatches.length > 1) {
    for (const duplicate of loadingMatches.slice(1).reverse()) {
      const index = duplicate.index ?? -1;
      if (index >= 0) {
        next = `${next.slice(0, index)}${next.slice(
          index + duplicate[0].length,
        )}`;
      }
    }
  }

  return next;
}

for (const file of files) {
  const original = await fs.readFile(file, "utf8");
  const next = original
    .replaceAll("http://pesteonline.com", "https://pesteonline.com")
    .replaceAll("http://www.pesteonline.com", "https://www.pesteonline.com")
    .replace(/<a\b[\s\S]*?>/giu, addSafeRel)
    .replace(/<img\b[\s\S]*?>/giu, fixImageTag);

  if (next !== original) {
    await fs.writeFile(file, next, "utf8");
    changed.push(relative(file));
  }
}

console.log(
  changed.length > 0
    ? `Safe fixes applied to ${changed.length} file(s):\n${changed.join("\n")}`
    : "No deterministic safe fixes were needed.",
);
