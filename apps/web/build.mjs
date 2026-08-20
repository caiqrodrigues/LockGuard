import { cpFile, mkdir } from 'node:fs/promises';
await mkdir('dist',{recursive:true});
for (const f of ['index.html','app.js','style.css','favicon.svg','og-image.png','argon2.umd.min.js']) await cpFile(f,'dist/'+f);
