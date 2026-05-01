# 🏆 FIFA World Cup 2026 — Sticker Album Tracker

Controlador interativo do álbum Panini da Copa do Mundo FIFA 2026, com **990 figurinhas** organizadas no schema oficial (`PREFIX-NUMBER`).

## ✨ Funcionalidades

- **Dashboard premium** com KPIs animados, heatmap de seleções e ranking
- **48 seleções** × 20 figurinhas (escudo + 18 jogadores + foto da equipe)
- **30 figurinhas FWC** (logos, mascotes, estádios, bola, edição limitada)
- **Bandeiras Twemoji** renderizadas como SVG (compatível com qualquer SO)
- **Sons sintetizados** via Web Audio API (zero assets)
- **Animações** com Framer Motion + confetti em conquistas
- **Atalhos de teclado** + persistência local (`localStorage`)
- **Busca** por código (`BRA-5`, `FWC 12`) e nome de seleção/jogador
- **Trocas**: lista de figurinhas repetidas
- **Pacote**: simulador de abertura de envelope (7 figurinhas)

## 📦 Schema das figurinhas

```js
{
  id: "BRA-5",
  code: "BRA 5",
  prefix: "BRA",
  number: 5,
  group: "teams",   // "fifa" | "teams" | "unknown"
  collection: { owned: 2, duplicates: 1, needed: false }
}
```

## 🚀 Stack

| Camada | Tecnologia |
|---|---|
| Build | Vite 5 |
| UI    | React 18 + Tailwind CSS 3 |
| Animação | Framer Motion 11 |
| Ícones | lucide-react |
| Bandeiras | Twemoji (CDN) |

## 🛠️ Setup

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run preview
```

## 📂 Estrutura

```
album-copa-2026.jsx        # entry / orquestrador
src/
  data/
    album.js               # schema canônico (parseId, buildSticker, ...)
    selecoes.js            # 48 seleções + grupos
    jogadores.js           # plantéis convocados
    especiais.js           # catálogo das 30 FWC
  hooks/
    useColecao.js          # estado + persistência + estatísticas
    useAtalhos.js          # atalhos de teclado
  lib/
    figurinhas.js          # rotuloFigurinha, progressoSelecao, ...
    sfx.js                 # Web Audio (tick, pop, fanfare, ...)
    anims.js               # presets de Framer Motion
  components/
    effects/               # Confetti, HoloCard, Sparkles, AnimatedNumber
    ui/                    # Bandeira, KpiCard, Toasts, SFXToggle, ...
    modals/                # ModalPacote, ModalQuickAdd, ModalConfig, ModalAtalhos
    Header, Tabs, FAB, Dashboard, ListaSelecoes, DetalhesSelecao,
    SecaoEspeciais, Estatisticas, Busca, Trocas, FigurinhaCard, Celula
  styles/
    tailwind.css           # @tailwind base/components/utilities
    globals.css            # fontes, classes utilitárias premium
```

## ⌨️ Atalhos

| Tecla | Ação |
|---|---|
| `1`–`5` | Trocar de aba |
| `/` | Focar busca |
| `P` | Abrir pacote |
| `Q` | Quick add |
| `M` | Mute/unmute SFX |
| `?` | Mostrar atalhos |

## 📄 Licença

MIT
