-- Reps Club · Limpeza da landing: tabela e função que nada mais usa
--
-- **PENDENTE — escrita em 02/10 e ainda não aplicada.** O MCP do Supabase pede
-- confirmação para `drop`, e a sessão remota não consegue dá-la: as tentativas
-- expiraram sem a consulta chegar ao banco. Aplicar pelo SQL Editor do
-- Supabase e, depois, regerar `types/database.ts`. É seguro:
--
-- 1. `contatos_do_site` (0040) era o formulário de contato da landing, que
--    saiu inteiro (0042 e 0044). Não tem nenhuma linha e, desde a 0044,
--    nenhuma porta pela API.
-- 2. `entrar_na_lista(text)`, de um argumento, ficou de pé na 0043 só para o
--    site no ar durante o deploy. O código chama a de dois argumentos.

drop table public.contatos_do_site;

drop function public.entrar_na_lista(text);
