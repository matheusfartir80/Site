# 📋 CONTINUAR O PROJETO (passagem de bastão)

Este arquivo explica o projeto para **qualquer IA** (Claude, Gemini/Argon, GPT/Codex) continuar de onde parou.

## Como continuar com outro agente

1. Abra a pasta `fartir-site` inteira no editor/agente que for usar
   (no Antigravity: *File → Open Folder*; no Codex/Gemini: anexe a pasta ou os arquivos).
2. Cole esta mensagem para a IA:

> Leia o arquivo CONTINUAR.md desta pasta. Ele explica o site da minha barbearia.
> Continue a partir da seção "Próximos passos". Não mude o visual do topo e
> mantenha todos os textos editáveis no textos.js.

---

## O que é o projeto

Site de **uma página** da barbearia **Fartir** (Contagem/MG), HTML/CSS/JS puro, sem framework.
Inspirado num modelo do Dribbble (fundo preto, palavra gigante creme, pessoa na frente das letras,
detalhes em vermelho pintado à mão).

## Arquivos

| Arquivo | Para que serve |
|---|---|
| `index.html` | Design completo (CSS e JS dentro). O dono **não** precisa mexer. |
| `textos.js` | "Bloco de notas": todos os textos, WhatsApp, Instagram e fotos. Uma linha por item (`SITE.CHAVE = "texto";`). |
| `fotos/barbeiro.png` | Foto principal **sem fundo** (recortada com rembg). |
| `fotos/barbeiro-original.jpg` | Mesma foto com fundo (reserva). |
| `fotos/corte-1/2/3.jpg` | Fotos dos cortes (thumbs do topo, galeria e prévia ao passar o mouse nos serviços). |

## Regras do dono (não quebrar)

- WhatsApp: **31993811525**, mensagem: "Olá, vi seu site e quero saber mais informações."
- Instagram: **@fartir.lab** (link para instagram.com/fartir.lab)
- Palavra gigante: **FARTIR** · frase vermelha: **Laboratório de cortes**
- Topo: esquerda "Desde 2016", centro "Atendimento particular", direita "📍 Contagem MG"
- Serviços: Corte, Barba, Penteados, Pigmentações · **sem preços**
- Círculo: "Hora marcada" · Horário: "Horário flexível"
- Botão: "Agende por aqui" → abre o WhatsApp
- Código de barras do modelo foi trocado por **QR Code** do WhatsApp
- Tudo que for texto novo deve ir para o `textos.js` (o dono precisa editar sozinho, nível "criança entende")

## Como o código funciona (para a IA)

- `textos.js` define `var SITE = {}` e `SITE.X = "..."`.
- No `index.html`, elementos com `data-t="CHAVE"` recebem o texto (`|` vira quebra de linha).
  `data-zap` → link do WhatsApp, `data-insta` → link do Instagram, `data-phone` → telefone formatado.
- Listas (serviços, galeria, faixa, manifesto) são geradas por JS a partir do `SITE`.
- Se o `textos.js` tiver erro de sintaxe, aparece uma faixa amarela avisando (e o site usa os textos padrão do HTML).
- Função `layout()` ajusta o tamanho da palavra gigante e posiciona a foto/frase pintada.
- Bibliotecas externas: Google Fonts (Archivo, JetBrains Mono, Permanent Marker) e `qrcode-generator` (jsDelivr).

## Seções da página

1. Topo (hero) com animação de entrada
2. Duas faixas cruzadas correndo
3. Manifesto (palavras acendem ao rolar)
4. Serviços em letra gigante (foto segue o mouse)
5. Galeria "Cortes finos e estilizados" (vira carrossel no celular)
6. Números (anos calculados automaticamente desde 2016)
7. Como agendar (3 passos)
8. Instagram gigante
9. Chamada final + QR Code + mapa de Contagem
10. Rodapé

## Status

- [x] Estrutura completa, textos.js, fotos processadas
- [x] Visual conferido no PC (1440x900) e celular — topo, seções e rodapé OK
- [ ] Dono ver no navegador e pedir ajustes finos
- [ ] Publicar na internet

Dica para testar: abrir `index.html?shot` pula o loader e as animações (bom para prints).

## Próximos passos (ideias)

- Ajustes finos de posição/tamanho depois que o dono ver no navegador
- Seção de depoimentos (só com depoimentos **reais** de clientes)
- Slider de antes/depois (quando houver fotos)
- Publicar grátis: Netlify Drop (arrastar a pasta em app.netlify.com/drop) ou GitHub Pages

---

## 🔒 Sistema Administrativo e FARTIR PASS (Indique & Ganhe)

Adicionado em 21/10/2026 de forma modular, sem alterar o site raiz nem o orçamento.

### 1. Estrutura de Pastas e Rotas

| Rota no Site | Pasta/Arquivo | Função |
|---|---|---|
| `fartir.com.br/admin` | `admin/index.html` | Painel de controle do barbeiro (senha: `2468`). Gera convites automaticamente na menor vaga livre (`convite1`, `convite2`). |
| `fartir.com.br/convite1` ou `/pass/?c=convite1` | `pass/index.html` | Página pública do convite Fartir Pass. Mostra contador de 30 dias globais, agendamento de amigo no WhatsApp e área de validação presencial do barbeiro. |
| — | `pass/shared.js` e `admin/shared.js` | Motor de dados compartilhado (chave: `fartir_pass_tickets_v1`). |
| — | `404.html` | Redirecionador automático para GitHub Pages carregar qualquer `/conviteX` sem erro de página não encontrada. |

### 2. Regras do Fartir Pass
- **Contador:** 30 dias corridos contados a partir da ativação do titular.
- **Vaga Única de Amigo:** Apenas o primeiro amigo que cortar com a senha do barbeiro aproveita o desconto de 50%.
- **Menor Vaga Livre:** Quando o convite expira ou ambos cortam, o sistema libera a vaga para o próximo cliente.

### 3. Como adicionar novas abas no Admin futuramente (Para IAs)
O arquivo `admin/index.html` foi desenhado para ser expansível. Para adicionar um novo módulo (ex: financeiro, galeria):
1. Crie uma nova `<div class="card">` ou `<section>` dentro de `admin/index.html`.
2. O sistema de login já protege toda a página automaticamente.
3. Não precisa alterar `index.html` da raiz nem o `orcamento.html`.
