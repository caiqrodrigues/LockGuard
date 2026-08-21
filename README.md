# 🔒 LockGuard

Gerenciador de senhas multiplataforma com identidade Black/Gold, cofre criptografado, sincronização E2EE, monitoramento de vazamentos, Security Dashboard, extensão de navegador e aplicativos para Windows e Android.

## Versões oficiais

| Plataforma | Versão | Status |
|---|---:|---|
| Web | **0.7.4** | ✅ Produção / Vercel |
| Extensão | **0.0.2** | ✅ Manifest V3 |
| Windows | **0.0.2** | ✅ Tauri / Portable + Setup |
| Android | **0.0.4** | ✅ APK / biometria / conta |

> Cada plataforma possui sua própria linha de versão. Uma alteração em uma plataforma não obriga incremento nas demais.

## O que o projeto entrega

- Gerador criptograficamente seguro de senhas.
- Medidor e análise de força de senha.
- Cofre criptografado com logins, notas, cartões, endereços e documentos.
- Derivação de chave com Argon2id.
- Criptografia AES-GCM 256 no cliente.
- Sincronização do cofre cifrado com Supabase.
- Row Level Security (RLS) por usuário.
- Monitoramento de senhas expostas usando k-anonimato / Pwned Passwords.
- Security Dashboard com senhas fortes, fracas, reutilizadas, antigas e expostas.
- Extensão Manifest V3 com autofill.
- Aplicativo Windows via Tauri.
- Aplicativo Android otimizado com paridade funcional do Web e entrada biométrica opcional.
- Gestão de conta com perfil, telefone, alteração de e-mail e senha da conta; senha mestra permanece independente.
- CI/CD com GitHub Actions e deploy Web via Vercel conectado ao GitHub.

## Arquitetura

```text
LockGuard
├── apps/web                 Web 0.7.4 / Vercel
├── apps/browser-extension   Extensão 0.0.2 / Manifest V3
├── apps/windows             Windows 0.0.2 / Tauri 2
├── apps/android             Android 0.0.4
├── docs                     Segurança e arquitetura
└── .github/workflows        CI, Windows, Android e sincronização Web
```

O Web é a implementação funcional de referência. O Android usa uma camada nativa de segurança e biometria ao redor do engine Web responsivo para manter paridade de funcionalidades e reduzir divergências entre plataformas. O Windows reutiliza o frontend Web empacotado pelo Tauri.

## Tecnologias

**Frontend:** HTML5, CSS3, JavaScript, Web Crypto API, WebAssembly/Argon2.  
**Backend:** Supabase Auth, PostgreSQL e Row Level Security.  
**Deploy Web:** Vercel.  
**Browser:** Manifest V3 / Chrome APIs.  
**Windows:** Rust, Tauri 2, WebView2 e NSIS.  
**Android:** Java, Android WebView, APIs biométricas nativas e Gradle.  
**CI/CD:** GitHub Actions.

## Segurança

O LockGuard utiliza arquitetura de criptografia client-side: o conteúdo do cofre é cifrado antes da sincronização. O servidor recebe o material cifrado e metadados necessários à sincronização. O projeto não deve ser apresentado como formalmente auditado enquanto não passar por auditoria independente.

Mais detalhes em `docs/SECURITY.md` e `docs/ARCHITECTURE.md`.

## Builds

### Windows

O workflow `Build Windows` gera os artefatos Windows (Portable e Setup).

### Android

O workflow `Build Android` gera o APK de teste instalável e o artefato release correspondente.

## Produção Web

https://lockguardapp.vercel.app

## Histórico Android

- **0.0.1** — primeiro APK funcional validado em aparelho real.
- **0.0.2** — novo ícone, login inicial, redesign, paridade com Web e biometria opcional.
- **0.0.4** — linha Android atual com correções de sessão, conta e navegação.

## Nota de projeto

O LockGuard está em desenvolvimento ativo. Recursos só são marcados como validados depois de build e teste real na plataforma correspondente.
