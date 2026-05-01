# Deploy do Álbum FIFA na VPS (Hostinger + HestiaCP)

## Stack publicada

- Host: `72.62.12.42` (Ubuntu 24.04, HestiaCP, Nginx 1.29)
- Usuário Hestia: `visaoativa`
- Domínio: `albumfifa.com.br` (+ www)
- Document root: `/home/visaoativa/web/albumfifa.com.br/public_html/`
- Tipo: SPA estática (Vite build) — sem Node em produção
- Backend de dados: Supabase (`nzrvytstwtrbytdzazzb.supabase.co`)

## DNS necessário

No registrador do domínio, criar:

```
A   @     72.62.12.42
A   www   72.62.12.42
```

## Build + Deploy (PowerShell, no Windows)

```powershell
# 1. Build local
npm run build

# 2. Upload do dist/ via SCP
scp -r "F:\Clientes\copa do mundo\dist\*" `
    root@72.62.12.42:/home/visaoativa/web/albumfifa.com.br/public_html/

# 3. Permissões corretas
ssh root@72.62.12.42 "chown -R visaoativa:www-data /home/visaoativa/web/albumfifa.com.br/public_html/"
```

## Ativar HTTPS (Let's Encrypt) — só depois do DNS propagar

```bash
ssh root@72.62.12.42 \
  "/usr/local/hestia/bin/v-add-letsencrypt-domain visaoativa albumfifa.com.br www.albumfifa.com.br"
```

## Rota fallback para SPA (React Router)

Se aparecer 404 ao recarregar uma rota interna (`/trocas`, etc.), criar
`/home/visaoativa/conf/web/albumfifa.com.br/nginx.conf_spa` no servidor
com:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

e rodar `nginx -s reload`. O vhost do Hestia já inclui `nginx.conf_*` automaticamente.
