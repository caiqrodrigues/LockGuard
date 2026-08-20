# Segurança

- AES-GCM 256 para o conteúdo do cofre.
- Argon2id para derivação da chave mestra.
- Supabase Auth + RLS por usuário.
- Verificação Pwned Passwords por k-anonimato.
- Backup criptografado.
- Credenciais da extensão ficam apenas em `chrome.storage.session` enquanto o cofre está desbloqueado.

O projeto ainda não passou por auditoria de segurança independente.
