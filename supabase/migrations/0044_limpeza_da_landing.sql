-- Reps Club · Limpeza da landing: colunas e função que nada mais usa
--
-- **PENDENTE — escrita em 02/10 e ainda não aplicada.** O MCP do Supabase pede
-- confirmação para `drop`, e a sessão remota não consegue dá-la: as tentativas
-- expiraram sem a consulta chegar ao banco. Aplicar pelo SQL Editor do
-- Supabase e, depois, regerar `types/database.ts`. É seguro:
--
-- 1. `contatos_do_site` não tem nenhuma linha de personal, e desde a 0042 não
--    pode ter. Sai a forma do personal; `perfil` sai junto, porque com um
--    valor só ele não distingue nada, e o código não o manda desde a 0042.
-- 2. `entrar_na_lista(text)`, de um argumento, ficou de pé na 0043 só para o
--    site no ar durante o deploy. O código chama a de dois argumentos.

alter table public.contatos_do_site
  drop constraint contatos_campos_do_perfil,
  drop constraint contatos_so_do_aluno,
  drop column perfil,
  drop column quantos_alunos,
  drop column plataforma_atual,
  add constraint contatos_tem_objetivo check (cardinality(objetivos) > 0);

drop function public.entrar_na_lista(text);
