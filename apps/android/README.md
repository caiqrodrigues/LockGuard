# LockGuard Android

Aplicativo Android oficial do LockGuard.

## Objetivos
- Interface adaptativa para celulares compactos, grandes e tablets.
- Prioridade para baixo consumo de RAM/CPU e aparelhos modestos.
- Mesma conta e cofre criptografado do LockGuard Web.
- Gerador, medidor de força, cofre, notas, cartões, endereços, documentos e Security Dashboard.
- Bloqueio automático ao sair do app.
- Preparado para biometria Android em etapa posterior, sem substituir a senha mestra.

## Compatibilidade alvo
- Android 8.0+ (API 26+) como baseline inicial.
- Layout responsivo sem largura fixa.
- ARM64 como alvo principal; APK universal poderá ser produzido para instalação direta.

## Segurança
O Android deve preservar o modelo de criptografia do Web. Nenhuma chave service-role ou segredo de backend deve ser empacotado no APK. O cofre deve permanecer criptografado fora da memória de uma sessão desbloqueada.

## Status
Estrutura Android iniciada na v0.7.03. Build APK/AAB ainda não validado em runner Android; não considerar release estável até CI e teste em dispositivo/emulador passarem.
