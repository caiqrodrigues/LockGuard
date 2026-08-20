# LockGuard — Versionamento por plataforma

As versões do LockGuard são independentes por plataforma.

| Plataforma | Versão oficial atual |
|---|---:|
| Web | **0.7.3** |
| Browser Extension | **0.0.1** |
| Windows | **0.0.1** |
| Android | **0.0.2** |

## Regra

- Mudança somente no Web → incrementa apenas Web.
- Mudança somente na extensão → incrementa apenas Extensão.
- Mudança somente no Windows → incrementa apenas Windows.
- Mudança somente no Android → incrementa apenas Android.
- Mudança compartilhada que afete várias plataformas → cada plataforma afetada recebe seu próprio incremento.

O histórico consolidado fica em `CHANGELOG.md`.