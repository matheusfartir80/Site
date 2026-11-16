# Base local de lançamento — manutenção pelo Gemini

Entrega de 15/11/2026. Não publicada. Fonte de progresso: `C:\Users\mathe\Desktop\fartir-site\CHECKLIST-LANCAMENTO-FARTIR-CUT.md`.

## O que foi alterado

Raiz do site: `C:\Users\mathe\Desktop\fartir-site\`.

| Arquivo relativo à raiz | Alteração |
| --- | --- |
| `cut/index.html` | Nova chamada, qualificação de qualidade, ilustração identificada, CTA de contato, disponibilidade, oferta resumida e seção futura de vídeo |
| `cut/cut-i18n.js` | Textos novos nos 14 idiomas, preço com centavos, destinos validados e estados de disponibilidade/vídeo |
| `cut/cut-config.js` | Flags explícitas de publicação e checkout; instrução para mídia futura |
| `cut/cut-style.css` | Estilos enxutos para status, oferta e vídeo; foco visível, tela estreita e redução de movimento |
| `verificacao/check-launch.cjs` | Verificação de estados e dicionários, sem pacotes externos |

Páginas comerciais herdadas mantêm o conteúdo anterior. Em particular, a promessa de dois aparelhos ainda deve ser conciliada com o licenciamento (P01). O código do aplicativo, APKs, backend e site principal da barbearia não foram alterados nesta entrega.

## Configuração dos três estados

Arquivo: `C:\Users\mathe\Desktop\fartir-site\cut\cut-config.js`.

| Estado | Configuração | Resultado |
| --- | --- | --- |
| Preparação atual | `PUBLICACAO_CONFIRMADA: false` | Contato pelo WhatsApp; navegação “Como funciona”; compra indisponível ("Disponível em breve na Google Play") |
| App publicado e liberado (Google Play ONLY) | `PUBLICACAO_CONFIRMADA: true` e `PLAY_STORE_URL` oficial `https://play.google.com/...` | Botões de download e licença habilitados com destino oficial da Google Play Store |

As flags são controles de apresentação. Não fazem login, não criam pedido, não validam pagamento e não concedem licença. O backend continua responsável por identidade, confirmação, autorização e recuperação. Um checkout estático sem vinculação à conta não atende ao plano comercial.

O contato de pré-lançamento só abre uma conversa com texto traduzido. O visitante ainda precisa enviar a mensagem. Não há formulário, lista de espera, envio automático, promessa de aviso ou coleta de dados nova.

## Adicionar vídeo quando houver mídia real

1. Colocar MP4 autorizado, por exemplo em `C:\Users\mathe\Desktop\fartir-site\cut\midia\demo-real.mp4`, ou usar URL HTTPS real.
2. Configurar `VIDEO_DEMONSTRACAO_URL: "midia/demo-real.mp4"`.
3. Conferir carregamento, reprodução, som, celular e conteúdo. Preparar legendas/transcrição quando necessárias para a demonstração escolhida.
4. Marcar V02 apenas depois da reprodução real. Não tratar a passagem dos testes de configuração como prova de reprodução.

Com valor vazio, não aparece seção vazia nem é requisitado vídeo. O player tem controles, `playsinline`, `preload="none"` e não faz autoplay. Uma falha de mídia esconde a seção. Não existe vídeo de demonstração nesta entrega.

## Verificações reproduzíveis

No PowerShell, com Node disponível:

```powershell
node --check 'C:\Users\mathe\Desktop\fartir-site\cut\cut-config.js'
node --check 'C:\Users\mathe\Desktop\fartir-site\cut\cut-i18n.js'
node 'C:\Users\mathe\Desktop\fartir-site\verificacao\check-launch.cjs' 'C:\Users\mathe\Desktop\fartir-site'
```

Resultado desta entrega: 145 verificações, 14 idiomas e cinco páginas, PASS. Cobre destinos de pré-lançamento, flags independentes, URLs inadequadas, erro de mídia, chaves de tradução, RTL, preço com centavos e status repetido. Usa DOM mínimo de teste; não é navegador real nem teste de pagamentos.

Também houve revisão real no navegador: desktop 1440px; celular 390px; árabe/RTL a 320px; seletor de idioma PT → EN → AR; checkout sem href e com aviso de indisponibilidade; nenhuma rolagem horizontal nos tamanhos inspecionados. Limite: não houve reprodução de MP4 real nem transação remota. Traduções novas não passaram por revisão humana nativa.

Para conferir localmente:

```powershell
python -m http.server 8765 --bind 127.0.0.1 --directory 'C:\Users\mathe\Desktop\fartir-site'
```

Abrir `http://127.0.0.1:8765/cut/?lang=pt-BR`. Encerrar o servidor quando terminar. Não é publicação pública.

## Cópia de segurança

Antes da edição, os quatro arquivos de produção alterados foram copiados para:

`C:\Users\mathe\Documents\Codex\2026-11-15\c-users-mathe-desktop-fartir-site\work\backup-base-lancamento\`

O arquivo `sha256.json` dessa pasta registra os hashes anteriores. Para restaurar, comparar o arquivo atual com o backup e copiar somente os arquivos desejados. Não substituir a pasta inteira do site nem sobrescrever trabalho posterior do Gemini. Preserve o histórico deste checklist mesmo ao reverter o layout.

## Próxima entrega recomendada

Executar P01 com leitura cirúrgica do contrato/schema/testes comerciais. Entregar a divergência resolvida ou uma decisão concreta de escopo. Enquanto faltarem contas/configurações externas, avançar Q técnico e S sem pedir novo vídeo ao Matheus. Não refazer esta base.
