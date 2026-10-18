"""Gera apoios.csv, supabase/seed.sql e pagina/index.html a partir do README.md.

O README é a fonte de verdade: edite as tabelas lá e rode
    python3 scripts/gerar.py
"""
import csv
import json
import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
LINK = re.compile(r"\[([^\]]+)\]\((https?://[^)]+)\)")
VERIFICADO_EM = "2026-10-18"

SECOES_FLAVIO = {
    "Confirmados": "Confirmado",
    "Só em listas (sem reportagem específica encontrada)": "Lista",
    "Sinais indiretos (sem declaração explícita de voto)": "Indireto",
}
CATEGORIA_LULA = {
    "Música": "Música",
    "Atores, atrizes e audiovisual": "Atores e audiovisual",
    "Influenciadores, TV e ex-BBBs": "Influência, TV e ex-BBB",
    "Esporte": "Esporte",
}
# Área livre (lado de Flávio) -> categoria
CATEGORIA_POR_AREA = [
    (r"futebol|futsal", "Esporte"),
    (r"sertanejo|funk|axé|gospel|cantora/", "Música"),
    (r"^ator|^atriz", "Atores e audiovisual"),
    (r"pastor|apóstolo", "Religião"),
    (r"empresário \(havan\)", "Empresários"),
    (r".", "Influência, TV e ex-BBB"),
]
# Linhas de "sinais indiretos" não têm coluna de área
AREA_INDIRETOS = {
    "Ana Castela": ("Sertanejo", "Música"),
    "Zezé Di Camargo": ("Sertanejo", "Música"),
    "Netinho": ("Axé", "Música"),
    "Gusttavo Lima": ("Sertanejo", "Música"),
    "Felipe Melo": ("Futebol", "Esporte"),
    "Dedé (ex-Vasco)": ("Futebol", "Esporte"),
    "Osvaldo (Vitória)": ("Futebol", "Esporte"),
    "Leomar Segundo (\"Segundo Católico\")": ("Influenciador católico", "Religião"),
    "Padre Fabiano Moura": ("Padre", "Religião"),
    "Berthaldo Soares": ("Influenciador católico", "Religião"),
}


def celulas(linha):
    return [c.strip() for c in linha.strip().strip("|").split("|")]


def eh_separador(linha):
    return set(linha.replace("|", "").strip()) <= set("-: ")


def fontes_de(texto, anterior):
    """Devolve (lista de {titulo,url}, texto limpo); 'idem' herda da linha anterior."""
    fontes = [{"titulo": t, "url": u} for t, u in LINK.findall(texto)]
    limpo = LINK.sub(r"\1", texto)
    if texto.startswith("idem") and anterior is not None:
        fontes = anterior["fontes"] + fontes
        limpo = anterior["fonte_texto"] + limpo[len("idem"):]
    vistos, unicas = set(), []
    for f in fontes:
        if f["url"] not in vistos:
            vistos.add(f["url"])
            unicas.append(f)
    return unicas, limpo


def faixa(seguidores):
    s = seguidores.lower()
    if "verificar" in s:
        return "a_verificar"
    if "milhões" in s or re.search(r"\d+(,\d+)? mi\b", s):
        return "milhoes"
    return "acima_do_corte"


def categoria_flavio(area):
    a = area.lower()
    return next(cat for padrao, cat in CATEGORIA_POR_AREA if re.search(padrao, a))


def ler_readme():
    linhas = (RAIZ / "README.md").read_text(encoding="utf-8").splitlines()
    apoios, checagens = [], []
    bloco = secao = cabecalho = None
    for linha in linhas:
        if linha.startswith("## "):
            bloco = ("lula" if linha.startswith("## LULA")
                     else "flavio" if linha.startswith("## FLÁVIO")
                     else "checagens" if linha.startswith("## Boatos") else None)
            secao = cabecalho = None
            continue
        if linha.startswith("### "):
            secao, cabecalho = linha[4:].strip(), None
            continue
        if bloco is None or not linha.startswith("|"):
            cabecalho = None
            continue
        if cabecalho is None:
            cabecalho = celulas(linha)
            continue
        if eh_separador(linha):
            continue
        reg = dict(zip(cabecalho, celulas(linha)))

        if bloco == "checagens":
            fontes, _ = fontes_de(reg["Fonte"], None)
            situacao = reg["Situação"]
            tipo = ("Boato ou vídeo falso" if re.search(r"\bIA\b|falso|é de 2022", situacao)
                    else "Não declarou")
            checagens.append({"nome": reg["Nome"], "tipo": tipo,
                              "situacao": situacao, "fontes": fontes})
            continue

        anterior = apoios[-1] if apoios else None
        fontes, fonte_texto = fontes_de(reg.get("Fonte") or reg.get("Onde aparece") or "", anterior)
        if bloco == "lula":
            candidato, confianca = "Lula", reg["Confiança"].split(" (")[0]
            categoria, area = CATEGORIA_LULA[secao], ""
        else:
            candidato, confianca = "Flávio Bolsonaro", SECOES_FLAVIO[secao]
            if "Área" in reg:
                area = reg["Área"]
                categoria = categoria_flavio(area)
            else:
                area, categoria = AREA_INDIRETOS.get(reg["Nome"], ("Influenciador", "Influência, TV e ex-BBB"))
        como = reg.get("Como/quando declarou") or reg.get("O que houve") or ""
        if como == "idem" and anterior is not None:
            como = anterior["como_quando"]
        apoios.append({
            "nome": reg["Nome"],
            "candidato": candidato,
            "categoria": categoria,
            "area": area,
            "como_quando": como,
            "seguidores": reg.get("Seguidores", ""),
            "faixa_seguidores": faixa(reg.get("Seguidores", "")),
            "confianca": confianca,
            "fontes": fontes,
            "fonte_texto": fonte_texto,
        })
    return apoios, checagens


def sql_texto(v):
    return "'" + v.replace("'", "''") + "'"


def gerar_seed(apoios, checagens):
    linhas = ["-- Gerado por scripts/gerar.py a partir do README.md. Não edite à mão.",
              "begin;", "truncate public.apoios, public.checagens restart identity;", ""]
    cols = "nome, candidato, categoria, area, como_quando, seguidores, faixa_seguidores, confianca, fontes, fonte_texto, verificado_em"
    valores = []
    for a in apoios:
        valores.append("  (" + ", ".join([
            sql_texto(a["nome"]), sql_texto(a["candidato"]), sql_texto(a["categoria"]),
            sql_texto(a["area"]), sql_texto(a["como_quando"]), sql_texto(a["seguidores"]),
            sql_texto(a["faixa_seguidores"]), sql_texto(a["confianca"]),
            sql_texto(json.dumps(a["fontes"], ensure_ascii=False)) + "::jsonb",
            sql_texto(a["fonte_texto"]), sql_texto(VERIFICADO_EM) + "::date",
        ]) + ")")
    linhas.append(f"insert into public.apoios ({cols}) values")
    linhas.append(",\n".join(valores) + ";")
    linhas.append("")
    valores = []
    for c in checagens:
        valores.append("  (" + ", ".join([
            sql_texto(c["nome"]), sql_texto(c["tipo"]), sql_texto(c["situacao"]),
            sql_texto(json.dumps(c["fontes"], ensure_ascii=False)) + "::jsonb",
            sql_texto(VERIFICADO_EM) + "::date",
        ]) + ")")
    linhas.append("insert into public.checagens (nome, tipo, situacao, fontes, verificado_em) values")
    linhas.append(",\n".join(valores) + ";")
    linhas.append("commit;")
    return "\n".join(linhas) + "\n"


def gerar_csv(apoios):
    with open(RAIZ / "apoios.csv", "w", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        w.writerow(["candidato", "nome", "categoria", "area", "como_quando", "seguidores",
                    "faixa_seguidores", "confianca", "fonte_urls", "fonte_texto"])
        for a in apoios:
            w.writerow([a["candidato"], a["nome"], a["categoria"], a["area"], a["como_quando"],
                        a["seguidores"], a["faixa_seguidores"], a["confianca"],
                        " ".join(f["url"] for f in a["fontes"]), a["fonte_texto"]])


def gerar_pagina(apoios, checagens):
    modelo = (RAIZ / "pagina" / "modelo.html").read_text(encoding="utf-8")
    dados = json.dumps({"apoios": apoios, "checagens": checagens, "verificado_em": VERIFICADO_EM},
                       ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    (RAIZ / "pagina" / "index.html").write_text(modelo.replace("/*__DADOS__*/null", dados), encoding="utf-8")


def main():
    apoios, checagens = ler_readme()
    (RAIZ / "supabase").mkdir(exist_ok=True)
    (RAIZ / "supabase" / "seed.sql").write_text(gerar_seed(apoios, checagens), encoding="utf-8")
    gerar_csv(apoios)
    if (RAIZ / "pagina" / "modelo.html").exists():
        gerar_pagina(apoios, checagens)
    resumo = {}
    for a in apoios:
        resumo.setdefault((a["candidato"], a["confianca"]), 0)
        resumo[(a["candidato"], a["confianca"])] += 1
    for k in sorted(resumo):
        print(*k, resumo[k], sep=" | ")
    print("apoios:", len(apoios), "checagens:", len(checagens))
    print("categorias:", sorted({(a["candidato"], a["categoria"]) for a in apoios}))


if __name__ == "__main__":
    main()
