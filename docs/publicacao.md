# Publicação, hospedagem e rollback

Guia para publicar a página com segurança (IMP-704, IMP-705). A hospedagem ainda não foi escolhida (DEC-04); por isso o processo produz um pacote estático (`dist/`) que funciona em qualquer serviço, e os cabeçalhos são descritos para os mais comuns.

**Só publique depois da aprovação explícita do responsável pelo projeto (IMP-709).**

## 1. Antes da primeira publicação

1. Responda às decisões de [`conteudo-para-aprovacao.md`](conteudo-para-aprovacao.md). As obrigatórias para publicar são DEC-01 (número), DEC-04 (domínio) e DEC-07 (privacidade); DEC-02, DEC-03, DEC-05, DEC-06, DEC-08 e DEC-09 definem o conteúdo final.
2. Escolha o domínio canônico: com `www` (`https://www.dominio.com.br/`) ou sem. O outro endereço deve redirecionar (301) para ele.
3. Preencha `site-config.js`:
   - `whatsapp.number`: DDI 55, DDD e número;
   - `site.url`: endereço canônico, com https e barra final;
   - `site.productionHosts`: o domínio canônico e, se houver, o alternativo (por exemplo `['www.dominio.com.br', 'dominio.com.br']`);
   - `modalities` e `schedule`, conforme DEC-02, DEC-03 e DEC-10.
4. Rode `npm run seo` para gerar canonical, metadados absolutos, `robots.txt` e `sitemap.xml`.

## 2. Gerar e conferir o pacote

```bash
npm ci
npm test                 # sintaxe, HTML, formatação, CSS e testes unitários
npm run test:e2e         # comportamento no navegador
npm run lighthouse       # desempenho e acessibilidade (metas do plano)
npm run release          # check:release + dist/
```

`npm run release` falha se faltar qualquer dado obrigatório. O resultado fica em `dist/`:

- `index.html`, `site-config.js`, `tabs.js`, `contact.js`, `script.js`, `styles.css`;
- `favicon.ico`, `site.webmanifest`, `robots.txt`, `sitemap.xml`;
- `assets/` sem `assets/source/` (os originais não são publicados);
- `_headers` com os cabeçalhos de segurança e de cache.

Para conferir o pacote localmente antes de enviar: `npm run serve -- --root dist --port 4175` e, em outro terminal, `E2E_BASE_URL=http://127.0.0.1:4175 npm run test:e2e`.

> Para uma homologação antes das decisões, use `npm run dist` (sem a verificação de publicação). Nesse modo os botões do WhatsApp ficam desativados, com aviso de ambiente de teste ou de indisponibilidade.

## 3. Hospedagem

Envie **o conteúdo da pasta `dist/`** como raiz do site. Os cabeçalhos de segurança são obrigatórios; a fonte única deles é [`security-headers.json`](../security-headers.json).

| Serviço                   | Como publicar                                                                                           | Cabeçalhos                                                                               |
| ------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Netlify                   | Diretório de publicação `dist`; comando de build `npm ci && npm run release` (ou envio manual da pasta) | Lidos automaticamente de `dist/_headers`                                                 |
| Cloudflare Pages          | Diretório de saída `dist`; comando de build `npm ci && npm run release`                                 | Lidos automaticamente de `dist/_headers`                                                 |
| Vercel                    | Diretório de saída `dist`                                                                               | Copiar os valores de `_headers` para `headers` em `vercel.json`                          |
| Servidor próprio (Nginx)  | Copiar `dist/` para a raiz do site                                                                      | `add_header Nome "valor" always;` para cada linha do bloco `/*` de `_headers`            |
| Servidor próprio (Apache) | Copiar `dist/` para a raiz do site                                                                      | `Header always set Nome "valor"` (módulo `mod_headers`)                                  |
| GitHub Pages              | Não recomendado                                                                                         | Não permite cabeçalhos próprios: sem CSP completa, HSTS controlado nem `frame-ancestors` |

Cache (já em `_headers`): HTML, CSS e JS com `Cache-Control: no-cache`, pois os nomes não têm hash e precisam ser revalidados a cada visita; imagens e fontes com `max-age` de 7 dias. Ative compressão (Brotli ou gzip) para HTML, CSS, JS e SVG; a maioria dos serviços acima já faz isso.

## 4. Domínio e HTTPS

1. Aponte o DNS do domínio para a hospedagem, conforme as instruções do serviço.
2. Ative o certificado HTTPS (automático nos serviços da tabela) e o redirecionamento de HTTP para HTTPS.
3. Configure o redirecionamento 301 do domínio alternativo para o canônico.
4. Só depois de o HTTPS funcionar em todos os endereços mantenha o `Strict-Transport-Security` (`max-age=31536000; includeSubDomains`). Se algum subdomínio ainda não tiver HTTPS, remova `includeSubDomains` antes de publicar.

## 5. Verificação depois de publicar

1. Abra o site em um celular e num computador e confira o botão “Falar pelo WhatsApp”: ele deve abrir o WhatsApp com a mensagem pronta. Não é preciso enviar a mensagem.
2. Confira os cabeçalhos: `curl -sI https://www.dominio.com.br/` deve mostrar `content-security-policy`, `strict-transport-security`, `referrer-policy`, `x-content-type-options`, `x-frame-options` e `permissions-policy`.
3. Rode os testes que não dependem da configuração local contra o endereço público:

   ```bash
   E2E_BASE_URL=https://www.dominio.com.br npx playwright test --project=chromium \
     tests/e2e/recursos.spec.js tests/e2e/seguranca.spec.js tests/e2e/seo.spec.js tests/e2e/acessibilidade.spec.js tests/e2e/layout.spec.js
   ```

   Os demais testes alteram `site-config.js` durante a execução ou esperam o contato desativado e só fazem sentido localmente.

4. Lighthouse no endereço público: `npx lighthouse https://www.dominio.com.br/ --throttling-method=devtools --only-categories=performance,accessibility,best-practices,seo --view`.
5. Valide o compartilhamento (título, texto e imagem) com o depurador de compartilhamento das redes sociais usadas.
6. Registre a publicação na seção de contribuições do plano e no checklist de [`homologacao.md`](homologacao.md).

## 6. Versões e rollback

- A cada publicação, crie uma tag no commit publicado: `git tag -a publicacao-AAAA-MM-DD -m "Publicação de AAAA-MM-DD"` e envie a tag ao repositório.
- **Voltar uma versão:**
  1. pelo painel da hospedagem, se ela guardar implantações anteriores (Netlify, Cloudflare Pages e Vercel guardam), promova a implantação anterior; ou
  2. no repositório, `git checkout publicacao-AAAA-MM-DD`, `npm ci`, `npm run release` e envie o novo `dist/`.
- Depois de voltar, registre o motivo no plano e corrija o problema numa nova versão, sem reescrever o histórico.

## 7. Manutenção

- **Agenda manual:** ver “Atualizar a agenda manual” no [README](../README.md).
- **Imagens:** ver a seção “Imagens” do README; rode `npm run images` e os testes visuais.
- **Ano do rodapé:** atualizado automaticamente pelo navegador; o HTML guarda o ano como reserva.
- **Dependências:** periodicamente, `npm outdated`, atualização com versões fixas, `npm audit`, `npm test`, `npm run test:e2e` e `npm run lighthouse`.
- **Textos:** qualquer novo texto sobre atendimento, preços ou modalidades passa pela revisão do responsável (IMP-510).
