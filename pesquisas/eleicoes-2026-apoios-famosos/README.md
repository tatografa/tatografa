# Famosos com voto declarado em Lula ou Flávio Bolsonaro — Eleições 2026

Varredura feita em **18/10/2026**, a uma semana do 2º turno (25/10/2026) entre Lula (PT) e Flávio Bolsonaro (PL). No 1º turno (04/10), Flávio teve 47,03% dos votos válidos e Lula, 45,16%.

**Filtro pedido:** só entram pessoas com mais de 100 mil seguidores no Instagram, **ou** 50 mil no X, **ou** 100 mil no TikTok.

A versão em planilha está em [`apoios.csv`](apoios.csv).

## Página e banco de dados

- **Página com filtros:** https://claude.ai/artifact/YD6LcXzNHjjrcHi8yYAbsv (fonte em `pagina/modelo.html`; `pagina/index.html` é gerado com os dados embutidos).
- **Supabase:** projeto `eleicoes2026` (organização REP, região São Paulo), API em `https://goikjqylhgsmrokfsxli.supabase.co`.
  - `public.apoios`: os 163 nomes, com candidato, categoria, forma da declaração, faixa de seguidores, confiança e fontes (`jsonb`).
  - `public.checagens`: boatos, vídeos falsos e quem não declarou.
  - `public.resumo_apoios`: view com a contagem por candidato, confiança e categoria.
  - Leitura pública (RLS com `select` para `anon`). Escrita só pelo painel ou pela service role.
- **Esquema:** `supabase/migrations/20261018140000_apoios.sql`. **Dados:** `supabase/seed.sql`.

**Para atualizar:** edite as tabelas deste README e rode `python3 scripts/gerar.py`. O script regenera `apoios.csv`, `supabase/seed.sql` e `pagina/index.html`. Depois aplique o `seed.sql` no Supabase (SQL Editor do painel ou `supabase db execute`) e republique a página.

## Como ler esta lista

**Confiança da declaração**

| Nível | Significado |
|---|---|
| **Confirmado** | Há reportagem ou registro específico da pessoa declarando voto ou apoio (vídeo, post, fala em show, ato ou vídeo de campanha). |
| **Lista** | Aparece em listas de veículos ou do agregador Quem Apoia Quem, mas não achei a reportagem específica da declaração. |
| **Indireto** | Gesto ou aparição (fazer o "22", foto com o candidato, defesa pública) sem declaração explícita de voto. Fica fora da contagem principal. |

**Seguidores:** não consegui abrir os perfis em tempo real, porque a rede deste ambiente bloqueia Instagram, X e TikTok. A coluna "Seguidores" usa:
- números publicados por alguma fonte, quando havia;
- "milhões" para nomes de alcance nacional notório, que passam do corte com folga;
- "≥100 mil (estimado)" quando é muito provável, mas não foi conferido;
- "a verificar" quando não sei se passa do corte.

**Fora da lista:** políticos com mandato ou candidatos (Ratinho Jr., Zema, Caiado, Romário, Mário Frias, Nikolas Ferreira, Erika Hilton etc.) e estrangeiros, que não votam no Brasil (estes ficam numa nota à parte).

## Resumo

| | Lula | Flávio |
|---|---|---|
| Confirmados nesta varredura | 82 | 22 |
| Só em listas | 32 | 13 |
| Sinais indiretos (fora da contagem) | — | 14 |

Para comparação, o agregador **Quem Apoia Quem** (quemapoiaquem.com.br) contava cerca de **429 nomes por Lula e 225 por Flávio** (1.052 perfis mapeados), sem políticos. Esta varredura cobre os nomes com repercussão na imprensa, não a base inteira do agregador. Pelo recorte do agregador, Lula lidera com folga em música (93 a 16) e entre atores (71 a 9). Flávio fica à frente no esporte (20 a 13). Entre influenciadores a diferença é menor (148 a 102), e entre streamers fica quase empatada (18 a 17).

---

## LULA (PT)

### Música

| Nome | Como/quando declarou | Seguidores | Confiança | Fonte |
|---|---|---|---|---|
| Anitta | Vídeo no Instagram (09/10) declarando voto no 2º turno | milhões | Confirmado | [Brasil de Fato](https://www.brasildefato.com.br/2026/10/09/e-13-anitta-declara-voto-em-lula-e-diz-que-bolsonarismo-vive-de-odio/) |
| Ivete Sangalo | Fez o "L" em show no Mineirinho/BH (19/09); pediu voto com "lucidez" em Fortaleza (10/10) | milhões | Confirmado | [O Povo](https://www.opovo.com.br/vidaearte/2026/10/10/ivete-sangalo-pede-voto-lucido-aos-fas-durante-show-em-fortaleza.html) |
| Caetano Veloso | Declarou voto em show em Taguatinga (13/09); camisa "Bora Lula"; foto com camisa da Seleção (17/10) | milhões | Confirmado | [Poder360](https://www.poder360.com.br/poder-governo/caetano-veloso-declara-novamente-apoio-a-lula-para-presidente) |
| Maria Bethânia | Fez o "L" e declarou voto em show em SP (12/09) | ≥100 mil (estimado) | Confirmado | [A Tarde](https://atarde.com.br/entretenimento/maria-bethania-revela-voto-para-presidente-durante-show-1401879) |
| Gilberto Gil | Vídeo "Bora Lula" (342 Artes, 17/09) | milhões | Confirmado | [Estado de Minas](https://www.em.com.br/politica/2026/09/7503534-alem-de-malu-mader-veja-outros-artistas-que-apoiam-lula-nas-eleicoes-2026.html) |
| Chico Buarque | Vídeo pedindo voto; ato "Cultura com Lula" (23/09); camisa da Seleção (17/10) | ≥100 mil (estimado) | Confirmado | [Poder360](https://www.poder360.com.br/poder-eleicoes-2026/mais-de-50-artistas-estiveram-em-ato-com-lula-no-rio-veja-quem-foi/) |
| Zeca Pagodinho | Discurso no ato "Cultura com Lula" (23/09): "todo mundo é Lula" | milhões | Confirmado | [Estado de Minas](https://www.em.com.br/politica/2026/09/7507442-zeca-pagodinho-eu-minha-familia-meus-amigos-todo-mundo-e-lula.html) |
| Djavan | Declarou voto (26/09) | milhões | Confirmado | [Tribuna do Sertão](https://tribunadosertao.com.br/politica/2026/09/26/986015-djavan-declara-voto-em-lula-pela-democracia-e-por-justica-social) |
| Luísa Sonza | Show em Londrina ("Dia 4 não esqueçam, é Lula"); depois "dia 25 é 13" | milhões | Confirmado | [Poder360](https://www.poder360.com.br/poder-eleicoes-2026/luisa-sonza-declara-apoio-a-lula-durante-show-em-londrina/) |
| Gloria Groove | Post explicando voto "Lula 13" no 2º turno | milhões | Confirmado | [Papelpop](https://www.papelpop.com/2026/10/eleicoes-2026-gloria-groove-declara-voto-em-lula-no-2o-turno-e-destaca-impacto-de-politicas-publicas-na-propria-vida/) |
| Ludmilla | Fez o "L" com camisa da Seleção (17/10) | milhões | Confirmado | [DCM](https://www.diariodocentrodomundo.com.br/ludmilla-faz-l-resgate-camisa-selecao-lula) |
| Pabllo Vittar | Mobilização com camisa da Seleção e "L" (17/10) | milhões | Confirmado | [Pipoca Moderna](https://pipocamoderna.com.br/2026/10/famosos-camisa-selecao-lula-2/) |
| Xamã | Cantou em ato na Fundição Progresso (23/09): "Não existe rap de direita" | milhões | Confirmado | [Poder360](https://www.poder360.com.br/poder-eleicoes-2026/xama-canta-musica-em-apoio-a-lula-e-faz-post-nao-existe-rap-de-direita/) |
| BK | Foi a ato no Rio (07/10) e declarou voto | milhões | Confirmado | [Papelpop](https://www.papelpop.com/2026/10/eleicoes-2026-bk-vai-as-ruas-em-apoio-a-lula-e-cobra-posicionamento-do-rap-nacional-colando-do-lado-certo/) |
| Marina Sena | Declarou voto (06/10) e comparou os projetos | milhões | Confirmado | [Quem Apoia Quem](https://quemapoiaquem.com.br/p/marina-sena) |
| Pitty | Declarou voto (07/10) | milhões | Confirmado | [Quem Apoia Quem](https://quemapoiaquem.com.br/p/pitty) |
| Daniela Mercury | Ato de 23/09 e camisa da Seleção (17/10) | milhões | Confirmado | [Poder360](https://www.poder360.com.br/poder-eleicoes-2026/mais-de-50-artistas-estiveram-em-ato-com-lula-no-rio-veja-quem-foi/) |
| Diogo Nogueira | Camisa da Seleção e "L" (17/10) | milhões | Confirmado | [Estado do Pará Online](https://estadodoparaonline.com/artistas-e-famosos-aderem-a-mobilizacao-pro-lula-com-camisa-da-selecao-e-gesto-de-l/) |
| Alceu Valença | Camisa da Seleção e "L" (17/10) | ≥100 mil (estimado) | Confirmado | [Estado do Pará Online](https://estadodoparaonline.com/artistas-e-famosos-aderem-a-mobilizacao-pro-lula-com-camisa-da-selecao-e-gesto-de-l/) |
| Marina Lima | Camisa da Seleção e "L" (17/10) | ≥100 mil (estimado) | Confirmado | [Estado do Pará Online](https://estadodoparaonline.com/artistas-e-famosos-aderem-a-mobilizacao-pro-lula-com-camisa-da-selecao-e-gesto-de-l/) |
| Lenine | Presente no ato de campanha (23/09). O Povo nota que não fez nova declaração explícita | ≥100 mil (estimado) | Confirmado (ato) | [Poder360](https://www.poder360.com.br/poder-eleicoes-2026/mais-de-50-artistas-estiveram-em-ato-com-lula-no-rio-veja-quem-foi/) |
| Paulinho da Viola | Vídeo "Bora Lula" + ato (23/09) | ≥100 mil (estimado) | Confirmado | [Estado de Minas](https://www.em.com.br/politica/2026/09/7503534-alem-de-malu-mader-veja-outros-artistas-que-apoiam-lula-nas-eleicoes-2026.html) |
| Zélia Duncan | Vídeo "Bora Lula" + ato (23/09) | ≥100 mil (estimado) | Confirmado | [Estado de Minas](https://www.em.com.br/politica/2026/09/7503534-alem-de-malu-mader-veja-outros-artistas-que-apoiam-lula-nas-eleicoes-2026.html) |
| Fernanda Abreu | Vídeo "Bora Lula" + ato (23/09) | ≥100 mil (estimado) | Confirmado | [Estado de Minas](https://www.em.com.br/politica/2026/09/7503534-alem-de-malu-mader-veja-outros-artistas-que-apoiam-lula-nas-eleicoes-2026.html) |
| Chico César | Ato (23/09) | ≥100 mil (estimado) | Confirmado | [Poder360](https://www.poder360.com.br/poder-eleicoes-2026/mais-de-50-artistas-estiveram-em-ato-com-lula-no-rio-veja-quem-foi/) |
| Tati Quebra Barraco | Ato (23/09) | milhões | Confirmado | [Poder360](https://www.poder360.com.br/poder-eleicoes-2026/mais-de-50-artistas-estiveram-em-ato-com-lula-no-rio-veja-quem-foi/) |
| Duda Beat | Vídeo "Bora Lula" (17/09) | milhões | Confirmado | [Estado de Minas](https://www.em.com.br/politica/2026/09/7503534-alem-de-malu-mader-veja-outros-artistas-que-apoiam-lula-nas-eleicoes-2026.html) |
| Jota.Pê | Vídeo "Bora Lula" (17/09) | ≥100 mil (estimado) | Confirmado | [Estado de Minas](https://www.em.com.br/politica/2026/09/7503534-alem-de-malu-mader-veja-outros-artistas-que-apoiam-lula-nas-eleicoes-2026.html) |
| Tony Bellotto | Vídeo "Bora Lula"; caminhada em Copacabana (13/09) | ≥100 mil (estimado) | Confirmado | [Vila de Utopia](https://viladeutopia.com.br/artistas-impulsionam-a-campanha-bora-lula-e-levam-apoio-dos-palcos-as-redes/) |
| Alinne Rosa | Post no Instagram (14/10) | ≥100 mil (estimado) | Confirmado | [Quem Apoia Quem](https://quemapoiaquem.com.br/) |
| Jão | Vídeo declarando voto | milhões | Lista | [Polêmica Paraíba](https://www.polemicaparaiba.com.br/brasil/2o-turno-mais-de-100-influenciadores-cantores-atores-e-atletas-se-posicionam-a-favor-de-lula/) |
| Liniker | Post entre 05 e 11/10 | milhões | Lista | idem |
| MC Hariel | Post entre 05 e 11/10 | milhões | Lista | idem |
| Marisa Monte | Post entre 05 e 11/10 | milhões | Lista | idem |
| Baco Exu do Blues | Post entre 05 e 11/10 | milhões | Lista | idem; [A Tarde](https://atarde.com.br/entretenimento/lula-ou-flavio-saiba-em-quem-os-famosos-votam-em-2026-1404453) |
| Filipe Ret | Citado como apoiador | milhões | Lista | [A Tarde](https://atarde.com.br/entretenimento/lula-ou-flavio-saiba-em-quem-os-famosos-votam-em-2026-1404453) |
| Emicida | Citado na seção de rappers pró-Lula | milhões | Lista | [Rap Dab](https://www.rapdab.com.br/2026/10/03/rappers-brasileiros-declaram-votos-eleicoes-2026/) |
| Djonga | Citado na seção de rappers pró-Lula | milhões | Lista | [Rap Dab](https://www.rapdab.com.br/2026/10/03/rappers-brasileiros-declaram-votos-eleicoes-2026/) |
| L7nnon | Citado em reportagens sobre o rap no 2º turno | milhões | Lista | [O Povo](https://www.opovo.com.br/noticias/politica/eleicoes/2026/10/16/lula-e-flavio-no-2-turno-quais-famosos-declararam-veja-lista.html) |
| Kleber Lucas (gospel) | Ligado à Frente de Evangélicos pelo Estado de Direito, que apoia Lula | ≥100 mil (estimado) | Lista | [Gazeta do Povo](https://www.gazetadopovo.com.br/eleicoes/2026/saiba-quais-personalidades-declararam-voto-flavio-e-lula/) |
| Iza | Só aparece em lista. Não achei declaração em 2026 | milhões | Lista | [Ativa Notícias](https://www.ativanoticias.com.br/noticia/eleicoes-2026-saiba-quais-famosos-apoiam-lula-e-flavio-bolsonaro) |

### Atores, atrizes e audiovisual

| Nome | Como/quando declarou | Seguidores | Confiança | Fonte |
|---|---|---|---|---|
| Wagner Moura | Vídeo no Instagram; chamou possível vitória de Flávio de "tragédia" | milhões | Confirmado | [A Tarde](https://atarde.com.br/politica/uma-tragedia-declara-wagner-moura-a-possivel-vitoria-de-flavio-1405270) |
| Paolla Oliveira | Declarou voto no 2º turno e expôs ataques (14 e 15/10) | milhões | Confirmado | [DGABC](https://www.dgabc.com.br/Noticia/4352859/paolla-oliveira-expoe-ataques-nas-redes-apos-declarar-voto-e-recebe-apoio-de-famosos) |
| Bruna Marquezine | Stories para eleitores de Augusto Cury pedindo voto em Lula | milhões | Confirmado | [Itatiaia](https://www.itatiaia.com.br/entretenimento/bruna-marquezine-declara-voto-para-o-2o-turno-e-alerta-seguidores/) |
| Taís Araújo | Vídeo nas redes (16/10) | milhões | Confirmado | [Correio Braziliense](https://tvprime.correiobraziliense.com.br/noticia/409440/celebridades/tais-araujo-abre-o-coracao-e-diz-se-vai-votar-em-lula-ou-em-flavio-bolsonaro-e-por-isso-que-16102026) |
| Malu Mader | Vídeo "Bora Lula", ato (23/09) e caminhada em Copacabana | milhões | Confirmado | [Estado de Minas](https://www.em.com.br/politica/2026/09/7503534-alem-de-malu-mader-veja-outros-artistas-que-apoiam-lula-nas-eleicoes-2026.html) |
| Cláudia Abreu | Caminhada em Copacabana (13/09); camisa da Seleção (17/10) | milhões | Confirmado | [Vila de Utopia](https://viladeutopia.com.br/artistas-impulsionam-a-campanha-bora-lula-e-levam-apoio-dos-palcos-as-redes/) |
| Sophie Charlotte | Vídeo "Bora Lula"; camisa da Seleção (17/10) | milhões | Confirmado | [Pipoca Moderna](https://pipocamoderna.com.br/2026/10/famosos-camisa-selecao-lula-2/) |
| Débora Bloch | Camisa da Seleção e "L" (17/10) | milhões | Confirmado | [Vírgula](https://virgula.me/famosos/artistas-se-juntam-a-movimento-e-declaram-voto-em-lula-nas-eleicoes/) |
| Marjorie Estiano | Camisa da Seleção e "L" (17/10) | milhões | Confirmado | [Vírgula](https://virgula.me/famosos/artistas-se-juntam-a-movimento-e-declaram-voto-em-lula-nas-eleicoes/) |
| Gloria Pires | Camisa da Seleção (17/10); signatária de manifesto | milhões | Confirmado | [Estado do Pará Online](https://estadodoparaonline.com/artistas-e-famosos-aderem-a-mobilizacao-pro-lula-com-camisa-da-selecao-e-gesto-de-l/) |
| Débora Falabella | Camisa da Seleção (17/10) | milhões | Confirmado | idem |
| Camila Pitanga | Camisa da Seleção (17/10) | milhões | Confirmado | idem |
| Renata Sorrah | Camisa da Seleção (17/10) | ≥100 mil (estimado) | Confirmado | idem |
| Reynaldo Gianecchini | Camisa da Seleção (17/10) | milhões | Confirmado | idem |
| Rafa Vitti | Camisa da Seleção (17/10) | milhões | Confirmado | [Pipoca Moderna](https://pipocamoderna.com.br/2026/10/famosos-camisa-selecao-lula-2/) |
| Carmo Dalla Vecchia | Camisa da Seleção (17/10) | milhões | Confirmado | [Estado do Pará Online](https://estadodoparaonline.com/artistas-e-famosos-aderem-a-mobilizacao-pro-lula-com-camisa-da-selecao-e-gesto-de-l/) |
| Alessandra Negrini | Camisa da Seleção (17/10) | milhões | Confirmado | idem |
| Giovanna Antonelli | Camisa da Seleção (17/10) | milhões | Confirmado | [Pipoca Moderna](https://pipocamoderna.com.br/2026/10/famosos-camisa-selecao-lula-2/) |
| Klara Castanho | Camisa da Seleção (17/10) | milhões | Confirmado | idem |
| Alanis Guillen | Camisa da Seleção (17/10) | milhões | Confirmado | idem |
| Sonia Braga | Camisa da Seleção (17/10) | ≥100 mil (estimado) | Confirmado | [Vírgula](https://virgula.me/famosos/artistas-se-juntam-a-movimento-e-declaram-voto-em-lula-nas-eleicoes/) |
| Marieta Severo | Ato (23/09) | ≥100 mil (estimado) | Confirmado | [Poder360](https://www.poder360.com.br/poder-eleicoes-2026/mais-de-50-artistas-estiveram-em-ato-com-lula-no-rio-veja-quem-foi/) |
| Humberto Carrão | Ato (23/09) | milhões | Confirmado | idem |
| Caio Blat | Ato (23/09); manifesto | milhões | Confirmado | idem |
| Drica Moraes | Post no Instagram (14/10) | ≥100 mil (estimado) | Confirmado | [Quem Apoia Quem](https://quemapoiaquem.com.br/) |
| Maria Flor | Vídeo "Bora Lula" (17/09) | ≥100 mil (estimado) | Confirmado | [Estado de Minas](https://www.em.com.br/politica/2026/09/7503534-alem-de-malu-mader-veja-outros-artistas-que-apoiam-lula-nas-eleicoes-2026.html) |
| Leona Cavalli | Vídeo "Bora Lula" (17/09) | ≥100 mil (estimado) | Confirmado | idem |
| Betty Gofman | Vídeo "Bora Lula"; caminhada em Copacabana | ≥100 mil (estimado) | Confirmado | idem |
| Paula Burlamaqui | Vídeo "Bora Lula" (17/09) | ≥100 mil (estimado) | Confirmado | idem |
| Giovanna Nader | Vídeo "Bora Lula" (17/09) | ≥100 mil (estimado) | Confirmado | idem |
| Enrique Díaz | Vídeo "Bora Lula" (17/09) | a verificar | Confirmado | idem |
| Kleber Mendonça Filho (cineasta) | Camisa da Seleção (17/10) | a verificar | Confirmado | [Estado do Pará Online](https://estadodoparaonline.com/artistas-e-famosos-aderem-a-mobilizacao-pro-lula-com-camisa-da-selecao-e-gesto-de-l/) |
| Fernanda Montenegro | Lista de mais de 100 nomes do audiovisual | milhões | Lista | [Mídia NINJA](https://midianinja.org/mais-de-100-artistas-do-audiovisual-brasileiro-declaram-apoio-a-lula-no-2o-turno/) |
| Fernanda Torres | idem | milhões | Lista | idem |
| Maisa | Post entre 05 e 11/10 | milhões | Lista | [Polêmica Paraíba](https://www.polemicaparaiba.com.br/brasil/2o-turno-mais-de-100-influenciadores-cantores-atores-e-atletas-se-posicionam-a-favor-de-lula/) |
| Isis Valverde | Post entre 05 e 11/10 | milhões | Lista | idem |
| Manu Gavassi | Post entre 05 e 11/10 | milhões | Lista | idem |
| Chay Suede | Citado em lista | milhões | Lista | [Ativa Notícias](https://www.ativanoticias.com.br/noticia/eleicoes-2026-saiba-quais-famosos-apoiam-lula-e-flavio-bolsonaro) |
| Leticia Colin | Citada em lista | milhões | Lista | idem |
| João Guilherme | Citado em lista | milhões | Lista | idem |
| Mel Maia | Citada em lista | milhões | Lista | [A Tarde](https://atarde.com.br/entretenimento/lula-ou-flavio-saiba-em-quem-os-famosos-votam-em-2026-1404453) |
| Cláudia Raia | Citada como apoiadora no 2º turno | milhões | Lista | [Itatiaia](https://www.itatiaia.com.br/entretenimento/bruna-marquezine-declara-voto-para-o-2o-turno-e-alerta-seguidores/) |
| Adriana Esteves | Citada como tendo declarado voto | milhões | Lista | [Gazeta do Povo](https://www.gazetadopovo.com.br/eleicoes/2026/saiba-quais-personalidades-declararam-voto-flavio-e-lula/) |
| Bella Campos | "Atriz cuiabana da Globo declara voto em Lula" (17/10) | milhões | Lista | [Muvuca Popular](https://www.muvucapopular.com.br/2026/10/17/atriz-da-globo-cuiabana-declara-voto-em-lula/) |
| José de Abreu | Citado em lista | ≥50 mil no X (estimado) | Lista | [Liga da Notícia](https://ligadanoticia.com.br/politica/saiba-quais-artistas-e-influenciadores-apoiam-os-candidatos-a-presidencia/) |
| Herson Capri | Citado em lista | a verificar | Lista | idem |

### Influenciadores, TV e ex-BBBs

| Nome | Como/quando declarou | Seguidores | Confiança | Fonte |
|---|---|---|---|---|
| Ana Paula Renault (BBB 26) | Vídeo declarando voto (08/10) | milhões | Confirmado | [Pipoca Moderna](https://pipocamoderna.com.br/2026/10/ex-bbbs-votos-lula-flavio/) |
| Alane Dias (BBB 24) | Declarou apoio e relatou ataques | milhões | Confirmado | idem |
| Milena Lages, a "Tia Milena" (BBB 26) | Ex-eleitora de Bolsonaro, declarou voto em Lula (17/10) | milhões (estimado) | Confirmado | [Pipoca Moderna](https://pipocamoderna.com.br/2026/10/tia-milena-troca-bolsonaro-lula/) |
| Juliano Floss (BBB 26) | Post a favor da campanha | milhões | Confirmado | [Pipoca Moderna](https://pipocamoderna.com.br/2026/10/ex-bbbs-votos-lula-flavio/) |
| Andressa Urach | Ex-bolsonarista, vídeo declarando voto (07/10) | milhões | Confirmado | [O Liberal](https://www.oliberal.com/variedades/andressa-urach-abandona-o-bolsonarismo-e-declara-voto-em-lula-no-2-turno-1.1179678) |
| Brino (streamer) | Live (06/10). TikTok 11 mi, Instagram 9,5 mi | 11 mi no TikTok | Confirmado | [Revista Fórum](https://revistaforum.com.br/revista-forum/brino-apoio-lula/) |
| Belle Daltro | Stories (06/10), citando o Bolsa Família | 3,8 mi no TikTok | Confirmado | [Quem Apoia Quem](https://quemapoiaquem.com.br/p/belle-daltro) |
| Thomas Santana | Declarou apoio | 4,8 mi no TikTok | Confirmado | [Quem Apoia Quem](https://quemapoiaquem.com.br/p/thomas-santana) |
| Mítico (PodPah) | Declarou voto e pediu voto (08/10) | milhões | Confirmado | [Quem Apoia Quem](https://quemapoiaquem.com.br/p/mitico) |
| Edu (Diva Depressão) | Vídeo pedindo voto (06/10) | ≥100 mil (estimado) | Confirmado | [Quem Apoia Quem](https://quemapoiaquem.com.br/p/edu-diva-depressao) |
| Fernanda Concon | Votou em Lula no 1º turno e vai repetir | ≥100 mil (estimado) | Confirmado | [Quem Apoia Quem](https://quemapoiaquem.com.br/p/fernanda-concon) |
| Déa Lúcia (mãe de Paulo Gustavo) | "Flávio é retrocesso", apoio a Lula | ≥100 mil (estimado) | Confirmado | [BNC Amazonas](https://bncamazonas.com.br/ta_na_midia/flavio-e-retrocesso-diz-mae-de-paulo-gustavo-ao-declarar-apoio-a-lula/) |
| Craque Neto (apresentador) | "Vamos reeleger o barba" (out/2025, antes da campanha) | milhões | Confirmado (2025) | [Correio Braziliense](https://www.correiobraziliense.com.br/politica/2025/10/7274706-craque-neto-declara-apoio-a-lula-em-2026-vamos-reeleger-o-barba.html) |
| Nath Finanças | Carta de criadores de apoio a Lula (27/09) | milhões | Confirmado | [Poder360](https://www.poder360.com.br/poder-eleicoes-2026/criadores-de-conteudo-apoiam-lula-e-cobram-regulacao-de-plataformas/) |
| Rita Von Hunty | idem | ≥100 mil (estimado) | Confirmado | idem |
| Camila Fremder | idem | ≥100 mil (estimado) | Confirmado | idem |
| Sabrina Fernandes | idem | ≥100 mil (estimado) | Confirmado | idem |
| Laura Sabino | idem | a verificar | Confirmado | idem |
| Doarda | Post entre 05 e 11/10 | ≥100 mil no TikTok (estimado) | Lista | [Polêmica Paraíba](https://www.polemicaparaiba.com.br/brasil/2o-turno-mais-de-100-influenciadores-cantores-atores-e-atletas-se-posicionam-a-favor-de-lula/) |
| Caick Ciclopin | Post entre 05 e 11/10 | ≥100 mil no TikTok (estimado) | Lista | idem |
| Maya Massafera | Post entre 05 e 11/10 | ≥100 mil (estimado) | Lista | idem |
| Sofia Santino | Citada em lista | ≥100 mil (estimado) | Lista | [O Povo](https://www.opovo.com.br/noticias/politica/eleicoes/2026/10/16/lula-e-flavio-no-2-turno-quais-famosos-declararam-veja-lista.html) |
| Victor Han | Citado em lista | a verificar | Lista | idem |

### Esporte

| Nome | Como/quando declarou | Seguidores | Confiança | Fonte |
|---|---|---|---|---|
| Paulinho (Palmeiras) | Post nas redes (03/10): "desde sempre" | milhões | Confirmado | [Itatiaia](https://www.itatiaia.com.br/esportes/futebol/futebol-nacional/futebol-paulista/palmeiras/atacante-do-palmeiras-paulinho-declara-voto-para-presidente-desde-sempre/) |
| Raí | Camisa da Seleção e "L" (17/10) | ≥100 mil (estimado) | Confirmado | [Estado do Pará Online](https://estadodoparaonline.com/artistas-e-famosos-aderem-a-mobilizacao-pro-lula-com-camisa-da-selecao-e-gesto-de-l/) |
| Dinei (ex-Corinthians) | Citado como tendo declarado voto no 2º turno | a verificar | Lista | [A Tarde](https://atarde.com.br/esportes/futebol/veja-os-jogadores-e-ex-jogadores-que-declararam-voto-nesta-eleicao-1404521) |
| Tifanny Abreu (vôlei) | "No dia 25 é 13" | ≥100 mil (estimado) | Lista | busca em portais esportivos (não localizei o link original) |

---

## FLÁVIO BOLSONARO (PL)

### Confirmados

| Nome | Área | Como/quando declarou | Seguidores | Fonte |
|---|---|---|---|---|
| Neymar | Futebol | Vídeo após votar (04/10) fazendo o "22" com as mãos; imprensa registra declaração de voto | milhões | [A Tarde](https://atarde.com.br/esportes/futebol/neymar-segue-posicionamento-e-declara-voto-em-flavio-bolsonaro-1404527) |
| Daniel Alves | Futebol | Vídeo no Instagram (05/10): "o Espírito Santo soprou teu nome" | milhões | [Congresso em Foco](https://www.congressoemfoco.com.br/noticia/123019/daniel-alves-declara-apoio-a-flavio-bolsonaro-e-afirma-obedecer-a-deus) |
| Ratinho (Carlos Massa, SBT) | Apresentador | Vídeo com Flávio (16/10), horário eleitoral (17/10) e ato na Paulista (18/10) | milhões | [Poder360](https://www.poder360.com.br/poder-eleicoes-2026/ratinho-faz-propaganda-eleitoral-com-flavio-assista/) / [Área VIP](https://www.areavip.com.br/famosos/ratinho-declara-voto-em-flavio-bolsonaro-e-confirma-que-estara-em-ato-na-av-paulista/) |
| Amado Batista | Sertanejo | Vídeo após receber Flávio na fazenda (GO, julho) | milhões | [Poder360](https://www.poder360.com.br/poder-eleicoes-2026/flavio-tem-apoio-discreto-no-meio-artistico-na-disputa-de-2026/) |
| Leonardo | Sertanejo | Declarou voto em show ("não pode ficar em cima do muro") e disse "Alô, Flávio". Um vídeo de IA o mostra votando em Lula: é falso | milhões | [Área VIP](https://areavip.com.br/famosos/leonardo-declara-voto-durante-show-o-ser-humano-nao-pode-ficar-em-cima-do-muro-nao) |
| Jojo Todynho | Cantora/influenciadora | Declarou apoio e se disse "de direita e anti-PT" (início de outubro) | milhões | [O Povo](https://www.opovo.com.br/noticias/politica/eleicoes/2026/10/16/lula-e-flavio-no-2-turno-quais-famosos-declararam-veja-lista.html) |
| Pablo Marçal | Empresário/influenciador | Declarou apoio (29/09) e passou a integrar a campanha | milhões | [Gazeta do Povo](https://www.gazetadopovo.com.br/eleicoes/2026/saiba-quais-personalidades-declararam-voto-flavio-e-lula/) |
| Penélope Nova | Apresentadora (ex-MTV) | Foto com legenda "P de presidente"; ato na Paulista (07/09) | ≥100 mil (estimado) | [Poder360](https://www.poder360.com.br/poder-eleicoes-2026/flavio-tem-apoio-discreto-no-meio-artistico-na-disputa-de-2026/) |
| Victor Fasano | Ator | Declarou voto nas redes (outubro) | ≥100 mil (estimado) | [Estado de Minas](https://www.em.com.br/cultura/2026/10/7513750-victor-fasano-declara-voto-em-flavio-e-ganha-curtida-de-gloria-pires.html) |
| Fabiana Justus | Influenciadora | Declarou voto, dizendo que o Brasil "está de cabeça pra baixo" | milhões | [Terra](https://www.terra.com.br/diversao/gente/fabiana-justus-diz-que-brasil-esta-de-cabeca-pra-baixo-ao-declarar-voto-em-flavio-bolsonaro-nas-eleicoes-2026-filha-de-roberto-justus-cita-holocausto-em-justificativa-e-divide-opinioes-na-web,67cbeaab74ad311b7cba1d67da52f6d2olz7a794.html) |
| Gabriely Miranda | Influenciadora (esposa de Endrick) | Post "Pátria, família e liberdade" (08/10) | milhões | [Quem Apoia Quem](https://quemapoiaquem.com.br/p/gabriely-miranda) |
| Rico Melquiades | Influenciador | Declarou apoio e foi ao ato na Paulista (18/10) | milhões | [NC News](https://ncnews.com.br/2026/10/18/rico-melquiades-declara-apoio-a-flavio-bolsonaro-e-participa-de-ato-na-paulista/) |
| Luciano Hang | Empresário (Havan) | Post no Instagram com voto no 2º turno | milhões | [Blog do Elias Hacker](https://eliashacker.com.br/noticia/47015/luciano-hang-declara-voto-em-flavio-bolsonaro-no-segundo-turno-das-eleicoes.html) |
| Silas Malafaia | Pastor/televangelista | Declarou voto publicamente | milhões | [Gazeta do Povo](https://www.gazetadopovo.com.br/eleicoes/2026/saiba-quais-personalidades-declararam-voto-flavio-e-lula/) |
| Estevam Hernandes | Apóstolo (Renascer) | Post "Eu voto 22 para presidente" (09/09) | ≥100 mil (estimado) | [Revista Oeste](https://revistaoeste.com/politica/lideres-da-igreja-renascer-confirmam-apoio-a-flavio/) |
| Mônica Salgado | Jornalista/influenciadora | Vídeo de campanha com 16 personalidades (25/09) | ≥100 mil (estimado) | [Gazeta do Povo](https://www.gazetadopovo.com.br/eleicoes/2026/saiba-quais-personalidades-declararam-voto-flavio-e-lula/) |
| Firmino Cortada | Influenciador | Vídeo de campanha (25/09) | a verificar | [AJN1](https://ajn1.com.br/veja-personalidades-que-declararam-abertamente-apoio-a-lula-e-a-flavio-bolsonaro-nas-eleicoes/) |
| Elena Ayala | Influenciadora | Post (05/10): "Vamos tirar o PT e varrer a esquerda" | a verificar | [Quem Apoia Quem](https://quemapoiaquem.com.br/p/elena-ayala) |
| Thiago O'Brien | Influenciador | Declarou apoio (04/10) | a verificar | [Quem Apoia Quem](https://quemapoiaquem.com.br/p/thiago-o-brien) |
| Luly FPS | Streamer | Declarou voto (09/10). Fonte secundária: página no X | 668 mil no TikTok | [Quem Apoia Quem](https://quemapoiaquem.com.br/p/luly-fps) |
| Regina Duarte | Atriz | Post de apoio à candidatura de Flávio (pré-campanha); foto fazendo o "22" (12/10), na legenda diz ter sido "forçada" | ≥100 mil (estimado) | [Tribuna Online](https://tribunaonline.com.br/politica/regina-duarte-diz-que-sonha-com-possivel-candidatura-de-flavio-bolsonaro-281270) |
| Marcus Salles | Cantor gospel | Manchete "declara apoio a Flávio Bolsonaro" | a verificar | [Fuxico Gospel](https://www.fuxicogospel.com.br/politica/irmao-de-otoni-de-paula-declara-voto-em-flavio-bolsonaro-no-segundo-turno/) (citado na página) |

### Só em listas (sem reportagem específica encontrada)

| Nome | Área | Seguidores | Onde aparece |
|---|---|---|---|
| MC Mirella | Funk | milhões | [Ativa Notícias](https://www.ativanoticias.com.br/noticia/eleicoes-2026-saiba-quais-famosos-apoiam-lula-e-flavio-bolsonaro), [Gazeta do Povo](https://www.gazetadopovo.com.br/eleicoes/2026/saiba-quais-personalidades-declararam-voto-flavio-e-lula/) |
| Ana Paula Siebert | Influenciadora | milhões | Gazeta do Povo |
| Durval Lélys | Axé | ≥100 mil (estimado) | Wikipédia, Gazeta do Povo |
| Davi Brito (BBB 24) | Ex-BBB | milhões | só Ativa Notícias |
| Jonas Sulzbach | Ex-BBB | milhões | só Ativa Notícias |
| Conrado e Andréa Sorvetão | TV | ≥100 mil (estimado) | só Ativa Notícias |
| Silvia Abravanel | Apresentadora | ≥100 mil (estimado) | Ativa Notícias. Atenção: no 1º turno ela apoiou Caiado ([Pleno News](https://pleno.news/brasil/eleicoes-2026/silvia-abravanel-diz-que-votou-em-bolsonaro-mas-apoiara-caiado.html)) |
| Falcão | Futsal | milhões | A Tarde: fotos com a camisa da Seleção, "posiciona-se de forma favorável" |
| Fagner | Futebol | milhões | TMC |
| Zig na Voz (Gilberto Fernandes) | Influenciador | a verificar | Gazeta do Povo / CNR: vídeos e eventos do PL |
| Preto de Direita (Danilo M. S. Pereira) | Influenciador | a verificar | idem |
| Kelle Cristina | Influenciadora | a verificar | idem |
| Favelado de Direita (Jonas Cosme) | Influenciador | a verificar | idem |

### Sinais indiretos (sem declaração explícita de voto)

| Nome | O que houve | Seguidores |
|---|---|---|
| Ana Castela | Fez o "22" com Nikolas Ferreira em Barretos; não declarou | milhões |
| Zezé Di Camargo | Gravou vídeo de apoio a Jair Bolsonaro (abril) e foi anunciado no "Bloquinho do 22" (18/10); não declarou voto em Flávio | milhões |
| Netinho | Vídeo pedindo para "mudar o Brasil", sem citar Flávio | ≥100 mil (estimado) |
| Gusttavo Lima | Listado na Wikipédia, mas disse que "não fala mais de política" | milhões |
| Felipe Melo | Apoios explícitos só em 2018 e 2022 | milhões |
| Rezende e Mau Mau | Classificados como "sinal indireto" pelo Quem Apoia Quem | milhões |
| Wess Guimarães | Sinal indireto (Quem Apoia Quem) | a verificar |
| José Araujo Uai | Foto com o número 22 | a verificar |
| Leomar Segundo ("Segundo Católico") | Defendeu Flávio de fake news sobre Nossa Senhora Aparecida | 1,2 mi no Instagram |
| Padre Fabiano Moura | idem | 774 mil |
| Berthaldo Soares | idem | 174 mil |
| Dedé (ex-Vasco) | Citado como apoiador no 1º turno | a verificar |
| Osvaldo (Vitória) | Postou apoio em ocasiões anteriores, não neste turno | a verificar |
| Ex-BBB Munik Nunes | Posição não confirmada | milhões |

---

## Boatos, vídeos falsos e quem NÃO declarou

| Nome | Situação | Fonte |
|---|---|---|
| Angélica | Vídeo "votando em Lula em 2026" é de 2022, apresentado como recente | [Boatos.org](https://www.boatos.org/entretenimento/angelica-declara-voto-em-lula-no-2o-turno-das-eleicoes-de-2026.html) |
| Virginia Fonseca | Foto do "L" manipulada e vídeo feito com IA | [Boatos.org](https://www.boatos.org/entretenimento/virginia-fonseca-anuncia-voto-em-lula-nas-eleicoes-de-2026.html) |
| Zé Felipe | Vídeo falso de voto em Lula | [Boatos.org](https://www.boatos.org/entretenimento/ze-felipe-anuncia-voto-em-lula-no-2o-turno-das-eleicoes-e-defende-o-nordeste.html) |
| Zico | Vídeo de voto em Lula feito com IA | [Boatos.org](https://www.boatos.org/esporte/zico-anuncia-voto-em-lula-no-segundo-turno-das-eleicoes-de-2026.html) |
| Leonardo (votando em Lula) | Narração manipulada com IA. Na vida real ele declarou Flávio | [Boatos.org](https://www.boatos.org/entretenimento/leonardo-anuncia-que-vai-votar-em-lula-no-2o-turno-das-eleicoes-de-2026.html) |
| Zeca Pagodinho (apoiando Flávio) | Vídeo manipulado por IA. Na vida real ele apoia Lula | [Estado de Minas](https://www.em.com.br/politica/2026/09/7507442-zeca-pagodinho-eu-minha-familia-meus-amigos-todo-mundo-e-lula.html) |
| João Gomes | Não declarou voto, apesar da pressão. Uma manchete sugeriu que sim | [Correio 24 Horas](https://www.correio24horas.com.br/em-alta/qual-e-o-posicionamento-politico-de-joao-gomes-cantor-foi-atacado-apos-criticar-candidato-em-2022-e-agora-se-recusa-a-falar-sobre-eleicoes-1026) |
| Juliette | Narrou vídeo contra Flávio sobre Nossa Senhora Aparecida (12/10), mas não declarou voto explicitamente | [Bem Paraná](https://www.bemparana.com.br/televisao-gente/em-video-juliette-questiona-ligacao-de-flavio-bolsonaro-com-bispo-que-satanizou-nossa-senhora-aparecida/) |
| Carlinhos Maia | Disse estar indeciso (07/10), embora tenha citado Lula | [Correio Braziliense](https://www.correiobraziliense.com.br/diversao-e-arte/2026/10/7517053-rico-e-via-o-carlinhos-tem-duvida-entre-lula-e-flavio-2-turno.html) |
| Rayssa Leal | Pediu "voto consciente", sem candidato | [Terra](https://www.terra.com.br/diversao/gente/direita-ou-esquerda-aos-18-anos-rayssa-leal-se-manifesta-sobre-eleicoes,a23ae6bf5f4b88d038525027d589db51jxvvxwpw.html) |
| Xuxa | Só achei a declaração de 2022 | — |
| Felipe Neto, Casimiro, Whindersson Nunes, Gil do Vigor, Hugo Gloss, Boca Rosa | Nenhuma declaração de 2026 encontrada | — |
| Rafa Justus | Negou ter se posicionado | [Correio 24 Horas](https://www.correio24horas.com.br/em-alta/video-rafa-justus-rebate-criticas-e-ataques-apos-votar-pela-primeira-vez-1026) |

## Estrangeiros (apoio público, mas não votam no Brasil)

Finneas (vídeo no Instagram em 10/10), Tom Morello (Rage Against the Machine), The Strokes/Julian Casablancas ([Papelpop](https://www.papelpop.com/2026/10/eleicoes-2026-tom-morello-do-rage-against-the-machine-e-the-strokes-de-julian-casablancas-declaram-apoio-a-lula/)) e o jogador australiano Jackson Irvine. Todos declararam apoio a Lula.

## Limitações

1. **Acesso.** O ambiente bloqueia sites de notícias e redes sociais. Tudo saiu de buscas na web e de trechos de reportagens; não abri as páginas nem os perfis diretamente.
2. **Seguidores** são estimativas, salvo quando a fonte publicou o número. Antes de usar, confira os casos marcados "a verificar".
3. **Cobertura.** O agregador [Quem Apoia Quem](https://quemapoiaquem.com.br/) tem cerca de 650 nomes declarados. Esta lista traz os de maior repercussão na imprensa. Para a base completa, vale exportar ou consultar o próprio site.
4. **Assimetria de imprensa.** Atos coletivos pró-Lula (Fundição Progresso em 23/09, vídeo "Bora Lula" em 17/09, camisa da Seleção em 17/10) geraram listas grandes. Do lado de Flávio, muitos apoios estão em influenciadores de nicho menos cobertos pela imprensa. Por isso a lista dele tende a estar mais incompleta.
5. **Dinâmica.** O 2º turno é em 25/10 e novos nomes surgem todo dia, por exemplo no "Bloquinho do 22" na Paulista, em 18/10.
