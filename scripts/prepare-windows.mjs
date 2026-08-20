import { cp, rm, mkdir, readdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const source = resolve(root, "apps", "web");
const target = resolve(root, "apps", "windows", "frontend");

await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
for (const name of await readdir(source)) {
  if (name === "vercel.json" || name === "package.json") continue;
  await cp(resolve(source, name), resolve(target, name), { recursive: true });
}
console.log(`Windows frontend synchronized from ${source}`);
