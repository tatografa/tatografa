-- Reps Club · O formulário de contato saiu da landing, e a porta fecha
--
-- Pedido do Otávio (02/10): "remova o formulário do aluno também". Com a 0043,
-- as duas versões da landing usam "Entrar na lista", e `contatos_do_site`
-- (0040) não tem mais tela que escreva nela. Mas a policy de insert para
-- `anon` continuava aberta: uma porta pública que nenhuma tela usa é só um
-- lugar para robô despejar lixo que alguém, um dia, vai ler achando que é
-- contato de verdade.
--
-- **Fecha pelo privilégio, sem apagar a tabela.** O certo é `drop table` — e
-- ele está na 0045 —, mas `drop` passa por uma confirmação que a sessão remota
-- não consegue dar. Tirar o `insert` de `anon` e `authenticated` deixa a
-- tabela sem nenhuma porta pela API (o select nunca foi concedido). A tabela
-- tem 0 linhas.
--
-- Três provas: visitante e usuário logado recusados com 42501, e a lista de
-- espera continuando a aceitar o e-mail.

revoke insert on public.contatos_do_site from anon, authenticated;

comment on table public.contatos_do_site is
  'Fora de uso desde 02/10: o formulário de contato saiu da landing. Sem nenhum privilégio pela API; sai na 0045.';
