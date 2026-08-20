# Política de releases

## Versões atuais

- Web **0.7.3**
- Extensão **0.0.1**
- Windows **0.0.1**
- Android **0.0.2**

## Artefatos

### Web
`LockGuard-Web-v0.7.3.zip`

### Extensão
`LockGuard-Extension-v0.0.1.zip`

### Windows
- `LockGuard-Portable.exe`
- `LockGuard-Setup.exe`

### Android
- `LockGuard-v0.0.2-debug.apk` para testes diretos.
- `LockGuard-v0.0.2-unsigned.apk` como saída release ainda sem assinatura de distribuição.

## Critério

Um artefato só deve ser chamado de build válido quando o workflow correspondente terminou com `success`. Publicação em Release estável exige também teste manual da plataforma quando aplicável.

Android e Windows não devem ser apresentados como assinados comercialmente enquanto as chaves/certificados de distribuição não forem configurados.