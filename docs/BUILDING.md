# Build e execução

## Web 0.7.3

Requisitos: Node.js 22+.

```bash
cd apps/web
npm install
npm run build
```

Os arquivos estáticos de produção são gerados em `apps/web/dist`.

## Extensão 0.0.1

A extensão não exige compilação.

1. Abra a página de extensões do Opera/Chrome/Edge.
2. Ative o modo desenvolvedor.
3. Escolha **Carregar sem compactação**.
4. Selecione `apps/browser-extension`.

## Windows 0.0.1

Requisitos locais:

- Windows 11;
- Node.js 22+;
- Rust stable;
- dependências do Tauri/WebView2 e Microsoft C++ Build Tools.

```powershell
npm install
cd apps/windows
npm install
cd ../..
npm run tauri:build
```

No GitHub, o workflow **Build Windows** produz automaticamente:

- `LockGuard-Portable.exe`;
- `LockGuard-Setup.exe`.

## Android 0.0.2

Requisitos locais:

- JDK 17;
- Android SDK 35;
- Gradle 8.10.2 ou wrapper compatível.

```bash
cd apps/android
gradle assembleDebug assembleRelease
```

No GitHub, o workflow **Build Android** produz:

- `LockGuard-v0.0.2-debug.apk`;
- `LockGuard-v0.0.2-unsigned.apk`.

Para testes diretos em aparelho, use o `debug.apk`. O release unsigned precisa ser assinado antes de distribuição pública.

## CI

Os status mais recentes ficam em:

- `ci-status/android-latest.txt`;
- `ci-status/windows-latest.txt`.

Nunca publique um artefato como estável quando o status correspondente não estiver `success`.