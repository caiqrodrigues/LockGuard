# LockGuard Android

Aplicativo Android oficial do LockGuard.

## Versão atual

**0.0.4**

## Linha de versões

### 0.0.4
- Web Engine 0.7.4.
- Área Conta com nome do perfil, telefone, alteração de e-mail, alteração da senha da conta e logout.
- Senha mestra permanece fora deste fluxo e não é alterada.
- Biometria opcional mantida para proteger a reentrada no aplicativo.
- Safe area para barras do sistema mantida.
- Assinatura de testes estável para atualização por cima da versão anterior.

### 0.0.3
- Biometria exigida novamente ao abrir/retomar quando habilitada.
- Correção do enquadramento sob barra de status e navegação.

### 0.0.2
- Engine Web responsivo dentro da camada Android controlada pelo LockGuard.
- Novo ícone com cadeado e identidade Black/Gold.
- Suporte ao mesmo cofre cifrado e sincronizado.
- Entrada por impressão digital/biometria opcional.

### 0.0.1
Primeiro APK funcional validado em aparelho real.

## Funções herdadas do Web

O Android 0.0.4 utiliza o Web 0.7.4 como engine funcional e recebe gerador, teste de força, login/conta, cofre, logins, notas, cartões, endereços, documentos, backup/restauração, sincronização E2EE, Security Dashboard, monitoramento de vazamentos, Argon2id e AES-GCM 256.

## Biometria

A biometria é opcional. Quando habilitada, protege a abertura/retorno ao aplicativo. A senha mestra não é armazenada em texto aberto. Caso a sessão da conta expire, o login convencional continua sendo solicitado.

## Compatibilidade

- Android 8.0+ / API 26+.
- Android 9+ usa `BiometricPrompt` do sistema.
- Android 8 usa `FingerprintManager` quando disponível.
- Fallback para login/senha quando biometria não estiver disponível.
- Layout adaptável a celulares compactos, telas grandes e tablets.

## Build e assinatura para testes

O workflow `Build Android` gera:

- `LockGuard-v0.0.4-debug.apk` — instalável diretamente para testes e atualização.
- `LockGuard-v0.0.4-unsigned.apk` — release sem assinatura de distribuição.

O CI preserva a identidade de assinatura de testes no GitHub Actions e valida o APK com `apksigner` e `aapt` antes de publicar o artefato.
