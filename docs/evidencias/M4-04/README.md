# M4-04 · Acessibilidade: teclado, leitor de tela e contraste

## O resumo

Auditoria com axe-core em **15 telas** (11 rotas alcançáveis sem sessão + 4
telas com sessão, renderizadas com props fixas). Saiu de **17 violações para
zero**. Todas eram de contraste; nenhuma de estrutura — rótulo, landmark e nome
acessível já estavam certos desde o M1.

| Antes | Depois |
|---|---|
| `01-antes-entrar.png` | `02-depois-entrar.png` |
| `03-antes-execucao.png` | `04-depois-execucao.png` |
| — | `05-depois-telas.png` (home, histórico, progresso, painel) |

Na execução, compare a linha da série **4**: era `#4a4a4a` sobre preto (2.23),
praticamente invisível. É o número da série e o "—" do que ainda falta.

## O que mudou de cor, e por quê

| Token | Era | É | O que reprovava |
|---|---|---|---|
| `brand` / `danger` | `#ff2a2a` | `#cf2222` | branco em cima: 3.73 |
| `brand-on-dark` (novo) | — | `#ff2a2a` | o vivo continua sendo a marca no tema escuro |
| `ink-3` / `ink-4` / `ink-5` | `#6e6e69` / `#84847f` / `#9a9a95` | `#5e5e59` / `#666661` / `#6b6b66` | até 2.57 sobre o canvas |
| `dark-muted` | `#4a4a4a` | `#8a8a8a` | 2.23 na execução |
| `success` | `#1f9d57` | `#15803d` | 3.49 com o branco do selo |
| `success-soft` (novo) | — | `#edf7f1` | ver abaixo |
| `warning` | `#c79a13` | `#8a6708` | 2.42 sobre o próprio fundo |

**Um vermelho não serve aos dois temas.** Escuro sobre preto reprova (3.68),
vivo sobre branco reprova (3.74). São dois papéis, e agora são dois tokens.

**`bg-X/15 text-X` reprova sempre.** A cor diluída em cima de si mesma estaciona
em torno de 4.1 — vale para verde, vermelho e âmbar. Fundo claro precisa ser
token próprio (`brand-soft` já era; `success-soft` passou a ser).

## O que a auditoria automática não pegou

Duas coisas, e as duas eram reais:

1. **`dark-muted` sobre fundo transparente.** O axe não resolve a cor de fundo
   através do elemento pai e marca como "incompleto" em silêncio. Quem pegou foi
   a conta de contraste feita token a token, fora do navegador.
2. **Alvo de toque.** Três abaixo de 44px no app do aluno — o link "← Treinos"
   tinha **14px de altura**, um terço do mínimo, num app operado de pé com a mão
   suada. Eram cinco cópias do mesmo link escrito à mão; viraram um componente
   (`components/aluno/link-de-voltar.tsx`), para a sexta não nascer errada.

## Conferido no navegador, não suposto

- **Teclado:** 24 elementos percorridos no app do aluno e no painel. **Zero sem
  indicador de foco.** Todo alvo ≥44px, menos um link do painel (24px — atende o
  mínimo de 24px do WCAG 2.2, e o critério de 44px do card é do app do aluno).
- **Diálogo:** foco entra no painel, Esc fecha, e o foco **volta** ao botão que
  abriu. O `<dialog>` nativo entrega isso; o que faltava era id gerado em vez de
  fixo e o `aria-describedby`.
- **Movimento reduzido:** com `prefers-reduced-motion: reduce`, a duração de
  transição medida no botão cai para `0.001s`.
- **Gráfico de progresso:** não regrediu. O `<title>` lido pelo leitor de tela é
  *"Supino reto com barra: de 55 kg a 62,5 kg em 3 treinos, alta de 7,5 kg."*
- **Nomes acessíveis na execução:** todos os 21 controles têm nome, incluindo
  *"Corrigir série 1: 50 kg, 10 repetições"*. Nenhum controle anônimo.

## O que continua faltando — precisa do Otávio

**Teste com leitor de tela de verdade (VoiceOver no iOS).** Não dá para fazer
neste ambiente: não há iPhone, e emular VoiceOver não é testá-lo. É o critério
que o card marca como obrigatório, e o único que fica aberto.

O roteiro está em `docs/plan/M4-04-roteiro-voiceover.md`.
