# Fartir Cut — checklist executável de lançamento

Atualizado em 15/11/2026. Responsável pela próxima execução: Gemini.

**Objetivo:** vender a utilidade atual para barbeiros que já gravam seus atendimentos no Android. Primeiro marco: cinco compras de usuários que testaram com material próprio; depois, verificar se voltam a usar.

**Arquivo mestre:** `C:\Users\mathe\Desktop\fartir-site\CHECKLIST-LANCAMENTO-FARTIR-CUT.md`. Atualize este arquivo. Cópias em `outputs` são retratos da entrega, não outros controles de progresso.

**Próxima tarefa:** Tudo pronto na base pré-upgrade (**P01–P05** e **Q01–Q02** concluídos). Próximo passo liberado para o dono trabalhar nas melhorias/upgrade do aplicativo (`codigo-fonte/`), mantendo **Google Play Store ONLY (Dodo Payments removido)** e ID de lançamento `br.com.fartir.cut`. Quando terminar o upgrade do app: `C01`/`C05` (Google Sign-In + Google Play Billing real).

## Como o Gemini deve manter a ordem

- `[x]` significa concluído no escopo descrito e com evidência. `[ ]` significa falta fazer, inclusive quando a implementação existe mas a validação está incompleta.
- Ao iniciar, anote `EM ANDAMENTO` na linha. Ao terminar, marque `[x]` e registre data, arquivos, verificação e resultado no histórico ao fim deste documento.
- Bloqueio: mantenha `[ ]`, escreva `BLOQUEADO: motivo / informação necessária` e avance somente em tarefas independentes.
- Preserve os IDs. Não marque testes do app, Google real, Play Billing remoto, publicação ou vendas com base em simulações locais.
- Não substitua este checklist pelo documento antigo de estratégia. Use a estratégia como referência de intenção; resolva conflitos pelo código vigente e pela decisão mais recente confirmada do dono.
- A autorização desta etapa foi preparar a base local e o checklist. Publicação, cobranças, anúncios e contato com pessoas são etapas futuras; não inferir autorização delas a partir deste arquivo.
- No fim de cada sessão: itens concluídos, falhas/limites, próximo ID e decisões pendentes. Evite recomeçar levantamentos já registrados.

## Direção comercial que deve orientar as tarefas

Público inicial: barbeiros que já possuem gravações e perdem tempo selecionando trechos. Mensagem: **Seu trabalho merece sair da galeria.** Apoio: **Você faz o corte. O Fartir corta a gravação.**

Oferta pretendida: sete dias de teste (168h corridas), US$ 19 em pagamento único para até 2 aparelhos ativos simultaneamente (com transferência), **distribuição e cobrança exclusivas via Google Play Store** (Dodo Payments removido em 15/11/2026 por decisão do dono; pode ser reintegrado no futuro se necessário). Não acrescentar planos, assinaturas ou provedores automaticamente.

Qualidade: sem recompressão do vídeo nos cortes compatíveis. Efeitos podem exigir renderização, inclusive completa quando necessário. Velocidade deve ser medida por etapa. Processamento local não elimina a conexão de instalação/ativação; o teste tem restrições próprias de relógio/reinício. Nunca anunciar exclusividade mundial, tempo fixo universal ou garantia de novos clientes.

Preservar identidade: site preto/creme/vermelho; app grafite/ciano, vertical e enxuto. Preservar motor, projetos e exportação existentes. Não refazer editor ou infraestrutura comercial pronta.

## B — Base entregue nesta etapa (15/11/2026)

- [x] B01 — Criar este checklist com IDs, dependências, critérios de aceite e passagem de bastão.
- [x] B02 — Substituir a promessa não medida de “1 hora em 1 minuto” no título, metadados e traduções da página principal. Evidência: `cut/index.html` e `cut/cut-i18n.js`.
- [x] B03 — Separar benefícios: seleção automática, preservação nos cortes compatíveis e processamento offline; preservar visual existente.
- [x] B04 — Tornar o CTA de pré-lançamento útil: “Saber do lançamento” abre WhatsApp com texto preenchido. Não envia mensagem, cadastra lista nem promete vaga automaticamente.
- [x] B05 — Identificar os celulares da vitrine como ilustração. Não foram criadas falsas telas de uso, depoimentos ou demonstrações.
- [x] B06 — Preparar seção de vídeo oculta por padrão, com controles, sem autoplay e sem carregamento antecipado. Configuração vazia não requisita mídia; erro de mídia esconde o player. Reprodução com arquivo real continua em V02.
- [x] B07 — Exibir resumo do teste e preço com status de preparação e acesso aos detalhes da licença.
- [x] B08 — Criar controles explícitos de vitrine: `PUBLICACAO_CONFIRMADA` e `CHECKOUT_VALIDADO`, ambos false. URL sozinha não libera compra. Isso não é segurança nem autorização de pagamento no backend.
- [x] B09 — Manter as 14 traduções; completar chaves novas; corrigir formatação de preço para não arredondar centavos. Revisão linguística humana internacional continua opcional em S04.
- [x] B10 — Verificar sintaxe JS e 145 verificações de estados/dicionários em 5 páginas e 14 idiomas. Testes locais de UI; não validam Google/Dodo remotos nem a licença Android.
- [x] B11 — Conferir navegador em desktop (1440), celular (390), largura estreita (320), troca PT/EN/AR, RTL e compra desativada. Nenhum erro de console observado na página de compra.
- [x] B12 — Preservar cópias anteriores dos quatro arquivos alterados e registrar como restaurar. App não foi compilado, instalado nem modificado nesta etapa; recebeu somente um arquivo de passagem de bastão.

## P — Decisões e contratos antes de mudar o fluxo comercial

- [x] P01 — **Unificar limite de aparelhos.** Site anuncia dois; documentação de ativação descreve uma principal por vez. Conferir schema, contrato e testes atuais. Aceite: uma regra definida e demonstrável; dois aparelhos exigem testes de coexistência, terceiro aparelho e substituição. Não confundir transferência com coexistência. Se a mudança for grande, apresentar ao Matheus custo/escopo antes de alterar a oferta. (Concluído em 15/11/2026: `001_activation_core.sql` atualizado com `slot IN (1,2)` + índices únicos parciais, `service.ts` adaptado para até 2 aparelhos simultâneos + transferência por slot, `tsc --noEmit` sem erros e `17/17` testes em `activation.test.mjs` aprovados).
- [x] P02 — **Definir canal de distribuição e cobrança (Google Play ONLY).** Decisão do dono confirmada em 15/11/2026: usar **exclusivamente a própria Google Play Store** (aceitando a taxa padrão de 15%), removendo a Dodo Payments para simplificar aprovação, compra com 1 toque e termos legais (com possibilidade de reintroduzir outro canal no futuro se desejado). Removidos `DODO_CHECKOUT_URL`/`CHECKOUT_VALIDADO` de `cut/cut-config.js`, `cut/cut-i18n.js` e `verificacao/check-launch.cjs`, e removidos módulos/rotas/webhooks Dodo de `ecossistema-comercial/` (`tsc --noEmit` 0 erros, `118/118` testes em `npm test` + `demo-local.mjs` aprovados).
- [x] P03 — **Conferir oferta e textos comerciais.** Teste de 168h desde ativação válida; US$ 19 em pagamento único via Google Play; até 2 aparelhos simultâneos + transferência; reembolso de 7 dias desacoplado e sujeito às regras da Google Play. Aceite: site, app e contrato concordam nos 14 idiomas (`check-launch.cjs`: 146/146 PASS em 5 páginas e 14 idiomas; revisão live no navegador em `/cut/`, `/cut/buy/`, `/cut/refunds/`, `/cut/privacidade/` sem erros de console e 0 menções visíveis à Dodo).
- [x] P04 — **Definir offline de forma honesta.** Confirmar trial após reboot e licença permanente offline na versão final. Aceite: comportamento e mensagens definidos; não introduzir reconexão periódica obrigatória na licença permanente como atalho. *(Concluído em 15/11/2026: confirmado em `CommercialClient.java`/`TrialClock.java` e refletido em `faq_3_a`, `terms_p2` e `cut-i18n.js` — edição offline; trial de 168h offline no mesmo boot e pede checagem ao reiniciar o celular; permanente assinada em RS256 roda offline sem revalidação periódica.)*
- [x] P05 — **Conferir identidade da versão de produção.** *(Concluído em 15/11/2026 com autorização do dono: `simCard` oculto quando `!debugTestMode`; `<receiver .XiaomiBenchReceiver>` em `src/debug/AndroidManifest.xml`; `codigo-fonte/app/build.gradle` definido com `applicationId 'br.com.fartir.cut'` para lançamento e `androidComponents` mantendo `'br.com.barbercut.ultra.dev'` no `debug` para preservar projetos locais e testes do Xiaomi. Gerada chave oficial PKCS12 RSA 2048 (`fartircut_upload`, validade 10.000 dias, SHA-256 `7b36fa208d38bc566d8bc4a71f1e06199f0c9e964b375bea29006b6d0699c290`) fora do código em `C:\Users\mathe\.fartir-keys\fartir-cut-upload.jks`, com trava fail-closed contra ausência/reuso de `debug.keystore` e `lint.checkReleaseBuilds false` para build offline. Verificado após edição: `VERIFICAR.ps1` 8/8, `COMPILAR.ps1` `app-debug.apk` (`br.com.barbercut.ultra.dev`), `assembleRelease` `app-release.apk` (`br.com.fartir.cut`, sem `XiaomiBenchReceiver`, `apksigner verify` OK) e `bundleRelease` `app-release.aab` (`2.729.664` bytes).)*

## Q — Confiabilidade e primeira experiência do app

- [x] Q01 — Instalar a versão candidata exata e repetir os quatro cenários de painel pendentes do registro de 14/11. *(Concluído em 15/11/2026 após ajuste final em `MainActivity.java` e `EditorTrimPlaybackValidation.java`: corrigido `MainActivity.onResume()` e `upgradeRawCanonOrientationsIfNeeded()` para atualizar transformação/timeline em vez de reconstruir a tela de Edição ativa e resetar o playhead, e adicionado `FLAG_KEEP_SCREEN_ON` em `ValidationHost.onCreate`. `VERIFICAR.ps1` 8/8, `COMPILAR.ps1` `BUILD SUCCESSFUL`, instalado no Xiaomi `d3dcea44`; `EditorTrimPlaybackValidation` 13/13 `PASS` na validação limpa junto com `CommercialAccountValidation`, `EditorToolsValidation`, `EditorGestureValidation` e `EditorAudioExportValidation` todos `PASS`.)*
- [x] Q02 — Executar validações adicionais de câmera lenta/playlist e conferir áudio da câmera, música, fades e volumes na saída. Aceite: arquivo exportado corresponde ao comportamento pretendido. *(Concluído em 15/11/2026 no novo `app-debug.apk` no Xiaomi `d3dcea44`: `EditorAudioExportValidation` + `measure_audio.py` aprovados nas 6 exportações MP4 via FFmpeg; `ExportTimingValidation -e mode retime` aprovado em câmera lenta 0.5x nos modos híbrido e completo com áudio/vídeo sincronizados em ~9,00s; arquivos `.m4a` `retime` e `playlist` criados em dispositivo com permissão `0600`.)*
- [ ] Q03 — Conferir reprodução, rotação e áudio nos destinos usados pelos clientes, incluindo Instagram e DaVinci quando fizerem parte da promessa. Aceite: resultado observado, com formato/aparelho registrados.
- [ ] Q04 — Testar pequena amostra de celulares, incluindo um intermediário de outro fabricante, com 1080p e formatos que serão anunciados. Aceite: tabela de compatibilidade; limites explícitos para formatos ainda não confirmados.
- [ ] Q05 — Conferir cancelamento, armazenamento insuficiente, reabertura do app e preservação de projetos. Aceite: falha não elimina originais/projeto; mensagens permitem recuperação.
- [ ] Q06 — Observar cinco pessoas no fluxo importar → selecionar → revisar → salvar. Medir análise, revisão humana e exportação separadamente. Aceite: registro dos obstáculos, sem assistência oculta.
- [ ] Q07 — Somente se Q06 mostrar dificuldade recorrente com excesso de takes: simplificar revisão/seleção curta sobre o motor existente. Aceite: usuário encontra trechos úteis com menos trabalho e mantém acesso aos demais. Não criar novo modo automático por suposição.

Q01–Q05 podem usar mídias de teste já existentes, com autorização e em projetos isolados. Arquivos sintéticos verificam funcionamento, não qualidade comercial nem desempenho representativo. Nenhuma tarefa exige que o Matheus envie um novo vídeo agora.

## C — Integração comercial real, aproveitando os módulos existentes

- [ ] C01 — Ligar login Google real com identidade estável, nonce, certificados e callbacks corretos. Aceite: login/cancelamento/falha/retorno funcionam no app final. Depende de P02/P05 e configuração externa.
- [ ] C02 — Completar leitura autenticada mínima da ativação e fluxo de recuperação/transferência. Preservar idempotência e `recoverPending`. Aceite: conexão perdida não duplica operação; conflito de transferência é recuperável. Depende de P01/C01.
- [ ] C03 — Resolver troca de conta/perfil sem perda de projetos; hoje há registro de bloqueio na mesma instalação. Aceite: comportamento claro, com recuperação de compra pela identidade correta.
- [ ] C04 — Ativar o teste real e tratar revisão de elegibilidade/falso positivo. Aceite: não iniciar prazo no simples download; não bloquear cliente legítimo sem caminho de suporte. Depende de C01/P04.
- [ ] C05 — Configurar produto e testar **Google Play Billing** real em ambiente de testes (licença interna / faixas de teste fechadas do Play Console). Aceite: aprovado, recusado, pendente, compra restaurada, assinatura/revogação e reembolso Play validados no backend sem liberar licença apenas pelo cliente. Depende de P02/P03/C01 e conta/credenciais do Play Console. *(Canal único Google Play ONLY; Dodo Payments removida.)*
- [ ] C06 — Vincular pedido à conta autenticada e confirmar licença no backend. Aceite: “mesmo e-mail” não é a única prova de identidade; compra não vai para outra conta.
- [ ] C07 — Testar restauração/reinício/morte do processo e os aparelhos previstos em P01. Aceite: permanente continua utilizável offline conforme oferta; limite de revogação offline reconhecido.
- [ ] C08 — Preparar operação mínima: suporte, recuperação de pedido, backup/restauração do banco e sinais de falha comercial. Aceite: problema de compra tem diagnóstico sem expor segredos ou vídeos.

## S — Site e materiais que avançam sem vídeo novo

- [ ] S01 — Revisar perguntas frequentes e páginas comerciais depois de P01–P04: Android, internet, compra, aparelhos, recuperação, privacidade e reembolso. Aceite: conteúdo corresponde à implementação, sem prometer iPhone.
- [ ] S02 — Conferir ficha, política de pagamentos e dados fiscais/comerciais exigidos no **Google Play Console**. Aceite: exigências reais registradas; checklist de envio preparado sem inventar aprovação.
- [ ] S03 — Preparar ficha da Google Play com ícone existente, descrição, suporte e capturas autênticas do app, se puderem ser obtidas da versão correta. Aceite: nenhuma imagem simulada é apresentada como tela real. Vídeo não é dependência desta tarefa.
- [ ] S04 — Revisar primeiro português e depois idiomas com público efetivo. Aceite: traduções novas tecnicamente completas não são chamadas de revisão profissional; não atrasar piloto em português por 14 mercados.

## V — Demonstração futura (não bloqueia P, Q técnico, C ou S)

- [ ] V01 — Quando houver material autorizado disponível: escolher sessão representativa e gravar uso real com modelo do aparelho e formato registrados. Pode ser material já existente; não solicitar envio agora.
- [ ] V02 — Inserir MP4 e configurar `VIDEO_DEMONSTRACAO_URL`; conferir reprodução, som, celular e arquivo inacessível. Aceite: seção aparece somente com mídia real funcional. A base já está em B06.
- [ ] V03 — Preparar peça curta, versão de 30–45s e demonstração integral. Aceite: acelerações/saltos identificados; tempo de exportação não vira tempo total anunciado.
- [ ] V04 — Obter autorização para uso dos trabalhos/depoimentos reais. Aceite: relato fiel, sem quantidade de clientes ou resultados inventados.

## L — Piloto, publicação e vendas

- [ ] L01 — Reunir 15–20 barbeiros com Android e gravações próprias. Conferir exigência aplicável da conta Play (para certas contas pessoais novas, 12 inscritos contínuos por 14 dias). Aceite: teste real e feedback, sem compra/troca de avaliações.
- [ ] L02 — Acompanhar importação, primeira exportação útil e segundo trabalho. Meta interna inicial: dez exportando e cinco retornando; amostra pequena, não previsão de mercado.
- [ ] L03 — Preparar versão final, permissões, termos, privacidade e segurança dos dados para a loja; confirmar configuração de produção e aprovação das contas. Aceite: todos os bloqueios P/C relevantes resolvidos.
- [ ] L04 — Com autorização de publicação, publicar a versão e conectar URL real da loja. Só então definir `PUBLICACAO_CONFIRMADA: true`. Aceite: instalação pelo destino oficial e recuperação de licença conferidas.
- [ ] L05 — Com autorização para vendas e fluxo confirmado na Play Console, publicar na loja e ativar `PUBLICACAO_CONFIRMADA: true` com `PLAY_STORE_URL` oficial. Aceite: compra Play Billing, recebimento e ativação operacional conferidos.
- [ ] L06 — Buscar cinco compras entre pessoas que testaram material próprio e não receberam licença permanente gratuita. Aceite: pagamentos confirmados e uso posterior acompanhado. Gratuidade não conta como validação do preço.
- [ ] L07 — Produzir três conteúdos úteis por semana e testar parceria com até três educadores pertinentes. Aceite: origem dos interessados e vendas registradas; envio de mensagens autorizado; sem disparos em massa.
- [ ] L08 — Medir receita líquida, reembolsos, tempo de suporte e origem das vendas. Só avaliar anúncio pago após compras orgânicas e orçamento definido. Aceite: custo por cliente sustentável; não confundir receita bruta com renda recorrente.

## Deixar fora do lançamento

iPhone; novos nichos simultâneos; novos planos; IA em nuvem; portal de afiliados; reescrita do site/editor; grandes bibliotecas de efeitos; exportação automática para muitos formatos. “Antes → Processo → Resultado” deve primeiro aproveitar e avaliar a narrativa já existente, sem assumir que os primeiros/últimos segundos sejam adequados.

## Mapa de leitura enxuto

| Fonte | Para que serve |
| --- | --- |
| `C:\Users\mathe\Desktop\fartir-site\BASE-LANCAMENTO-FARTIR-CUT.md` | Arquivos alterados, flags, vídeo futuro, testes e restauração |
| `C:\Users\mathe\Desktop\fartir-site\ESTRATEGIAS-FARTIR-CUT.md` | Estratégia anterior; não é lista de tarefas executadas |
| `C:\Users\mathe\Desktop\FartirCut 5.0\ESTADO-ATUAL.md` | Validação do editor; ler a atualização mais recente |
| `C:\Users\mathe\Desktop\FartirCut 5.0\CONTINUIDADE_ARGON.md` | Integração comercial; topo substitui prioridades antigas |
| `C:\Users\mathe\Desktop\FartirCut 5.0\docs\ATIVACAO_IMPLEMENTADA.md` | Evidência da ativação única; confirmar código/contrato para P01 |
| `C:\Users\mathe\Desktop\FartirCut 5.0\ecossistema-comercial\contracts\http-v1.openapi.json` | Contrato que deve ser reutilizado |

Fontes externas consultadas na estratégia; reconferir ao executar: [pagamentos Play](https://support.google.com/googleplay/android-developer/answer/10281818), [cobrança alternativa](https://support.google.com/googleplay/android-developer/answer/13821247?hl=en), [teste fechado](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en-419), [avaliações](https://developer.android.com/guide/playcore/in-app-review), [Dodo](https://docs.dodopayments.com/introduction).

## Histórico de execução

| Data | IDs | Evidência e limite | Próximo |
| --- | --- | --- | --- |
| 15/11/2026 | B01–B12 | Alterações locais de site e documentação; 145 verificações locais aprovadas; revisão visual desktop/mobile/PT/EN/AR. Não houve teste real de vídeo, Google/Dodo remoto, APK, publicação ou venda. | P01 |
| 15/11/2026 | P01 (+ vídeo local + títulos) | `001_activation_core.sql`, `service.ts`, `activation.test.mjs` (`tsc --noEmit` 0 erros, 17/17 testes PGlite aprovados para 2 aparelhos simultâneos + transferência); `VERIFICAR.ps1` 8/8 suítes offline do app; título original + nota 1080p 60fps restaurados nos 14 idiomas e `cut/midia/demo-real.mp4` ligado em 9:16 no servidor local. Limite: testes de câmera lenta no aparelho físico via ADB ainda pendentes. | P02 |
| 15/11/2026 | P04, Q02 (+ avanço P03, P05 e reteste Q01) | Site: `cut-config.js` (`DIAS_REEMBOLSO: 7`), `cut-i18n.js` (14 idiomas × 141 chaves verificadas com Node, `{refund_days}` desacoplado e textos offline/168h/2 aparelhos em `cut/index.html`, `termos/` e `refunds/` verificados no preview sem erros de console; título da seção de vídeo alterado para "Veja o app funcionando" com `demo-real.webm` + `demo-real.mp4` + `demo-poster.jpg`). App: `CommercialAccountActivity.java` oculta `simCard` quando `!debugTestMode`; `<receiver .XiaomiBenchReceiver>` movido para `src/debug/AndroidManifest.xml`; `VERIFICAR.ps1` 8/8 suítes; `COMPILAR.ps1` `BUILD SUCCESSFUL in 2m 9s`; instalado no Xiaomi `d3dcea44` via `adb install -r` (`Success`). Validação pós-build no Xiaomi: `CommercialAccountValidation` `PASS`; `EditorToolsValidation` `PASS`; `EditorGestureValidation` `PASS`; `ExportTimingValidation -e mode retime` `PASS` (`hybridVideoUs=8999900`/`hybridAudioUs=9002700`, `fullVideoUs=9000000`/`fullAudioUs=9002700`); `EditorAudioExportValidation` + `measure_audio.py` `PASS` (6/6 MP4s FFmpeg); `EditorTrimPlaybackValidation` 10/13 nesta última corrida (`fresh-panel-in/out` e `played-paused-out-to-limit-then-play` falharam -> Q01 permanece `[ ]`). | P02 / P05 / Q01 |
| 15/11/2026 | P02, P03, Q01 (+ avanço técnico P05) | Decisão do dono: **Google Play Store ONLY** (taxa 15%, Dodo Payments removido; pode ser reintegrado depois). Site: removidos `DODO_CHECKOUT_URL`/`CHECKOUT_VALIDADO` de `cut/cut-config.js`, `cut/cut-i18n.js` (14×141 chaves), `cut/buy/`, `cut/refunds/`, `cut/privacidade/` e `verificacao/check-launch.cjs` (`146` checagens, 14 idiomas, 5 páginas `PASS`; browser QA em `/cut/`, `/cut/buy/`, `/cut/refunds/`, `/cut/privacidade/` com 0 erros de console, 0 overflow e 0 menções visíveis à Dodo). Backend `ecossistema-comercial/`: removidos módulos/rotas/webhooks Dodo (`tsc --noEmit` 0 erros, `118/118` testes em `npm test` + `demo-local.mjs` `PASS`; `test:postgres` depende de cluster PostgreSQL local dedicado). App: corrigidos `MainActivity.onResume()` e `upgradeRawCanonOrientationsIfNeeded()` (atualizam transformação/timeline em vez de reconstruir a aba Edição ativa) + `FLAG_KEEP_SCREEN_ON` em `EditorTrimPlaybackValidation$ValidationHost`; `codigo-fonte/app/build.gradle` separa release (`br.com.barbercut.ultra`) de debug (`applicationIdSuffix '.dev'`) com trava fail-closed em `signingConfigs.release`. Xiaomi `d3dcea44` pós-edição: `VERIFICAR.ps1` 8/8, `COMPILAR.ps1` `BUILD SUCCESSFUL`, `CommercialAccountValidation`, `EditorToolsValidation`, `EditorGestureValidation`, `EditorAudioExportValidation` todos `PASS`; `EditorTrimPlaybackValidation` fechou `13/13 PASS` (`INSTRUMENTATION_CODE: 0`) em execução limpa após 1 falha transitória em `fresh-panel-out-then-play` na bateria anterior. Limite restante em P05: gerar upload key de release e confirmar ID final na Play Console antes do primeiro upload. | P05 (upload key/ID Play Console) → C01/C05 |
| 15/11/2026 | P05 | Confirmado pelo dono `applicationId 'br.com.fartir.cut'` para lançamento e autorizada criação da upload key oficial (`C:\Users\mathe\.fartir-keys\fartir-cut-upload.jks`, PKCS12 RSA 2048, `fartircut_upload`, SHA-256 `7b36fa208d38bc566d8bc4a71f1e06199f0c9e964b375bea29006b6d0699c290`) e `release-signing.properties` fora do repositório. `codigo-fonte/app/build.gradle` atualizado com `br.com.fartir.cut` no release, `androidComponents` mantendo `br.com.barbercut.ultra.dev` no debug e `lint.checkReleaseBuilds false` para build offline. Verificado após edição: `VERIFICAR.ps1` 8/8, `COMPILAR.ps1` (`app-debug.apk` `br.com.barbercut.ultra.dev`), `assembleRelease` (`app-release.apk` `br.com.fartir.cut`, sem `XiaomiBenchReceiver`, `apksigner verify` OK) e `bundleRelease` (`app-release.aab` `2.729.664` bytes). | Melhorias do app (dono) → C01/C05 |
| 16/11/2026 | Refino visual do site (`/cut`) | Atualizados `cut/index.html`, `cut/cut-style.css`, `cut/cut-motion.css` e `cut/cut-i18n.js`: subtítulo/nota de velocidade e 3 benefícios simplificados (layout limpo à esquerda); 3 passos atualizados (`20 CLIPS`, `0:39`, 15 quadros `9:16` distintos em `cut/midia/s1..s3-*.jpg`); vídeo `cut/midia/demo-real.mp4`/`.webm` sem áudio e sem bordas pretas em `9:16` (`1:14`); celular esquerdo reduzido para 6 miniaturas maiores (sem `barbeiro-hero.jpg` na faixa) e celular direito reordenado verticalmente (`corte-5`, `corte-3`, `corte-2`, `corte-4`, `corte-1`). Verificado após edição: `check-launch.cjs` `146/146` (`14` idiomas, `5` páginas `PASS`), `node --check` OK e inspeção visual desktop (`1440×900`) + mobile (`390×844`) com `0` erros de console e `0` overflow. | Melhorias/upgrade do app (dono) → Q03–Q06 / C01–C08 / S01–S04 / L01–L08 |

Para nova entrada: `data | IDs concluídos | arquivos + comando/observação + resultado + limites | próximo ID`. Se uma verificação falhar, reabra o item correspondente.
