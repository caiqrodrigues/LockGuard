import { cpFile, mkdir, readFile, writeFile } from 'node:fs/promises';
await mkdir('dist',{recursive:true});
for (const f of ['index.html','app.js','style.css','favicon.svg','og-image.png','argon2.umd.min.js']) await cpFile(f,'dist/'+f);
const app = await readFile('dist/app.js','utf8');
const account = await readFile('account.js','utf8');
await writeFile('dist/app.js', app + '\n' + account + '\n', 'utf8');
