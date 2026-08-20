# Arquitetura do LockGuard

O LockGuard é mantido como monorepo com quatro clientes e um backend compartilhado.

## Visão geral

```text
                     ┌─────────────────────────────┐
                     │       Supabase Backend      │
                     │ Auth + PostgreSQL + RLS     │
                     │ recebe cofre já cifrado     │
                     └──────────────┬──────────────┘
                                    │ HTTPS
             ┌──────────────────────┼──────────────────────┐
             │                      │                      │
      ┌──────▼──────┐       ┌──────▼──────┐       ┌──────▼──────┐
      │ Web 0.7.3   │       │ Windows     │       │ Android     │
      │ Vercel      │       │ 0.0.1       │       │ 0.0.2       │
      │ JS/WebCrypto│       │ Tauri 2     │       │ Native Gate │
      └──────┬──────┘       │ + WebView2  │       │ + WebView   │
             │              └─────────────┘       └─────────────┘
             │
      ┌──────▼─────────────┐
      │ Extension 0.0.1    │
      │ Manifest V3        │
      │ chrome.storage     │
      │ session + autofill │
      └────────────────────┘
```

## Web 0.7.3

É a implementação funcional de referência. O código está em `apps/web` e é publicado no Vercel.

Responsabilidades principais:

- autenticação de conta;
- derivação da chave do cofre;
- criptografia/descriptografia client-side;
- CRUD dos itens do cofre;
- backup/restauração;
- monitoramento de vazamentos;
- Security Dashboard;
- comunicação com a extensão.

## Extensão 0.0.1

A extensão Manifest V3 fica em `apps/browser-extension`.

Ela não recebe a senha mestra. Quando o cofre Web está desbloqueado, o Web transmite somente as credenciais necessárias para autofill. A extensão mantém esse material em `chrome.storage.session`, evitando persistência permanente em armazenamento local da extensão.

## Windows 0.0.1

O cliente Windows fica em `apps/windows` e usa Tauri 2.

Durante o build, `scripts/prepare-windows.mjs` copia o frontend Web para o bundle Windows. Isso reduz divergência funcional entre Web e desktop. O executável final usa WebView2 e é compilado em runner Windows do GitHub Actions.

Entregáveis:

- `LockGuard-Portable.exe`;
- `LockGuard-Setup.exe` (NSIS).

## Android 0.0.2

O Android usa uma arquitetura híbrida intencional:

1. uma camada Android nativa controla abertura, identidade visual e biometria;
2. o engine Web responsivo fornece as funcionalidades do gerenciador;
3. Safe Browsing é habilitado quando suportado;
4. debugging de WebView é desabilitado;
5. cookies de terceiros são desabilitados.

Essa abordagem mantém paridade com o Web e evita duplicar regras sensíveis de criptografia/cofre em uma segunda implementação que poderia divergir.

## Backend

O backend usa Supabase Auth + PostgreSQL.

- autenticação é feita pelo Supabase Auth;
- o cofre é cifrado no cliente;
- o Postgres armazena o material cifrado e metadados de sincronização;
- políticas RLS restringem cada linha ao usuário autenticado correspondente.

## Criptografia

- KDF principal: Argon2id;
- cifra do cofre: AES-GCM 256;
- geração de senhas: Web Crypto RNG/SecureRandom conforme plataforma;
- verificação de vazamentos: Pwned Passwords com k-anonimato.

## CI/CD

GitHub Actions executa:

- `Verify` — checks estáticos;
- `Build Windows` — Tauri + NSIS;
- `Build Android` — Gradle debug/release;
- `Sync LockGuard Web Source` — sincronização controlada do Web de produção com `apps/web`.

Os pipelines Windows e Android registram o estado mais recente em `ci-status/` para facilitar auditoria dos builds.