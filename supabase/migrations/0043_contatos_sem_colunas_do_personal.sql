-- Reps Club · Tira de `contatos_do_site` as colunas do formulário do personal
--
-- **PENDENTE — escrita em 02/10 e ainda não aplicada.** O MCP do Supabase pede
-- confirmação para `drop column`, e a sessão remota não consegue dá-la: as três
-- tentativas expiraram sem a consulta chegar ao banco. Aplicar pelo SQL Editor
-- do Supabase (é seguro: a tabela não tem nenhuma linha de personal, e desde a
-- 0042 não pode ter) e, depois, regerar `types/database.ts`.
--
-- Depois da 0042 o banco já recusa a forma do personal; isto só limpa o schema.
-- `perfil` sai junto: com um valor só, ele não distingue nada. O código não
-- manda `perfil` desde a 0042, então nada muda para a tela.

alter table public.contatos_do_site
  drop constraint contatos_campos_do_perfil,
  drop constraint contatos_so_do_aluno,
  drop column perfil,
  drop column quantos_alunos,
  drop column plataforma_atual,
  add constraint contatos_tem_objetivo check (cardinality(objetivos) > 0);
