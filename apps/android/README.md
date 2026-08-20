# LockGuard Android

Aplicativo Android oficial do LockGuard.

## Versão atual

**0.0.2**

## Linha de versões

### 0.0.1
Primeiro APK funcional validado em aparelho real. Incluiu interface Android inicial com gerador e recursos básicos do cofre.

### 0.0.2
A arquitetura passou a priorizar paridade com o produto Web:

- engine Web responsivo carregado dentro de uma camada Android controlada pelo LockGuard;
- acesso às mesmas funções do Web sem duplicar regras de cofre em duas implementações diferentes;
- novo ícone de aplicativo com cadeado;
- identidade Black/Gold;
- login da conta LockGuard quando não existe sessão válida;
- suporte ao mesmo cofre cifrado e sincronizado;
- camada nativa opcional de entrada por impressão digital/biometria;
- Safe Browsing habilitado em Android compatível;
- WebView debugging desabilitado em produção;
- cookies de terceiros desabilitados;
- otimizações de viewport e toque para telas móveis.

## Funções herdadas do Web

A versão Android 0.0.2 utiliza o Web 0.7.3 como engine funcional, portanto recebe:

- gerador de senhas;
- teste de força;
- login e conta;
- cofre seguro;
- logins;
- notas;
- cartões;
- endereços;
- documentos;
- backup e restauração;
- sincronização E2EE;
- Security Dashboard;
- monitoramento de vazamentos;
- Argon2id;
- AES-GCM 256.

## Biometria

A biometria é **opcional**. O usuário ativa ou desativa pelo botão de biometria no cabeçalho Android. Quando ativada, a abertura futura do aplicativo exige confirmação biométrica antes de liberar o engine do LockGuard.

A implementação não grava a senha mestra em texto aberto. Caso a sessão Web tenha expirado, o login convencional continua sendo solicitado normalmente.

## Compatibilidade

- Android 8.0+ / API 26+.
- Android 9+ usa `BiometricPrompt` do sistema.
- Android 8 usa `FingerprintManager` quando o hardware e impressões cadastradas estiverem disponíveis.
- Fallback para login/senha quando biometria não estiver disponível.
- Interface dimensionada pelo Web responsivo, funcionando em celulares compactos, telas grandes e tablets.

## Build e assinatura para testes

O workflow `Build Android` gera:

- `LockGuard-v0.0.2-debug.apk` — instalável diretamente para testes.
- `LockGuard-v0.0.2-unsigned.apk` — release sem assinatura de distribuição.

A partir da linha 0.0.2, o CI preserva uma identidade de assinatura de testes em cache privado do GitHub Actions e valida o APK com `apksigner` e `aapt` antes de publicar o artefato. Isso permite atualizações por cima nas próximas builds de teste que usem a mesma identidade.

O último estado de build é registrado automaticamente em `ci-status/android-latest.txt`, e os dados de validação ficam em `ci-status/android-apk-validation.txt`.