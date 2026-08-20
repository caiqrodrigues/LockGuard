import { cp, rm, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const source = resolve(root, "apps", "web");
const target = resolve(root, "apps", "windows", "frontend");

await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
for (const name of await readdir(source)) {
  if (name === "vercel.json" || name === "package.json" || name === "account.js") continue;
  await cp(resolve(source, name), resolve(target, name), { recursive: true });
}

const appPath = resolve(target, "app.js");
const appJs = await readFile(appPath, "utf8");
const accountJs = await readFile(resolve(source, "account.js"), "utf8");
await writeFile(
  appPath,
  appJs + "\n" + accountJs + `\n;(()=>{const el=document.getElementById('versionLabel');if(el)el.textContent='Windows 0.0.2 • Web 0.7.4';})();\n`,
  "utf8"
);

console.log(`Windows frontend synchronized from ${source} — Windows 0.0.2 / Web 0.7.4`);
