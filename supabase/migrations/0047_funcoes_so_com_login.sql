-- Reps Club · As funções do painel e do app só respondem a quem entrou
--
-- Achado na análise de segurança de 06/10: onze funções de `public` aceitavam
-- chamada do `anon` (visitante sem login) por `/rest/v1/rpc/...`. As migrations
-- que as criaram davam `grant execute ... to authenticated` e paravam aí — mas o
-- Postgres dá `execute` a `PUBLIC` em toda função nova, e o Supabase dá também ao
-- `anon` por privilégio padrão. O `grant` acrescentava, não restringia.
--
-- Não vazava nada: todas são `security invoker`, então rodam com o RLS de quem
-- chama, e para o `anon` nenhuma tabela devolve linha (provado: zero dado, só os
-- zeros que `generate_series` monta). Fechar é higiene — superfície que nenhuma
-- tela usa, e que deixaria de ser inofensiva no dia em que uma delas virasse
-- `security definer` sem ninguém lembrar do `anon`. A 0020, a 0023 e a 0037 já
-- faziam o `revoke` certo; estas ficaram para trás.
--
-- Ficam abertas de propósito: `convite_por_token` (a tela do convite é anterior à
-- conta) e `entrar_na_lista` (a landing é pública).

revoke execute on function
  public.alunos_por_mes(int),
  public.ativar_macrotreino(uuid),
  public.dias_de_treino(uuid),
  public.duplicar_macrotreino(uuid, uuid, text),
  public.duplicar_treino(uuid),
  public.progressoes_da_carteira(date, int),
  public.series_por_exercicio(uuid),
  public.sessoes_na_semana(date, date),
  public.sessoes_por_dia(date, date),
  public.treinos_feitos_na_semana(uuid, date, date),
  public.ultima_sessao_por_aluno()
from public, anon;

grant execute on function
  public.alunos_por_mes(int),
  public.ativar_macrotreino(uuid),
  public.dias_de_treino(uuid),
  public.duplicar_macrotreino(uuid, uuid, text),
  public.duplicar_treino(uuid),
  public.progressoes_da_carteira(date, int),
  public.series_por_exercicio(uuid),
  public.sessoes_na_semana(date, date),
  public.sessoes_por_dia(date, date),
  public.treinos_feitos_na_semana(uuid, date, date),
  public.ultima_sessao_por_aluno()
to authenticated;
