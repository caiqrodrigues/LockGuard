# Changelog

Todas as mudanças relevantes do LockGuard são registradas aqui por plataforma.

## Web 0.7.4
- Nova área **Conta**.
- Edição do nome do perfil.
- Cadastro/edição de telefone no perfil sincronizado.
- Alteração do e-mail de login com fluxo de confirmação do provedor de identidade quando aplicável.
- Alteração da senha da conta com reautenticação da senha atual.
- Nova senha verificada contra vazamentos conhecidos antes da troca.
- Encerramento de sessão dentro da área de conta.
- Senha mestra continua independente e não é alterada nesta versão.

## Browser Extension 0.0.2
- Compatibilidade com Web 0.7.4.
- Atalho para gerenciamento de conta LockGuard.
- Autofill e sincronização temporária do cofre mantidos.

## Windows 0.0.2
- Web Engine atualizado para 0.7.4.
- Gestão de conta sincronizada disponível no desktop.
- Portable e instalador NSIS versionados como 0.0.2.

## Android 0.0.4
- Web Engine atualizado para 0.7.4.
- Botão Conta volta a abrir o gerenciamento completo da conta.
- Gestão de nome, telefone, e-mail, senha da conta e logout no celular.
- Biometria, área segura de tela e bloqueio ao retornar ao aplicativo mantidos.
- Assinatura de testes estável mantida para instalação por cima da versão anterior.

## Web 0.7.3
- Gerador seguro de senhas.
- Teste de força.
- Cofre criptografado e sincronizado.
- Argon2id + AES-GCM 256.
- Tipos de item: login, nota, cartão, endereço e documento.
- Backup e restauração.
- Security Dashboard.
- Monitoramento de vazamentos por k-anonimato.
- Integração com extensão de navegador.

## Browser Extension 0.0.1
- Primeira versão funcional.
- Manifest V3.
- Detecção do LockGuard Web.
- Sincronização temporária de credenciais desbloqueadas.
- Autofill em páginas de login.
- Compatível com Opera, Chrome e Edge baseados em Chromium.

## Windows 0.0.1
- Primeira versão Windows.
- Aplicativo Tauri 2.
- Build Portable.
- Instalador NSIS.
- Reutilização do frontend Web para paridade funcional.
- Build automatizado em runner Windows via GitHub Actions.

## Android 0.0.3
- Biometria exigida novamente ao abrir/retomar o aplicativo quando habilitada.
- Ajuste de safe area para barras de status e navegação.
- Refinamentos de sessão móvel.

## Android 0.0.2
- Novo ícone LockGuard com cadeado.
- Interface móvel Black/Gold.
- Engine Web responsivo para paridade funcional.
- Camada Android nativa de segurança.
- Entrada biométrica opcional.
- Compatibilidade alvo Android 8.0+.
- Build automatizado via GitHub Actions.

### Android 0.0.1
- Primeiro APK funcional.
- Gerador e interface móvel inicial.
