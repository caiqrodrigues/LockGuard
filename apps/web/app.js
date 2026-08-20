const $=id=>document.getElementById(id);
const APP_VERSION='0.7.3';
const SUPABASE_URL='https://xyjxznihdnqqcsbtfulh.supabase.co';
const SUPABASE_KEY='sb_publishable_ceho4hLIMAczMa46dXDrRA_p_H_Pm7A';
const AUTH_KEY='lockguard.auth.v1',LEGACY_KEY='lockguard.vault.v1',VAULT_PREFIX='lockguard.vault.v2.';
const COMMON=['password','senha','admin','qwerty','letmein','welcome','123456','12345678','abc123','iloveyou','dragon','master','login','user','teste'];
const ARGON_MEMORY_KIB=65536,ARGON_TIME=3,ARGON_PARALLELISM=1;
const LEAK_SCAN_INTERVAL=24*60*60*1000, STALE_DAYS=365;
let auth={user:null,access:null,refresh:null,mode:'login'};
let vault={key:null,items:[],salt:null,iterations:310000,kdf:'argon2id',memory:ARGON_MEMORY_KIB,time:ARGON_TIME,parallelism:ARGON_PARALLELISM,security:{},editing:null};
let idleTimer=null,fail=0,blockedUntil=0,clipTimer=null,leakTimer=null,extensionReady=false;

function toast(t){const e=$('toast');e.textContent=t;e.classList.add('show');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('show'),2300)}
function norm(s){return(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
function randInt(max){const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]%(max)}
function shuffle(a){for(let i=a.length-1;i>0;i--){let j=randInt(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
function esc(s=''){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function daysSince(iso){if(!iso)return 9999;return Math.floor((Date.now()-new Date(iso).getTime())/86400000)}
function itemType(x){return x?.type||'login'}
function itemTypeName(t){return({login:'LOGIN',note:'NOTA',card:'CARTÃO',address:'ENDEREÇO',document:'DOCUMENTO'})[t]||'ITEM'}

function analyze(p,context=''){
  if(!p)return{score:0,label:'AGUARDANDO',bits:0,feedback:['Digite uma senha para começar.']};
  let sets=0;if(/[a-z]/.test(p))sets+=26;if(/[A-Z]/.test(p))sets+=26;if(/\d/.test(p))sets+=10;if(/[^A-Za-z0-9]/.test(p))sets+=30;
  let bits=p.length*Math.log2(Math.max(sets,1)),score=Math.min(100,Math.round(bits*.92)),fb=[];
  if(p.length<10){score-=30;fb.push('Senha muito curta.')}else if(p.length<14){score-=12;fb.push('Prefira 14 caracteres ou mais.')}else fb.push('Bom comprimento.');
  if(!/[A-Z]/.test(p)){score-=6;fb.push('Sem letras maiúsculas.')}if(!/[a-z]/.test(p)){score-=6;fb.push('Sem letras minúsculas.')}if(!/\d/.test(p)){score-=6;fb.push('Sem números.')}if(!/[^A-Za-z0-9]/.test(p)){score-=6;fb.push('Sem símbolos.')}
  let n=norm(p);for(const w of COMMON)if(n.includes(w)){score-=24;fb.push('Palavra ou padrão comum detectado.');break}
  if(/(.)\1{2,}/.test(p)){score-=15;fb.push('Há caracteres repetidos em sequência.')}
  const seq=['0123456789','9876543210','abcdefghijklmnopqrstuvwxyz','zyxwvutsrqponmlkjihgfedcba','qwertyuiop','asdfghjkl','zxcvbnm'];
  outer:for(const s of seq)for(let i=0;i<=s.length-4;i++)if(n.includes(s.slice(i,i+4))){score-=18;fb.push('Sequência previsível detectada.');break outer}
  if(/(19|20)\d{2}/.test(p)||/\b\d{6,8}\b/.test(p)){score-=10;fb.push('Pode conter uma data ou número previsível.')}
  if(context&&norm(context).length>2&&n.includes(norm(context))){score-=18;fb.push('A senha contém o nome do serviço/contexto.')}
  score=Math.max(0,Math.min(100,score));
  let label=score<25?'MUITO FRACA':score<45?'FRACA':score<65?'MÉDIA':score<85?'FORTE':'MUITO FORTE';
  return{score,label,bits:Math.round(bits),feedback:fb}
}
function renderStrength(kind,r){$(kind+'Score').textContent=kind==='test'?r.score:r.score+'/100';$(kind+'Bar').style.width=r.score+'%';$(kind+'Badge').textContent=r.label;if(kind==='test')$('testLabel').textContent=r.label;$(kind+'Feedback').innerHTML=r.feedback.map(x=>'<div>'+esc(x)+'</div>').join('')}
function generate(){
  let pools=[],ban=$('ambiguous').checked?'0Oo1lI':'',add=(on,s)=>{if(on){s=[...s].filter(c=>!ban.includes(c)).join('');pools.push(s)}};
  add($('upper').checked,'ABCDEFGHIJKLMNOPQRSTUVWXYZ');add($('lower').checked,'abcdefghijklmnopqrstuvwxyz');add($('numbers').checked,'0123456789');add($('symbols').checked,'!@#$%^&*()-_=+[]{};:,.?');
  if(!pools.length){toast('ATIVE AO MENOS UM TIPO');return}
  let len=+$('length').value,out=[];for(const p of pools)out.push(p[randInt(p.length)]);let all=pools.join('');while(out.length<len)out.push(all[randInt(all.length)]);
  out=shuffle(out).join('');for(let i=0;i<30;i++){let r=analyze(out,$('passwordFor').value);if(r.score>=85)break;out=[...out].map((c,j)=>j%3===0?all[randInt(all.length)]:c).join('')}
  $('generated').value=out;renderStrength('gen',analyze(out,$('passwordFor').value))
}
function copyText(v){navigator.clipboard.writeText(v).then(()=>toast('COPIADO')).catch(()=>toast('NÃO FOI POSSÍVEL COPIAR'))}
function switchView(v){document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.view===v));document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));$('view-'+v).classList.add('active');if(v==='vault'){syncOnLogin();vaultUI()}if(v==='dashboard')renderDashboard()}
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>switchView(b.dataset.view));
$('generateBtn').onclick=generate;$('copyGen').onclick=()=>copyText($('generated').value);$('showGen').onclick=()=>{$('generated').type=$('generated').type==='password'?'text':'password'};$('generated').type='text';
$('length').oninput=()=>{$('lengthLabel').textContent=$('length').value;generate()};$('minus').onclick=()=>{$('length').value=Math.max(6,+$('length').value-1);$('length').oninput()};$('plus').onclick=()=>{$('length').value=Math.min(64,+$('length').value+1);$('length').oninput()};
['upper','lower','numbers','symbols','ambiguous'].forEach(id=>$(id).onchange=generate);$('passwordFor').oninput=()=>renderStrength('gen',analyze($('generated').value,$('passwordFor').value));
$('testPassword').oninput=()=>renderStrength('test',analyze($('testPassword').value));$('showTest').onclick=()=>{$('testPassword').type=$('testPassword').type==='password'?'text':'password'};

async function passwordExposureCount(password){
  const digest=await crypto.subtle.digest('SHA-1',new TextEncoder().encode(password));
  const hex=[...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('').toUpperCase();
  const prefix=hex.slice(0,5),suffix=hex.slice(5);
  const res=await fetch('https://api.pwnedpasswords.com/range/'+prefix,{headers:{'Add-Padding':'true'}});
  if(!res.ok)throw Error('HIBP_UNAVAILABLE');
  const text=await res.text();
  for(const line of text.split(/\r?\n/)){const [h,c]=line.trim().split(':');if(h===suffix)return Number(c)||1}
  return 0
}
async function sha1Parts(password){const d=await crypto.subtle.digest('SHA-1',enc(password));const hex=[...new Uint8Array(d)].map(b=>b.toString(16).padStart(2,'0')).join('').toUpperCase();return{prefix:hex.slice(0,5),suffix:hex.slice(5)}}

function ah(token){let h={'apikey':SUPABASE_KEY,'Content-Type':'application/json'};if(token)h.Authorization='Bearer '+token;return h}
async function af(path,opt={}){let r=await fetch(SUPABASE_URL+path,opt),d={};try{d=await r.json()}catch{}if(!r.ok)throw Error(d.msg||d.message||d.error_description||d.error||'Falha de autenticação');return d}
function saveSession(){auth.refresh?localStorage.setItem(AUTH_KEY,JSON.stringify({refresh:auth.refresh})):localStorage.removeItem(AUTH_KEY)}
async function setSession(d){let s=d.session||d;if(!s.access_token)return false;auth.access=s.access_token;auth.refresh=s.refresh_token;auth.user=s.user||d.user;saveSession();accountUI();await migrateLegacy();await syncOnLogin();return true}
async function restoreSession(){let x;try{x=JSON.parse(localStorage.getItem(AUTH_KEY)||'null')}catch{}if(!x?.refresh){accountUI();return}try{let d=await af('/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:ah(),body:JSON.stringify({refresh_token:x.refresh})});await setSession(d)}catch{localStorage.removeItem(AUTH_KEY);accountUI()}}
function accountUI(){$('accountBtn').textContent=auth.user?'CONTA':'ENTRAR';$('accountBtn').classList.toggle('signed',!!auth.user);vaultUI()}
function authOpen(mode='login'){auth.mode=mode;$('authModal').classList.remove('hidden');authMode(mode);$('authMessage').classList.add('hidden');setTimeout(()=>$('authEmail').focus(),30)}
function authMode(m){auth.mode=m;let s=m==='signup';$('loginTab').classList.toggle('active',!s);$('signupTab').classList.toggle('active',s);$('authConfirmWrap').classList.toggle('hidden',!s);$('submitAuth').textContent=s?'CRIAR CONTA':'ENTRAR';$('authTitle').textContent=s?'Criar conta LockGuard':'Acessar LockGuard'}
function authMsg(t){$('authMessage').textContent=t;$('authMessage').classList.remove('hidden')}
async function authSubmit(){
  let email=$('authEmail').value.trim().toLowerCase(),pass=$('authPassword').value;if(!email.includes('@'))return authMsg('Informe um e-mail válido.');if(pass.length<10)return authMsg('Use pelo menos 10 caracteres.');
  try{$('submitAuth').disabled=true;
    if(auth.mode==='signup'){
      if(pass!==$('authConfirm').value)return authMsg('As senhas não conferem.');
      authMsg('Verificando vazamentos conhecidos...');
      let exposed;try{exposed=await passwordExposureCount(pass)}catch{return authMsg('Não foi possível verificar vazamentos agora. Tente novamente.')}
      if(exposed>0)return authMsg('Esta senha já apareceu em vazamentos conhecidos ('+exposed.toLocaleString('pt-BR')+' ocorrências). Escolha outra.');
      let d=await af('/auth/v1/signup?redirect_to='+encodeURIComponent(location.origin),{method:'POST',headers:ah(),body:JSON.stringify({email,password:pass})});
      if(d.access_token||d.session?.access_token){await setSession(d);$('authModal').classList.add('hidden');toast('CONTA CRIADA')}else{authMsg('Conta criada. Confirme seu e-mail e depois entre.');authMode('login')}
    }else{let d=await af('/auth/v1/token?grant_type=password',{method:'POST',headers:ah(),body:JSON.stringify({email,password:pass})});await setSession(d);$('authModal').classList.add('hidden');toast('CONECTADO')}
  }catch(e){authMsg(e.message)}finally{$('submitAuth').disabled=false}
}
async function logout(){try{await fetch(SUPABASE_URL+'/auth/v1/logout',{method:'POST',headers:ah(auth.access)})}catch{}lockVault(false);auth={user:null,access:null,refresh:null,mode:'login'};saveSession();accountUI();toast('CONTA DESCONECTADA')}
$('accountBtn').onclick=()=>auth.user?(confirm('Sair da conta LockGuard?')&&logout()):authOpen();$('gateLogin').onclick=()=>authOpen();$('closeAuth').onclick=()=>$('authModal').classList.add('hidden');$('loginTab').onclick=()=>authMode('login');$('signupTab').onclick=()=>authMode('signup');$('submitAuth').onclick=authSubmit;$('authPassword').onkeydown=e=>{if(e.key==='Enter')authSubmit()};

function storageKey(){return auth.user?VAULT_PREFIX+auth.user.id:LEGACY_KEY}
function stored(){try{return JSON.parse(localStorage.getItem(storageKey())||'null')}catch{return null}}
function store(v){localStorage.setItem(storageKey(),JSON.stringify(v))}
function b64(b){return btoa(String.fromCharCode(...new Uint8Array(b)))}function unb64(s){return Uint8Array.from(atob(s),c=>c.charCodeAt(0))}
const enc=s=>new TextEncoder().encode(s),dec=b=>new TextDecoder().decode(b);
async function derivePBKDF2(master,salt,it=310000){let m=await crypto.subtle.importKey('raw',enc(master),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:it,hash:'SHA-256'},m,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
async function deriveArgon2id(master,salt,memory=ARGON_MEMORY_KIB,time=ARGON_TIME,parallelism=ARGON_PARALLELISM){if(!window.hashwasm?.argon2id)throw Error('ARGON2ID_INDISPONIVEL');const raw=await window.hashwasm.argon2id({password:enc(master),salt,parallelism,iterations:time,memorySize:memory,hashLength:32,outputType:'binary'});return crypto.subtle.importKey('raw',raw,{name:'AES-GCM'},false,['encrypt','decrypt'])}
async function deriveVaultKey(master,salt,meta={}){const alg=meta.kdf_algorithm||meta.kdf||'pbkdf2-sha256';if(alg==='argon2id')return deriveArgon2id(master,salt,meta.kdf_memory_kib||meta.memory||ARGON_MEMORY_KIB,meta.kdf_time_cost||meta.time||ARGON_TIME,meta.kdf_parallelism||meta.parallelism||ARGON_PARALLELISM);return derivePBKDF2(master,salt,meta.kdf_iterations||meta.iterations||310000)}
async function encryptObj(o,k){let iv=crypto.getRandomValues(new Uint8Array(12)),c=await crypto.subtle.encrypt({name:'AES-GCM',iv},k,enc(JSON.stringify(o)));return{iv:b64(iv),data:b64(c)}}
async function decryptObj(p,k){let d=await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(p.iv)},k,unb64(p.data));return JSON.parse(dec(d))}
function arm(){if(!vault.key)return;clearTimeout(idleTimer);idleTimer=setTimeout(()=>lockVault(),120000)}
['click','keydown','touchstart'].forEach(e=>document.addEventListener(e,arm,{passive:true}));

function vaultUI(){
  let signed=!!auth.user,open=!!vault.key,exists=!!stored();
  $('vaultGate').classList.toggle('hidden',signed);$('vaultLocked').classList.toggle('hidden',!signed||open);$('vaultOpen').classList.toggle('hidden',!open);
  if(signed&&!open){$('vaultTitle').textContent=exists?'Desbloquear cofre':'Criar cofre';$('vaultText').textContent=exists?'Digite sua senha mestra para descriptografar o cofre neste dispositivo.':'Defina uma senha mestra forte. Ela nunca é enviada ao servidor.';$('masterConfirmWrap').classList.toggle('hidden',exists);$('unlockBtn').textContent=exists?'DESBLOQUEAR':'CRIAR COFRE'}
  renderDashboard()
}
async function persist(){
  let now=new Date().toISOString(),cur=stored()||{},payload=await encryptObj({items:vault.items,security:vault.security||{},updatedAt:now},vault.key);
  let v={version:2,iterations:vault.iterations||310000,kdf_algorithm:vault.kdf||'argon2id',kdf_memory_kib:vault.kdf==='argon2id'?(vault.memory||ARGON_MEMORY_KIB):null,kdf_time_cost:vault.kdf==='argon2id'?(vault.time||ARGON_TIME):null,kdf_parallelism:vault.kdf==='argon2id'?(vault.parallelism||ARGON_PARALLELISM):null,salt:cur.salt||b64(vault.salt),payload,localUpdatedAt:now,cloudRevision:cur.cloudRevision||0,lastCloudSyncedAt:cur.lastCloudSyncedAt||null};
  store(v);try{await pushCloud(v)}catch(e){if(String(e.message||e).includes('revision_conflict')){cloudStatus('CONFLITO','bad');await handleRevisionConflict()}else cloudStatus('PENDENTE','bad')}
  broadcastExtension();renderDashboard()
}
async function unlock(){
  if(!auth.user)return authOpen();if(Date.now()<blockedUntil)return toast('AGUARDE PARA TENTAR NOVAMENTE');
  let master=$('master').value,cur=stored();if(!cur){let r=analyze(master);if(master.length<12||r.score<65)return toast('SENHA MESTRA FRACA');if(master!==$('masterConfirm').value)return toast('AS SENHAS NÃO CONFEREM')}
  try{
    let isNew=!cur,salt=isNew?crypto.getRandomValues(new Uint8Array(32)):unb64(cur.salt),key=await deriveVaultKey(master,salt,isNew?{kdf_algorithm:'argon2id'}:cur),items=[],security={};
    if(cur){let d=await decryptObj(cur.payload,key);items=(d.items||[]).map(x=>({...x,type:x.type||'login'}));security=d.security||{}}
    if(isNew){vault={key,items:[],security:{},salt,iterations:310000,kdf:'argon2id',memory:ARGON_MEMORY_KIB,time:ARGON_TIME,parallelism:ARGON_PARALLELISM,editing:null};await persist()}
    else if((cur.kdf_algorithm||'pbkdf2-sha256')!=='argon2id'){
      toast('ATUALIZANDO CRIPTOGRAFIA PARA ARGON2ID...');const newSalt=crypto.getRandomValues(new Uint8Array(32)),newKey=await deriveArgon2id(master,newSalt);
      vault={key:newKey,items,security,salt:newSalt,iterations:310000,kdf:'argon2id',memory:ARGON_MEMORY_KIB,time:ARGON_TIME,parallelism:ARGON_PARALLELISM,editing:null};
      store({...cur,salt:b64(newSalt),kdf_algorithm:'argon2id',kdf_memory_kib:ARGON_MEMORY_KIB,kdf_time_cost:ARGON_TIME,kdf_parallelism:ARGON_PARALLELISM});await persist();toast('COFRE MIGRADO PARA ARGON2ID')
    }else vault={key,items,security,salt,iterations:cur.iterations||310000,kdf:'argon2id',memory:cur.kdf_memory_kib||ARGON_MEMORY_KIB,time:cur.kdf_time_cost||ARGON_TIME,parallelism:cur.kdf_parallelism||ARGON_PARALLELISM,editing:null};
    fail=0;$('master').value='';$('masterConfirm').value='';renderVault();arm();vaultUI();broadcastExtension();toast('COFRE DESBLOQUEADO');scheduleLeakMonitoring()
  }catch(e){if(String(e.message||e).includes('ARGON2ID_INDISPONIVEL'))return toast('ARGON2ID NÃO CARREGOU. ATUALIZE A PÁGINA.');fail++;if(fail>=5){blockedUntil=Date.now()+30000;fail=0;toast('BLOQUEADO POR 30s')}else toast('SENHA MESTRA INCORRETA '+fail+'/5')}
}
function lockVault(msg=true){clearTimeout(idleTimer);clearTimeout(leakTimer);vault={key:null,items:[],security:{},salt:null,iterations:310000,kdf:'argon2id',memory:ARGON_MEMORY_KIB,time:ARGON_TIME,parallelism:ARGON_PARALLELISM,editing:null};window.postMessage({source:'lockguard-web',type:'LOCKGUARD_VAULT_LOCK'},location.origin);vaultUI();if(msg)toast('COFRE BLOQUEADO')}
$('unlockBtn').onclick=unlock;$('master').onkeydown=e=>{if(e.key==='Enter')unlock()};$('masterConfirm').onkeydown=e=>{if(e.key==='Enter')unlock()};$('lockBtn').onclick=()=>lockVault();document.addEventListener('visibilitychange',()=>{if(document.hidden&&vault.key)lockVault(false)});

async function cr(path,opt={}){if(!auth.access)throw Error('Sem sessão');let r=await fetch(SUPABASE_URL+'/rest/v1/'+path,{...opt,headers:{...ah(auth.access),...(opt.headers||{})}}),t=await r.text(),d=t?JSON.parse(t):null;if(!r.ok)throw Error(d?.message||'Falha de sincronização');return d}
async function cloudGet(){if(!auth.user)return null;let a=await cr('user_vaults?select=user_id,vault_ciphertext,vault_iv,vault_salt,kdf_iterations,vault_version,revision,updated_at,kdf_algorithm,kdf_memory_kib,kdf_time_cost,kdf_parallelism&user_id=eq.'+auth.user.id);return a?.[0]||null}
function fromCloud(r){return{version:r.vault_version||1,iterations:r.kdf_iterations||310000,kdf_algorithm:r.kdf_algorithm||'pbkdf2-sha256',kdf_memory_kib:r.kdf_memory_kib,kdf_time_cost:r.kdf_time_cost,kdf_parallelism:r.kdf_parallelism,salt:r.vault_salt,payload:{iv:r.vault_iv,data:r.vault_ciphertext},localUpdatedAt:r.updated_at,cloudRevision:+r.revision||1,lastCloudSyncedAt:r.updated_at}}
function cloudStatus(t,state='ok'){$('cloudStatus').textContent=t;$('cloudStatus').style.color=state==='bad'?'#dc6b6b':state==='warn'?'#dba449':'#77c584'}
async function pushCloud(v=stored()){
  if(!auth.user||!v)return;cloudStatus('SINCRONIZANDO','warn');
  const expected=+v.cloudRevision||0,body={p_expected_revision:expected,p_vault_ciphertext:v.payload.data,p_vault_iv:v.payload.iv,p_vault_salt:v.salt,p_kdf_iterations:v.iterations||310000,p_vault_version:v.version||2,p_kdf_algorithm:v.kdf_algorithm||'pbkdf2-sha256',p_kdf_memory_kib:v.kdf_memory_kib??null,p_kdf_time_cost:v.kdf_time_cost??null,p_kdf_parallelism:v.kdf_parallelism??null};
  let row=await rpc('sync_user_vault',body);if(Array.isArray(row))row=row[0];if(row){v.cloudRevision=+row.revision||expected+1;v.lastCloudSyncedAt=row.updated_at||new Date().toISOString();store(v)}cloudStatus('SINCRONIZADO')
}
async function rpc(name,body){if(!auth.access)throw Error('Sem sessão');let r=await fetch(SUPABASE_URL+'/rest/v1/rpc/'+name,{method:'POST',headers:ah(auth.access),body:JSON.stringify(body)}),t=await r.text(),d=t?JSON.parse(t):null;if(!r.ok)throw Error(d?.message||d?.code||'Falha de sincronização');return d}
async function handleRevisionConflict(){const cloud=await cloudGet();if(!cloud)return;if(vault.key)lockVault(false);store(fromCloud(cloud));vaultUI();toast('OUTRO DISPOSITIVO ALTEROU O COFRE. VERSÃO MAIS NOVA BAIXADA.')}
async function migrateLegacy(){if(!auth.user||localStorage.getItem(VAULT_PREFIX+auth.user.id))return;let x=localStorage.getItem(LEGACY_KEY);if(x){localStorage.setItem(VAULT_PREFIX+auth.user.id,x);try{await pushCloud(JSON.parse(x));toast('COFRE LOCAL MIGRADO PARA SUA CONTA')}catch{}}}
async function syncOnLogin(force=false){if(!auth.user)return;try{cloudStatus('VERIFICANDO','warn');let c=await cloudGet(),l=stored();if(!c&&l)return await pushCloud(l);if(!c)return cloudStatus('SEM COFRE','warn');if(!l){store(fromCloud(c));vaultUI();return cloudStatus('SINCRONIZADO')}let localRev=+l.cloudRevision||0,cloudRev=+c.revision||0,changed=l.localUpdatedAt&&l.lastCloudSyncedAt&&new Date(l.localUpdatedAt)>new Date(l.lastCloudSyncedAt);if(force&&changed)return pushCloud(l);if(cloudRev>localRev&&!changed){if(vault.key)lockVault(false);store(fromCloud(c));vaultUI();return cloudStatus('ATUALIZADO')}if(changed)return pushCloud(l);cloudStatus('SINCRONIZADO')}catch{cloudStatus('OFFLINE','bad')}}
$('syncBtn').onclick=()=>syncOnLogin(true);

function exportEncryptedBackup(){const v=stored();if(!v)return toast('NENHUM COFRE PARA BACKUP');const doc={format:'lockguard-encrypted-backup',format_version:1,exported_at:new Date().toISOString(),user_hint:auth.user?.email||null,vault:v},blob=new Blob([JSON.stringify(doc,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='lockguard-backup-'+new Date().toISOString().slice(0,10)+'.lockguard';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000);toast('BACKUP CRIPTOGRAFADO GERADO')}
async function importEncryptedBackup(file){try{const doc=JSON.parse(await file.text());if(doc?.format!=='lockguard-encrypted-backup'||!doc.vault?.payload?.data||!doc.vault?.payload?.iv||!doc.vault?.salt)throw Error('Arquivo inválido');if(!confirm('Restaurar este backup substituirá a cópia local e, após sincronizar, a versão na nuvem. Continuar?'))return;const cloud=await cloudGet(),v=doc.vault;v.cloudRevision=cloud?.revision||0;v.lastCloudSyncedAt=cloud?.updated_at||null;v.localUpdatedAt=new Date().toISOString();store(v);if(vault.key)lockVault(false);await pushCloud(v);vaultUI();toast('BACKUP RESTAURADO. DESBLOQUEIE O COFRE.')}catch{toast('BACKUP INVÁLIDO OU NÃO COMPATÍVEL')}}
$('exportBackup').onclick=exportEncryptedBackup;$('importBackup').onclick=()=>$('backupFile').click();$('backupFile').onchange=e=>{const f=e.target.files?.[0];if(f)importEncryptedBackup(f);e.target.value=''};

function previewFor(x){
  let t=itemType(x);
  if(t==='login')return [x.user||'sem usuário',x.url||''].filter(Boolean).join(' • ');
  if(t==='note')return (x.notes||'Nota segura').slice(0,90);
  if(t==='card'){let n=(x.cardNumber||'').replace(/\s/g,'');return [x.cardIssuer||'',n?'•••• '+n.slice(-4):''].filter(Boolean).join(' • ')}
  if(t==='address')return [x.addressCity,x.addressState,x.addressCountry].filter(Boolean).join(' • ');
  if(t==='document'){let n=x.documentNumber||'';return [x.documentType||'Documento',n?('•••• '+n.slice(-4)):''].filter(Boolean).join(' • ')}
  return ''
}
function secretFor(x){let t=itemType(x);if(t==='login')return x.password||'';if(t==='card')return x.cardNumber||'';if(t==='document')return x.documentNumber||'';if(t==='note')return x.notes||'';if(t==='address')return [x.addressName,x.addressStreet,x.addressCity,x.addressState,x.addressZip,x.addressCountry,x.addressPhone].filter(Boolean).join(', ');return''}
function renderVault(){
  let q=norm($('vaultSearch').value),filter=$('vaultTypeFilter').value,list=vault.items.filter(x=>(!filter||itemType(x)===filter)&&norm(Object.values(x).filter(v=>typeof v==='string').join(' ')).includes(q));
  $('vaultCount').textContent=vault.items.length;
  $('vaultList').innerHTML=list.length?list.sort((a,b)=>(b.updatedAt||'').localeCompare(a.updatedAt||'')).map(x=>{
    let sec=secretFor(x),masked=sec?'•'.repeat(Math.min(Math.max(sec.length,8),16)):'SEM SEGREDO';
    return `<div class="vault-item"><div><h4><span class="type-chip">${itemTypeName(itemType(x))}</span>${esc(x.name||'Sem nome')}</h4><small>${esc(previewFor(x))}</small><div class="secret" id="sec-${x.id}" data-hidden="1">${masked}</div></div><div class="item-actions"><button class="mini-btn" data-a="show" data-id="${x.id}">VER</button><button class="mini-btn" data-a="copy" data-id="${x.id}">COPIAR</button><button class="mini-btn" data-a="edit" data-id="${x.id}">EDITAR</button><button class="mini-btn" data-a="del" data-id="${x.id}">EXCLUIR</button></div></div>`
  }).join(''):'<div class="center-card muted">Nenhum item encontrado.</div>'
}
function clearItemFields(){['itemName','itemUser','itemPassword','itemUrl','itemNotes','cardHolder','cardNumber','cardExpiry','cardCvv','cardIssuer','addressName','addressStreet','addressCity','addressState','addressZip','addressPhone','documentType','documentNumber','documentIssue','documentExpiry','documentIssuer'].forEach(id=>{if($(id))$(id).value=''});$('addressCountry').value='Brasil'}
function updateTypeFields(){let t=$('itemType').value;document.querySelectorAll('.type-fields').forEach(el=>{let types=(el.dataset.types||'').split(',');el.classList.toggle('hidden',!types.includes(t))})}
$('itemType').onchange=updateTypeFields;
function itemOpen(x=null){
  clearItemFields();vault.editing=x?.id||null;let t=x?.type||'login';$('itemType').value=t;$('itemTitle').textContent=x?'Editar '+itemTypeName(t):'Novo item';
  $('itemName').value=x?.name||($('passwordFor').value&&t==='login'?$('passwordFor').value:'')||'';
  $('itemUser').value=x?.user||'';$('itemPassword').value=x?.password||'';$('itemUrl').value=x?.url||'';$('itemNotes').value=x?.notes||'';
  $('cardHolder').value=x?.cardHolder||'';$('cardNumber').value=x?.cardNumber||'';$('cardExpiry').value=x?.cardExpiry||'';$('cardCvv').value=x?.cardCvv||'';$('cardIssuer').value=x?.cardIssuer||'';
  $('addressName').value=x?.addressName||'';$('addressStreet').value=x?.addressStreet||'';$('addressCity').value=x?.addressCity||'';$('addressState').value=x?.addressState||'';$('addressZip').value=x?.addressZip||'';$('addressCountry').value=x?.addressCountry||'Brasil';$('addressPhone').value=x?.addressPhone||'';
  $('documentType').value=x?.documentType||'';$('documentNumber').value=x?.documentNumber||'';$('documentIssue').value=x?.documentIssue||'';$('documentExpiry').value=x?.documentExpiry||'';$('documentIssuer').value=x?.documentIssuer||'';
  if(!x&&t==='login')$('itemPassword').value=$('generated').value||'';
  updateTypeFields();$('itemModal').classList.remove('hidden')
}
async function itemSave(){
  let name=$('itemName').value.trim(),type=$('itemType').value;if(!name)return toast('INFORME UM NOME / TÍTULO');
  let now=new Date().toISOString(),obj={type,name,notes:$('itemNotes').value.trim(),updatedAt:now};
  if(type==='login'){
    let password=$('itemPassword').value;if(!password)return toast('INFORME A SENHA');
    Object.assign(obj,{user:$('itemUser').value.trim(),password,url:$('itemUrl').value.trim()})
  }else if(type==='card'){if(!$('cardNumber').value.trim())return toast('INFORME O NÚMERO DO CARTÃO');Object.assign(obj,{cardHolder:$('cardHolder').value.trim(),cardNumber:$('cardNumber').value.trim(),cardExpiry:$('cardExpiry').value.trim(),cardCvv:$('cardCvv').value.trim(),cardIssuer:$('cardIssuer').value.trim()})}
  else if(type==='address')Object.assign(obj,{addressName:$('addressName').value.trim(),addressStreet:$('addressStreet').value.trim(),addressCity:$('addressCity').value.trim(),addressState:$('addressState').value.trim(),addressZip:$('addressZip').value.trim(),addressCountry:$('addressCountry').value.trim(),addressPhone:$('addressPhone').value.trim()});
  else if(type==='document'){if(!$('documentNumber').value.trim())return toast('INFORME O NÚMERO DO DOCUMENTO');Object.assign(obj,{documentType:$('documentType').value.trim(),documentNumber:$('documentNumber').value.trim(),documentIssue:$('documentIssue').value,documentExpiry:$('documentExpiry').value,documentIssuer:$('documentIssuer').value.trim()})}
  if(vault.editing){
    let i=vault.items.findIndex(x=>x.id===vault.editing),old=vault.items[i]||{};
    if(type==='login')obj.passwordChangedAt=(old.password===obj.password?old.passwordChangedAt:now)||now;
    obj.security=old.security||{};if(type==='login'&&old.password!==obj.password)obj.security={};
    vault.items[i]={id:old.id,createdAt:old.createdAt||now,...obj}
  }else{if(type==='login')obj.passwordChangedAt=now;vault.items.push({id:crypto.randomUUID?.()||Date.now()+''+Math.random(),createdAt:now,security:{},...obj})}
  await persist();$('itemModal').classList.add('hidden');vault.editing=null;renderVault();toast('SALVO E SINCRONIZADO');
  if(type==='login')setTimeout(()=>scanLeaks(true),300)
}
$('newItem').onclick=()=>itemOpen();$('saveGenBtn').onclick=()=>{if(!vault.key){switchView('vault');toast('DESBLOQUEIE O COFRE');return}itemOpen({type:'login',name:$('passwordFor').value,password:$('generated').value,user:'',url:'',notes:''});vault.editing=null};$('cancelItem').onclick=()=>$('itemModal').classList.add('hidden');$('saveItem').onclick=itemSave;$('vaultSearch').oninput=renderVault;$('vaultTypeFilter').onchange=renderVault;
$('vaultList').onclick=async e=>{let b=e.target.closest('[data-a]');if(!b)return;let x=vault.items.find(v=>v.id===b.dataset.id);if(!x)return;let sec=secretFor(x);
  if(b.dataset.a==='show'){let s=$('sec-'+x.id),h=s.dataset.hidden==='1';s.textContent=h?sec:('•'.repeat(Math.min(Math.max(sec.length,8),16))||'SEM SEGREDO');s.dataset.hidden=h?'0':'1';b.textContent=h?'OCULTAR':'VER'}
  if(b.dataset.a==='copy'){if(!sec)return toast('NADA PARA COPIAR');try{await navigator.clipboard.writeText(sec);clearTimeout(clipTimer);clipTimer=setTimeout(async()=>{try{if(await navigator.clipboard.readText()===sec)await navigator.clipboard.writeText('')}catch{}},30000);toast('COPIADO • LIMPEZA EM 30s')}catch{toast('FALHA AO COPIAR')}}
  if(b.dataset.a==='edit')itemOpen(x);if(b.dataset.a==='del'&&confirm('Excluir '+x.name+'?')){vault.items=vault.items.filter(v=>v.id!==x.id);await persist();renderVault()}
};

async function scanLeaks(force=false){
  if(!vault.key)return;
  let logins=vault.items.filter(x=>itemType(x)==='login'&&x.password);
  if(!logins.length){vault.security.lastLeakScan=new Date().toISOString();renderDashboard();return}
  let last=vault.security?.lastLeakScan;if(!force&&last&&Date.now()-new Date(last).getTime()<LEAK_SCAN_INTERVAL){renderDashboard();return}
  $('breachStatus').textContent='◈ Verificando '+logins.length+' login(s)...';$('breachStatus').classList.add('scan-progress');$('scanLeaksBtn').disabled=true;
  try{
    let parts=await Promise.all(logins.map(async x=>({item:x,...await sha1Parts(x.password)}))),groups=new Map();
    for(const p of parts){if(!groups.has(p.prefix))groups.set(p.prefix,[]);groups.get(p.prefix).push(p)}
    let results=new Map();
    for(const [prefix,entries] of groups){
      let res=await fetch('https://api.pwnedpasswords.com/range/'+prefix,{headers:{'Add-Padding':'true'}});if(!res.ok)throw Error('HIBP');
      let txt=await res.text(),map=new Map();for(const line of txt.split(/\r?\n/)){let [h,c]=line.trim().split(':');if(h)map.set(h,Number(c)||0)}
      for(const e of entries)results.set(e.item.id,map.get(e.suffix)||0)
    }
    let now=new Date().toISOString();for(const x of logins)x.security={...(x.security||{}),exposedCount:results.get(x.id)||0,lastLeakScan:now};vault.security.lastLeakScan=now;
    await persist();$('breachStatus').textContent='◈ Monitoramento atualizado';toast('VERIFICAÇÃO DE VAZAMENTOS CONCLUÍDA')
  }catch{$('breachStatus').textContent='◈ Serviço de vazamentos indisponível';toast('NÃO FOI POSSÍVEL VERIFICAR AGORA')}
  finally{$('breachStatus').classList.remove('scan-progress');$('scanLeaksBtn').disabled=false;renderDashboard()}
}
function scheduleLeakMonitoring(){clearTimeout(leakTimer);if(!vault.key)return;let last=vault.security?.lastLeakScan,due=!last?1000:Math.max(1000,LEAK_SCAN_INTERVAL-(Date.now()-new Date(last).getTime()));leakTimer=setTimeout(async()=>{if(vault.key){await scanLeaks(true);scheduleLeakMonitoring()}},due);setTimeout(()=>scanLeaks(false),800)}
$('scanLeaksBtn').onclick=()=>scanLeaks(true);$('dashOpenVault').onclick=()=>switchView('vault');

function dashboardData(){
  let logins=vault.items.filter(x=>itemType(x)==='login'&&x.password),weak=[],strong=[],exposed=[],old=[],reuseIds=new Set(),groups=new Map();
  for(const x of logins){let a=analyze(x.password,x.name);(a.score<65?weak:strong).push(x);if((x.security?.exposedCount||0)>0)exposed.push(x);if(daysSince(x.passwordChangedAt||x.createdAt)>STALE_DAYS)old.push(x);let k=x.password;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(x)}
  for(const arr of groups.values())if(arr.length>1)arr.forEach(x=>reuseIds.add(x.id));
  let total=Math.max(logins.length,1),score=100;
  score-=Math.min(45,exposed.length*22);
  score-=Math.round((weak.length/total)*25);
  score-=Math.round((reuseIds.size/total)*20);
  score-=Math.round((old.length/total)*10);
  score=Math.max(0,Math.min(100,score));
  return{logins,weak,strong,exposed,old,reused:[...reuseIds],score}
}
function renderDashboard(){
  let open=!!vault.key;$('dashboardLocked').classList.toggle('hidden',open);$('dashboardOpen').classList.toggle('hidden',!open);$('dashGrade').textContent=open?'ANÁLISE LOCAL':'BLOQUEADO';
  if(!open)return;
  let d=dashboardData();$('securityScore').textContent=d.score;$('metricStrong').textContent=d.strong.length;$('metricWeak').textContent=d.weak.length;$('metricReused').textContent=d.reused.length;$('metricExposed').textContent=d.exposed.length;$('metricOld').textContent=d.old.length;$('metricTotal').textContent=d.logins.length;
  $('dashGrade').textContent=d.score>=85?'EXCELENTE':d.score>=70?'BOM':d.score>=50?'ATENÇÃO':'RISCO';
  let rec=[];if(d.exposed.length)rec.push(['danger',d.exposed.length+' login(s) usam senha encontrada em vazamentos. Troque imediatamente.']);if(d.weak.length)rec.push(['danger',d.weak.length+' senha(s) estão abaixo de 65/100.']);if(d.reused.length)rec.push(['',d.reused.length+' login(s) reutilizam senha. Use uma senha exclusiva por serviço.']);if(d.old.length)rec.push(['',d.old.length+' senha(s) têm mais de 1 ano. Considere rotacioná-las.']);if(!rec.length)rec.push(['ok','Nenhum problema relevante detectado nas credenciais analisadas.']);
  $('securityRecommendations').innerHTML=rec.map(([c,t])=>`<div class="security-item ${c}">${esc(t)}</div>`).join('');
  let last=vault.security?.lastLeakScan;$('lastLeakScan').textContent='Última verificação: '+(last?new Date(last).toLocaleString('pt-BR'):'nunca');
  $('breachStatus').textContent=d.exposed.length?'◈ '+d.exposed.length+' credencial(is) exposta(s) detectada(s)':'◈ Nenhuma senha exposta detectada na última análise';
  $('extensionStatus').textContent=extensionReady?'◈ Extensão do navegador: conectada':'◈ Extensão do navegador: não detectada';$('extensionStatus').classList.toggle('extension-connected',extensionReady)
}

function broadcastExtension(){
  if(!vault.key)return;
  const items=vault.items.filter(x=>itemType(x)==='login'&&x.password).map(x=>({id:x.id,name:x.name,user:x.user||'',password:x.password,url:x.url||''}));
  window.postMessage({source:'lockguard-web',type:'LOCKGUARD_VAULT_SYNC',items,version:APP_VERSION},location.origin)
}
window.addEventListener('message',e=>{if(e.origin!==location.origin||e.data?.source!=='lockguard-extension')return;if(e.data.type==='LOCKGUARD_EXTENSION_READY'){extensionReady=true;renderDashboard();if(vault.key)broadcastExtension()}});
setInterval(()=>{if(vault.key)window.postMessage({source:'lockguard-web',type:'LOCKGUARD_EXTENSION_PING'},location.origin)},15000);

generate();renderStrength('test',analyze(''));vaultUI();restoreSession();
const versionEl=$('versionLabel');if(versionEl)versionEl.textContent='Versão '+APP_VERSION;
