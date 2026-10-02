-- Reps Club · O formulário de contato fica só do aluno
--
-- Pedido do Otávio (02/10): "remova o formulário completo do personal". Desde a
-- 0041 o personal entra na lista só com o e-mail, e o formulário dele (quantos
-- alunos tem, que plataforma usa) ficou sem botão que o abrisse. A tela e a
-- validação saíram; aqui o banco para de aceitar a forma do personal.
--
-- **Em duas migrations, e esta é a que não apaga nada.** O certo é tirar as
-- colunas (`0044`): coluna que nenhuma tela escreve é a história de
-- `posts.session_id` e `trainers.phone`, a intenção escrita no schema que
-- alguém um dia lê como algo que o produto faz. Mas `drop column` passa por
-- uma confirmação que a sessão remota não consegue dar, e o código novo não
-- manda mais `perfil` — sem o padrão abaixo, todo envio de aluno quebraria até
-- a 0044 entrar. Esta deixa o site certo agora; a 0044 limpa o schema.
--
-- **E fecha um furo da 0040.** `contatos_campos_do_perfil` pedia
-- `cardinality(objetivos) > 0`, e `cardinality(null)` é nulo — `check` nulo
-- passa. Um contato de aluno sem objetivo nenhum entrava. Provado antes da
-- correção (aceito) e depois (23502). Os dois campos do aluno viram `not null`.
--
-- Dez provas, como `anon` e `authenticated`: dois envios legítimos, cinco de
-- lixo recusados (o formulário do personal inteiro, aluno com campo do
-- personal, sem objetivos, sem "tem personal", objetivos vazio) e três de
-- burla (visitante lendo e alterando, usuário logado lendo — 42501).

alter table public.contatos_do_site
  alter column perfil set default 'aluno',
  alter column tem_personal set not null,
  alter column objetivos set not null,
  add constraint contatos_so_do_aluno check (perfil = 'aluno');

comment on table public.contatos_do_site is
  'Contatos de aluno enviados pela landing. Qualquer visitante insere; ninguém lê pela API — a leitura é pelo painel do Supabase.';
