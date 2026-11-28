# Publicação na Vercel

Importe `Alef-Almeida/landing_page_guilherme` na conta do Guilherme e selecione a branch `main`.
O arquivo `vercel.json` configura o preset **Other**, o build `npm run vercel:build` e a saída `dist`.

O build usa `VERCEL_PROJECT_PRODUCTION_URL` para gerar os metadados, sitemap e configuração de contato
no domínio publicado. A URL específica de cada deploy também recebe links de contato funcionais.
Para priorizar um domínio próprio, configure `SITE_URL=https://seu-dominio/` na Vercel e faça um novo deploy.
Não é necessário alterar `site-config.js` para publicar na Vercel.

Os cabeçalhos de `vercel.json` reproduzem a política de `security-headers.json`; mantenha os dois em
sincronia ao atualizar a política. A Vercel usa essa configuração de cabeçalhos, não o arquivo `_headers`.

Para conferir o pacote localmente no PowerShell:

```powershell
$env:SITE_URL = 'https://validacao.example/'
npm run vercel:build
Remove-Item Env:SITE_URL
```
