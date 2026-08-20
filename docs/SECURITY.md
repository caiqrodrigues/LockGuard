# Segurança

## Modelo atual

- **AES-GCM 256** para criptografia do conteúdo do cofre.
- **Argon2id** para derivação da chave a partir da senha mestra nos cofres atuais.
- Compatibilidade controlada com PBKDF2 para migrações antigas.
- **Supabase Auth** para identidade da conta.
- **PostgreSQL Row Level Security (RLS)** para isolamento de linhas por usuário.
- **Pwned Passwords / k-anonimato** para verificação de senhas comprometidas: somente os primeiros 5 caracteres hexadecimais do SHA-1 são enviados ao serviço de consulta.
- Backup do cofre permanece cifrado.
- A senha mestra não deve ser armazenada no servidor.

## Extensão de navegador

A extensão usa `chrome.storage.session` para manter temporariamente as credenciais disponíveis para autofill enquanto o cofre está desbloqueado. O objetivo é evitar persistência duradoura do material descriptografado no armazenamento da extensão.

## Android

A biometria da versão Android 0.0.2 é uma camada opcional de controle de entrada do aplicativo.

- Android 9+ usa a API biométrica do sistema.
- Android 8 utiliza `FingerprintManager` quando disponível.
- A biometria não substitui permanentemente a senha mestra do cofre.
- A senha mestra não é gravada em texto aberto pelo código Android.
- Se a sessão da conta expirar, o login convencional volta a ser solicitado.
- WebView debugging permanece desabilitado.
- Cookies de terceiros são desabilitados.
- `usesCleartextTraffic=false` impede HTTP sem TLS pelo aplicativo.

## Windows

O aplicativo Windows usa Tauri/WebView2 e reutiliza o frontend Web. Os builds são gerados em runner Windows no GitHub Actions. A distribuição ainda não usa certificado comercial de assinatura de código, portanto o SmartScreen pode alertar em builds iniciais.

## Segredos que nunca devem entrar no repositório

- Supabase service-role key;
- senha do banco de dados;
- senha mestra;
- backups descriptografados;
- credenciais privadas de assinatura Android;
- certificados/chaves privadas de assinatura Windows.

A chave publicável usada pelo frontend não é um segredo administrativo; a autorização efetiva depende da sessão autenticada e das políticas RLS.

## Limitação importante

O LockGuard ainda **não passou por auditoria de segurança independente**. Não deve ser descrito como formalmente auditado ou equivalente, em maturidade, a produtos comerciais que passaram por anos de auditorias e programas de bug bounty.