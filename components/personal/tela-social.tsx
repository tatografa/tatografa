import { CabecalhoDaPagina } from "@/components/personal/cabecalho-da-pagina";
import { CartaoDeAtividade } from "@/components/personal/cartao-de-atividade";
import type { PeriodoDoSocial } from "@/lib/domain/feed";
import type { Idioma } from "@/lib/domain/idioma";
import { TEXTOS_DO_PAINEL, type TextosDoPainel } from "@/lib/i18n/painel";
import { plural, preencher } from "@/lib/i18n/texto";
import type { PostDaCarteira } from "@/lib/queries/social";

/**
 * O feed do personal no layout do protótipo (27/09): uma coluna de 680px, a
 * faixa escura "Reps Club", os dois filtros e os posts um embaixo do outro —
 * foto, o treino que a gerou, curtidas e a conversa.
 *
 * Sem banco: a página monta os controles e passa pronto, e assim a tela abre
 * no navegador com props fixas, que é o único jeito de conferir interface
 * neste ambiente.
 *
 * **O que o protótipo tem e não entrou:** "+ Publicar aviso" (o personal não
 * publica no feed — `posts_insert` é só do aluno, e o personal que quer postar
 * vira aluno de si mesmo, decisão de 13/09) e o post "Conquista do aluno" de
 * macrociclo iniciado/terminado com fotos de antes e depois (não existe no
 * modelo; seria um tipo de post novo, não um desenho novo).
 */
export function TelaSocial({
  idioma = "pt",
  posts,
  periodo,
  filtrado,
  filtros,
  curtir,
  responder,
}: {
  idioma?: Idioma;
  posts: PostDaCarteira[];
  periodo: PeriodoDoSocial;
  /** Há um aluno escolhido no filtro — muda a frase do vazio. */
  filtrado: boolean;
  filtros: React.ReactNode;
  curtir: (post: PostDaCarteira) => React.ReactNode;
  responder: (post: PostDaCarteira) => React.ReactNode;
}) {
  const semResposta = posts.filter((p) => p.semResposta).length;
  const s = TEXTOS_DO_PAINEL[idioma].social;

  return (
    <>
      <CabecalhoDaPagina
        titulo={s.titulo}
        subtitulo={s.subtitulo}
      />

      <div className="mx-auto flex max-w-[680px] flex-col gap-3.5">
        <div className="rounded-[12px] bg-gradient-to-br from-dark-bg to-dark-elev px-5 py-[18px] text-dark-text">
          <p className="text-[15px] font-extrabold tracking-[-0.01em]">Reps Club</p>
          <p className="mt-0.5 text-[12.5px] font-medium text-dark-text-2">
            {s.faixa} · {plural(posts.length, s.publicacoes)}
            {/* A fila de trabalho do personal: o que o protótipo não diz e
                é o motivo de ele abrir esta tela. */}
            {semResposta > 0
              ? ` · ${plural(semResposta, s.semResposta)}`
              : ""}
          </p>
        </div>

        {filtros}

        {posts.length ? (
          <ul className="flex flex-col gap-3.5">
            {posts.map((post) => (
              <li key={post.id}>
                <CartaoDePost
                  idioma={idioma}
                  post={post}
                  curtir={curtir(post)}
                  responder={responder(post)}
                />
              </li>
            ))}
          </ul>
        ) : (
          <Vazio s={s} periodo={periodo} filtrado={filtrado} />
        )}
      </div>
    </>
  );
}

function CartaoDePost({
  idioma,
  post,
  curtir,
  responder,
}: {
  idioma: Idioma;
  post: PostDaCarteira;
  curtir: React.ReactNode;
  responder: React.ReactNode;
}) {
  return (
    <CartaoDeAtividade
      idioma={idioma}
      rotulo={preencher(TEXTOS_DO_PAINEL[idioma].social.postDe, {
        nome: post.aluno.nome,
        dia: post.rotuloDoDia,
      })}
      autor={post.aluno}
      linkDoAutor
      rotuloDoDia={post.rotuloDoDia}
      visibilidade={post.visibilidade}
      fotoUrl={post.fotoUrl}
      legenda={post.legenda}
      treino={post.treino}
      conversa={{ curtir, comentarios: post.comentarios, responder }}
    />
  );
}

function Vazio({
  s,
  periodo,
  filtrado,
}: {
  s: TextosDoPainel["social"];
  periodo: PeriodoDoSocial;
  filtrado: boolean;
}) {
  const { vazio } = s;

  // Três vazios diferentes, e cada um pede uma ação diferente: esperar, abrir
  // o período, ou tirar o filtro do aluno.
  const [titulo, apoio] =
    periodo === "tudo" && !filtrado
      ? [vazio.nenhumTitulo, vazio.nenhumApoio]
      : filtrado
        ? [
            periodo === "tudo" ? vazio.alunoTudo : vazio.alunoNoPeriodo[periodo],
            vazio.tirarFiltro,
          ]
        : [vazio.noPeriodo[periodo], vazio.abrirPeriodo];

  return (
    <div className="rounded-[12px] border border-border bg-surface px-5 py-11 text-center">
      <p className="text-[14px] font-semibold text-ink">{titulo}</p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-4">{apoio}</p>
    </div>
  );
}
