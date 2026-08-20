# LockGuard Android

Aplicativo Android oficial do LockGuard.

## Linha de versões Android

### 0.0.1
Primeiro APK funcional validado em aparelho real. Incluiu gerador, teste de força, cofre sincronizado e Security Dashboard em interface inicial simples.

### 0.0.2
Redesign da experiência Android:
- tela inicial de autenticação obrigatória;
- identidade visual Black/Gold mais próxima do LockGuard Web;
- novo ícone de aplicativo com cadeado;
- cards, botões e campos arredondados;
- hierarquia visual e espaçamentos revistos para telas pequenas;
- mesma conta e mesmo cofre criptografado do Web;
- cofre continua exigindo senha mestra para descriptografia;
- versão Android exibida separadamente da linha Web/Windows.

## Compatibilidade
- Android 8.0+ (API 26+).
- Layout sem largura fixa, adaptável a celulares compactos, grandes e tablets.
- Sem Jetpack Compose para reduzir dependências e custo de inicialização em aparelhos modestos.
- APK universal para testes diretos.

## Segurança
- AES-GCM 256 para o cofre.
- Argon2id para cofres atuais, com compatibilidade PBKDF2 para migração.
- Nenhuma service-role key ou segredo administrativo no APK.
- Cofre bloqueado quando o app deixa o primeiro plano.
- Login da conta e senha mestra permanecem etapas distintas.

## Build
O workflow `Build Android` gera:
- `LockGuard-v0.0.2-debug.apk` — instalável para testes.
- `LockGuard-v0.0.2-unsigned.apk` — release sem assinatura, destinada ao processo posterior de assinatura/distribuição.
