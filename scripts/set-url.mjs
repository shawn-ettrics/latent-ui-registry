// After `shadcn build`, point every registry link at the live host.
// Set REGISTRY_URL in the Cloudflare build settings (e.g. https://latent-ui-registry.<you>.workers.dev).
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const DEFAULT = "https://latent-ui-registry.pages.dev";
const url = (process.env.REGISTRY_URL || DEFAULT).replace(/\/+$/, "");
if (url === DEFAULT) { console.log(`registry URL: ${url} (default)`); process.exit(0); }
const dir = "public/r";
let n = 0;
for (const f of readdirSync(dir).filter((f) => f.endsWith(".json"))) {
  const p = `${dir}/${f}`, s = readFileSync(p, "utf8");
  if (s.includes(DEFAULT)) { writeFileSync(p, s.split(DEFAULT).join(url)); n++; }
}
console.log(`registry URL: ${url} (rewrote ${n} files)`);
