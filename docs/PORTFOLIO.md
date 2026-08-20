# LockGuard — visão de portfólio

## Resumo

O LockGuard é um gerenciador de senhas multiplataforma criado para estudar e implementar conceitos reais de segurança de credenciais, criptografia client-side, sincronização de dados cifrados, extensões de navegador, aplicativos desktop/mobile e pipelines CI/CD.

## Problema resolvido

Usuários precisam gerar, armazenar, consultar e reutilizar credenciais entre dispositivos sem entregar o conteúdo descriptografado do cofre ao servidor.

## Solução

O projeto separa autenticação de conta e senha mestra. O cofre é cifrado no cliente, sincronizado como ciphertext e aberto somente no cliente autorizado. O mesmo produto é distribuído em Web, extensão Chromium, Windows e Android.

## Destaques técnicos

- Arquitetura client-side encryption.
- Argon2id para derivação de chave.
- AES-GCM 256 para conteúdo do cofre.
- Supabase Auth e PostgreSQL RLS.
- Monitoramento de vazamentos com k-anonimato.
- Extensão Manifest V3 e autofill.
- Tauri 2 para desktop Windows.
- Android com camada biométrica nativa e paridade com engine Web.
- GitHub Actions em runners Linux e Windows.
- Builds reproduzíveis e artefatos versionados.

## Plataformas e versões

- Web **0.7.3**
- Extensão **0.0.1**
- Windows **0.0.1**
- Android **0.0.2**

## Decisões de arquitetura que podem ser discutidas em entrevista

### Por que Argon2id?
Porque é um KDF resistente a ataques de força bruta com custo configurável de memória e tempo, apropriado para derivação de chave a partir de senhas humanas.

### Por que AES-GCM?
Além de confidencialidade, fornece autenticação do ciphertext, permitindo detectar alterações no conteúdo cifrado.

### Por que RLS no Supabase?
RLS adiciona uma barreira de autorização no próprio banco, reduzindo o risco de uma consulta de cliente acessar linhas de outro usuário.

### Por que k-anonimato no monitor de vazamentos?
O cliente não envia a senha completa nem o hash SHA-1 inteiro. Apenas um prefixo é usado na consulta e o restante é comparado localmente.

### Por que Tauri no Windows?
Permite reaproveitar a UI Web com footprint menor do que empacotar um runtime Chromium completo como ocorre em arquiteturas desktop mais pesadas.

### Por que o Android 0.0.2 usa engine Web?
O objetivo foi preservar paridade funcional e de criptografia com o Web, adicionando uma camada Android nativa para biometria e comportamento de aplicativo. Isso reduz duplicação de lógica sensível e risco de divergência entre implementações.

## Estado de maturidade

O projeto está em desenvolvimento ativo e possui validação funcional das plataformas, mas ainda não passou por auditoria de segurança independente. Essa limitação é documentada explicitamente.
