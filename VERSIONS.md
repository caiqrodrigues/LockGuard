# LockGuard — Versionamento por plataforma

As versões do LockGuard são independentes por plataforma.

| Plataforma | Versão oficial atual |
|---|---:|
| Web | **0.7.4** |
| Browser Extension | **0.0.2** |
| Windows | **0.0.2** |
| Android | **0.0.4** |

## Regra

- Mudança somente no Web → incrementa apenas Web.
- Mudança somente na extensão → incrementa apenas Extensão.
- Mudança somente no Windows → incrementa apenas Windows.
- Mudança somente no Android → incrementa apenas Android.
- Mudança compartilhada que afete várias plataformas → cada plataforma afetada recebe seu próprio incremento.

## Atualização atual

A gestão de conta passa a ser compartilhada pelo Web Engine 0.7.4: nome do perfil, telefone, e-mail de login, troca da senha da conta e encerramento de sessão. A troca da senha mestra permanece fora desta versão.

O histórico consolidado fica em `CHANGELOG.md`.
