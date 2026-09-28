/**
 * A coluna "Atividade" do perfil do aluno no painel: cada treino concluído e
 * cada publicação, numa linha do tempo só.
 *
 * No protótipo a coluna é um feed em que cada execução é um cartão — com foto
 * quando houve publicação, "sem foto nesta execução" quando não houve. Aqui o
 * cartão nasce da **sessão**, e a publicação pendura nela pelo `session_id`:
 * é o treino que o personal vem conferir, e a foto é o que às vezes veio
 * junto. Uma publicação sem sessão (post avulso), ou de uma sessão fora da
 * janela, entra como cartão próprio.
 *
 * Função pura: recebe as duas listas prontas e devolve a ordem da tela.
 */

export type SessaoDaAtividade = { id: string; finished_at: string };
export type PostDaAtividade = { id: string; criadoEm: string; sessaoId: string | null };

export type ItemDaAtividade<S, P> =
  | { tipo: "sessao"; chave: string; quando: string; sessao: S; post: P | null }
  | { tipo: "post"; chave: string; quando: string; post: P };

/** Quantos cartões a coluna desenha. O resto das sessões vira lista compacta. */
export const LIMITE_DA_ATIVIDADE = 15;

export function montarAtividade<S extends SessaoDaAtividade, P extends PostDaAtividade>(
  sessoes: S[],
  posts: P[],
  limite: number = LIMITE_DA_ATIVIDADE,
): { itens: ItemDaAtividade<S, P>[]; sessoesDeFora: S[] } {
  // Se a mesma sessão tiver dois posts, o mais recente fica no cartão dela e o
  // outro vira cartão próprio: nenhum some.
  const postPorSessao = new Map<string, P>();
  const soltos: P[] = [];
  const ordenados = [...posts].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
  const idsDeSessao = new Set(sessoes.map((s) => s.id));
  for (const post of ordenados) {
    if (post.sessaoId && idsDeSessao.has(post.sessaoId) && !postPorSessao.has(post.sessaoId)) {
      postPorSessao.set(post.sessaoId, post);
    } else {
      soltos.push(post);
    }
  }

  const todos: ItemDaAtividade<S, P>[] = [
    ...sessoes.map((sessao) => ({
      tipo: "sessao" as const,
      chave: `s-${sessao.id}`,
      quando: sessao.finished_at,
      sessao,
      post: postPorSessao.get(sessao.id) ?? null,
    })),
    ...soltos.map((post) => ({
      tipo: "post" as const,
      chave: `p-${post.id}`,
      quando: post.criadoEm,
      post,
    })),
  ].sort((a, b) => b.quando.localeCompare(a.quando));

  const itens = todos.slice(0, limite);
  const dentro = new Set(
    itens.filter((i) => i.tipo === "sessao").map((i) => (i as { sessao: S }).sessao.id),
  );
  return { itens, sessoesDeFora: sessoes.filter((s) => !dentro.has(s.id)) };
}
