# Arquitetura

O LockGuard é um monorepo com três clientes.

- Web: HTML/CSS/JavaScript em Vercel.
- Extensão: Manifest V3, sincronizada com o cofre web desbloqueado.
- Windows: Tauri 2/WebView2 reaproveitando o frontend web.
- Backend: Supabase Auth/Postgres; o servidor recebe o cofre já cifrado.
- CI: GitHub Actions valida JavaScript e compila Portable/Setup em runner Windows.
