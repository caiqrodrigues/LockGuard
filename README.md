# LockGuard

Gerenciador de senhas Black/Gold multiplataforma com Web, extensão de navegador, Windows e Android.

## Versão atual
**0.7.03**

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

## Status
Web e extensão já foram validados em uso. Windows e Android possuem pipelines de compilação separados e só devem ser tratados como release estável após os respectivos builds e testes passarem.
