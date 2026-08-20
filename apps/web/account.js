(() => {
  const WEB_VERSION = '0.7.4';
  const $id = id => document.getElementById(id);
  const wait = fn => setTimeout(fn, 0);

  function styleOnce() {
    if ($id('accountManagerStyle')) return;
    const s = document.createElement('style');
    s.id = 'accountManagerStyle';
    s.textContent = `
      .account-manager-modal .modal{max-width:760px;width:min(760px,calc(100vw - 24px));max-height:88vh;overflow:auto}
      .account-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
      .account-card{border:1px solid #322b19;background:#0b0b0b;padding:18px;margin-top:14px}
      .account-card h3{margin:0 0 6px;font-size:18px}.account-card p{margin:0 0 14px}
      .account-line{display:flex;justify-content:space-between;gap:14px;align-items:center;border-bottom:1px solid #222;padding:9px 0;color:#aaa}
      .account-line strong{color:#eee;font-weight:500;text-align:right;overflow-wrap:anywhere}
      .account-status{margin-top:12px;padding:11px 12px;border-left:2px solid #d4af37;background:#10100d;color:#d7d1bf;font-size:13px}
      .account-status.ok{border-color:#77c584}.account-status.bad{border-color:#dc6b6b}
      .danger-button{border-color:#6a2727!important;color:#e58c8c!important}
      @media(max-width:700px){.account-grid{grid-template-columns:1fr}.account-manager-modal .modal{width:calc(100vw - 16px);padding:18px}.account-card{padding:14px}}
    `;
    document.head.appendChild(s);
  }

  function ensureModal() {
    if ($id('accountManagerModal')) return;
    const wrap = document.createElement('div');
    wrap.id = 'accountManagerModal';
    wrap.className = 'modal-bg hidden account-manager-modal';
    wrap.innerHTML = `<div class="modal">
      <p>LOCKGUARD ACCOUNT</p><h2>Minha conta</h2>
      <div class="account-line"><span>Conta conectada</span><strong id="accountCurrentEmail">—</strong></div>
      <div class="account-grid">
        <section class="account-card">
          <h3>Perfil</h3><p class="muted">Esses dados ficam sincronizados com sua conta LockGuard.</p>
          <label>NOME DO PERFIL</label><input id="accountName" class="input" maxlength="80" autocomplete="name">
          <label>TELEFONE</label><input id="accountPhone" class="input" maxlength="30" autocomplete="tel" inputmode="tel" placeholder="Ex.: +55 11 99999-9999">
          <button id="accountSaveProfile" class="btn primary wide">SALVAR PERFIL</button>
        </section>
        <section class="account-card">
          <h3>E-mail de login</h3><p class="muted">Ao trocar o e-mail, o LockGuard poderá pedir confirmação no endereço novo.</p>
          <label>NOVO E-MAIL</label><input id="accountNewEmail" class="input" type="email" autocomplete="email">
          <button id="accountSaveEmail" class="btn primary wide">ALTERAR E-MAIL</button>
        </section>
      </div>
      <section class="account-card">
        <h3>Senha da conta</h3><p class="muted">A senha da conta é diferente da senha mestra. A senha mestra não é alterada nesta versão.</p>
        <div class="account-grid">
          <div><label>SENHA ATUAL</label><input id="accountCurrentPassword" class="input" type="password" autocomplete="current-password"></div>
          <div><label>NOVA SENHA</label><input id="accountNewPassword" class="input" type="password" autocomplete="new-password"></div>
        </div>
        <label>CONFIRMAR NOVA SENHA</label><input id="accountConfirmPassword" class="input" type="password" autocomplete="new-password">
        <button id="accountSavePassword" class="btn primary">ALTERAR SENHA</button>
      </section>
      <div id="accountManagerStatus" class="account-status hidden"></div>
      <div class="actions"><button id="accountLogout" class="btn secondary danger-button">SAIR DA CONTA</button><button id="accountClose" class="btn secondary">FECHAR</button></div>
      <p class="muted tiny">Web ${WEB_VERSION} • alterações de perfil são vinculadas à identidade da conta. A senha mestra continua independente.</p>
    </div>`;
    document.body.appendChild(wrap);

    $id('accountClose').onclick = closeAccount;
    $id('accountSaveProfile').onclick = saveProfile;
    $id('accountSaveEmail').onclick = saveEmail;
    $id('accountSavePassword').onclick = savePassword;
    $id('accountLogout').onclick = async () => {
      if (!confirm('Sair da conta LockGuard neste dispositivo?')) return;
      await logout();
      closeAccount();
    };
    wrap.addEventListener('click', e => { if (e.target === wrap) closeAccount(); });
  }

  function setStatus(text, state='') {
    const e = $id('accountManagerStatus');
    e.textContent = text;
    e.className = 'account-status ' + state;
  }
  function clearStatus() {
    const e = $id('accountManagerStatus');
    e.textContent = '';
    e.className = 'account-status hidden';
  }

  function currentMeta() { return auth?.user?.user_metadata || {}; }
  function refreshFields() {
    const u = auth?.user;
    if (!u) return;
    const m = currentMeta();
    $id('accountCurrentEmail').textContent = u.email || '—';
    $id('accountName').value = m.display_name || m.full_name || m.name || '';
    $id('accountPhone').value = m.phone || '';
    $id('accountNewEmail').value = u.email || '';
    $id('accountCurrentPassword').value = '';
    $id('accountNewPassword').value = '';
    $id('accountConfirmPassword').value = '';
    clearStatus();
  }

  function openAccount() {
    if (!auth?.user) return authOpen('login');
    ensureModal();
    refreshFields();
    $id('accountManagerModal').classList.remove('hidden');
  }
  function closeAccount() { $id('accountManagerModal')?.classList.add('hidden'); }

  async function userUpdate(body) {
    if (!auth?.access) throw Error('Sua sessão expirou. Entre novamente.');
    const r = await fetch(SUPABASE_URL + '/auth/v1/user', {
      method: 'PUT', headers: ah(auth.access), body: JSON.stringify(body)
    });
    let d = {}; try { d = await r.json(); } catch {}
    if (!r.ok) throw Error(d.msg || d.message || d.error_description || d.error || 'Não foi possível atualizar a conta.');
    if (d?.id) auth.user = d;
    else if (d?.user?.id) auth.user = d.user;
    accountUI();
    return d;
  }

  async function saveProfile() {
    const btn = $id('accountSaveProfile');
    const name = $id('accountName').value.trim();
    const phone = $id('accountPhone').value.trim();
    if (name.length > 80 || phone.length > 30) return setStatus('Revise os dados informados.', 'bad');
    try {
      btn.disabled = true; setStatus('Salvando perfil...');
      const old = currentMeta();
      await userUpdate({data:{...old, display_name:name, full_name:name, phone}});
      refreshFields(); setStatus('Perfil atualizado e sincronizado.', 'ok'); toast('PERFIL ATUALIZADO');
    } catch(e) { setStatus(e.message, 'bad'); }
    finally { btn.disabled = false; }
  }

  async function saveEmail() {
    const btn = $id('accountSaveEmail');
    const email = $id('accountNewEmail').value.trim().toLowerCase();
    if (!email.includes('@')) return setStatus('Informe um e-mail válido.', 'bad');
    if (email === (auth.user?.email || '').toLowerCase()) return setStatus('Esse já é o e-mail atual.', 'bad');
    try {
      btn.disabled = true; setStatus('Solicitando alteração de e-mail...');
      await userUpdate({email});
      refreshFields();
      setStatus('Alteração solicitada. Se a confirmação de e-mail estiver ativa, confirme pelo link enviado antes da troca ser concluída.', 'ok');
      toast('ALTERAÇÃO DE E-MAIL SOLICITADA');
    } catch(e) { setStatus(e.message, 'bad'); }
    finally { btn.disabled = false; }
  }

  async function reauthenticate(password) {
    const email = auth.user?.email;
    if (!email) throw Error('Sessão sem e-mail de login.');
    return af('/auth/v1/token?grant_type=password', {method:'POST', headers:ah(), body:JSON.stringify({email,password})});
  }

  async function savePassword() {
    const btn = $id('accountSavePassword');
    const current = $id('accountCurrentPassword').value;
    const next = $id('accountNewPassword').value;
    const confirmNext = $id('accountConfirmPassword').value;
    if (!current) return setStatus('Digite sua senha atual.', 'bad');
    if (next.length < 10) return setStatus('A nova senha deve ter pelo menos 10 caracteres.', 'bad');
    if (next !== confirmNext) return setStatus('A confirmação da nova senha não confere.', 'bad');
    if (current === next) return setStatus('Escolha uma senha diferente da atual.', 'bad');
    try {
      btn.disabled = true; setStatus('Validando senha atual...');
      await reauthenticate(current);
      setStatus('Verificando a nova senha em vazamentos conhecidos...');
      let exposed = 0;
      try { exposed = await passwordExposureCount(next); }
      catch { throw Error('Não foi possível verificar vazamentos agora. Tente novamente.'); }
      if (exposed > 0) throw Error('A nova senha já apareceu em vazamentos conhecidos. Escolha outra.');
      await userUpdate({password:next});
      $id('accountCurrentPassword').value=''; $id('accountNewPassword').value=''; $id('accountConfirmPassword').value='';
      setStatus('Senha da conta alterada com sucesso. Sua senha mestra não foi modificada.', 'ok');
      toast('SENHA DA CONTA ALTERADA');
    } catch(e) { setStatus(e.message, 'bad'); }
    finally { btn.disabled = false; }
  }

  function install() {
    styleOnce(); ensureModal();
    const btn = $id('accountBtn');
    if (btn) {
      btn.onclick = () => auth?.user ? openAccount() : authOpen('login');
      const keepLabel = () => { if (auth?.user && btn.textContent.trim() !== 'CONTA') btn.textContent = 'CONTA'; };
      new MutationObserver(keepLabel).observe(btn,{childList:true,characterData:true,subtree:true});
      keepLabel();
    }
    const version = $id('versionLabel'); if (version) version.textContent = 'Versão ' + WEB_VERSION;
    window.LockGuardAccount = {open:openAccount, version:WEB_VERSION};
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install);
  else wait(install);
})();
