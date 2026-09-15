#!/usr/bin/env python3
"""Gera `M3-roteiro.md` a partir da lista de passos de `M3-roteiro.html`.

A página é o que o Otávio abre para marcar; o markdown é o registro no
repositório. Mantidos à mão, os dois divergiram em 14/09 — 6/16/16/11/8 contra
5/16/18/8/8, dois documentos dizendo ser o mesmo roteiro. Agora só existe uma
lista, e ela mora no HTML.

    python3 docs/plan/gerar-roteiro.py
"""

import html
import pathlib
import re
import textwrap

AQUI = pathlib.Path(__file__).parent
FONTE = AQUI / "M3-roteiro.html"
DESTINO = AQUI / "M3-roteiro.md"

CABECALHO = """# Roteiro · validar o M3 (feed, reavaliação, agenda)

> **Este arquivo é gerado** por `docs/plan/gerar-roteiro.py`, a partir de
> `M3-roteiro.html` — a página que o Otávio abre para marcar. Editar os passos
> aqui não muda a página; edite o HTML e rode o script.
>
> Tudo o que entrou desde a última validação. Leva cerca de 1h10.
>
> **Por que precisa ser o Otávio:** o host do Supabase é bloqueado pela política
> de rede do ambiente remoto. Cada tela foi conferida no navegador com dados
> fixos e cada regra de banco foi provada por SQL, mas **nenhum fluxo com sessão
> de verdade passou por lá**. Publicar uma foto ou responder uma reavaliação,
> de ponta a ponta, só acontece aqui.

## Antes de começar

- **Onde:** `repsclub.com.br`. Painel no computador, app no celular, os **dois abertos
  ao mesmo tempo** — quase toda parte troca de lado.
- **O banco é o de desenvolvimento.** Pode marcar, apagar, errar e refazer à vontade.
- **Uma fita métrica** para a Parte 6, ou invente os números.
- **A segunda conta de aluno** para a Parte 4. Sem a senha, marque ✗ ali e siga.
- **Faça na ordem.** As partes se apoiam.
- **Parte dos passos já foi validada** numa rodada anterior; retomar pela Parte 2.
- **Travou feio? Pare e chame.** Não precisa chegar ao fim para o teste valer.

Uma coisa que não dá para conferir do ambiente remoto: se o último deploy subiu — a rede
bloqueia o domínio. Ao abrir o site, a **Agenda** no menu do painel é o sinal de que é o
código de agora.

## O que anotar

Em cada passo: **aconteceu o que está escrito?**

- ✅ sim
- ❌ não → **escreva a frase que apareceu na tela**, mesmo que pareça bobo

Os quatro defeitos do M1 e do M2 estavam todos em borda de sessão, e nenhum
deles apareceria num "não funcionou" sem o texto.

---
"""

RODAPE = """
---

## Quando terminar

Me diga que terminou — eu leio as marcações e as notas direto da página, não
precisa copiar nada.

Se passar tudo, o M3 fecha. O que sobra da Fase 3 é a reavaliação física, que é
cortável — aí decidimos se vale ou se o próximo pedaço é outro.
"""


def para_markdown(trecho: str) -> str:
    """Tira as etiquetas do HTML e devolve o equivalente em markdown."""
    trecho = re.sub(r"<strong>(.*?)</strong>", r"**\1**", trecho)
    trecho = re.sub(r"<code>(.*?)</code>", r"`\1`", trecho)
    trecho = re.sub(r"<[^>]+>", "", trecho)
    return html.unescape(trecho.replace('\\"', '"'))


def main() -> None:
    fonte = FONTE.read_text()
    bloco = fonte[fonte.index("const PARTES = [") : fonte.index("const TOTAL")]

    saida = [CABECALHO]
    numero = 0

    padrao = re.compile(
        r'n: "([^"]+)", titulo: "([^"]+)", duracao: "([^"]+)"(.*?)'
        r'nota: "(.*?)",\n    passos: \[(.*?)\n    \],',
        re.S,
    )

    for parte in padrao.finditer(bloco):
        rotulo, titulo, duracao, extra, nota, corpo = parte.groups()
        critica = " — **o teste que mais importa**" if "critica: true" in extra else ""

        saida.append(f"\n## {rotulo} · {titulo} ({duracao}){critica}\n")
        saida.append(para_markdown(nota) + "\n")

        for passo in re.findall(r'^      "(.*)",$', corpo, re.M):
            numero += 1
            prefixo = f"{numero}. "
            saida.append(
                "\n".join(
                    textwrap.wrap(
                        para_markdown(passo),
                        74,
                        initial_indent=prefixo,
                        # A continuação alinha com a largura do número, que muda
                        # de 3 para 4 colunas no passo 10.
                        subsequent_indent=" " * len(prefixo),
                    )
                )
            )
        saida.append("")

    saida.append(RODAPE)
    DESTINO.write_text("\n".join(saida).replace("\n\n\n", "\n\n"))
    print(f"{DESTINO.name}: {numero} passos")


if __name__ == "__main__":
    main()
