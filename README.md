# LockGuard

Gerenciador de senhas Black/Gold multiplataforma com Web, extensão de navegador, Windows e Android.

## Versões atuais
- Web / Extensão / Windows: **0.7.03**
- Android: **0.0.2**

## Plataformas
- `apps/web` — site publicado no Vercel.
- `apps/browser-extension` — extensão Manifest V3 para Opera/Chrome/Edge.
- `apps/windows` — aplicativo Tauri para Windows.
- `apps/android` — aplicativo Android nativo leve, com suporte a Android 8.0+.

## Builds automatizados
- `.github/workflows/build-windows.yml` — gera `LockGuard-Portable.exe` e `LockGuard-Setup.exe`.
- `.github/workflows/build-android.yml` — gera APKs Android de teste/release.
- `.github/workflows/verify.yml` — verificações de integridade do projeto.

## Segurança
O projeto utiliza criptografia client-side, AES-GCM 256, Argon2id para derivação da chave do cofre, Supabase Auth/Postgres com RLS, sincronização de cofre cifrado e verificação de senhas comprometidas por k-anonimato.

## Produção Web
https://lockguardapp.vercel.app

## Android
A linha Android possui versionamento próprio. A versão `0.0.1` foi o primeiro APK funcional validado em aparelho real. A `0.0.2` introduz login obrigatório na abertura, novo ícone com cadeado e redesign Black/Gold mais próximo do produto Web.

## Status
Web e extensão já foram validados em uso. Windows já possui build automatizado funcional. Android é validado por build no GitHub Actions e teste em aparelho real antes de ser tratado como release estável.
