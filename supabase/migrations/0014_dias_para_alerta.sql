-- Reps Club · M2-07 · Quantos dias sem treinar acendem o alerta
--
-- O limiar é do personal, não do produto: quem atende atleta que treina seis
-- vezes por semana quer saber em três dias; quem atende iniciante de duas vezes
-- por semana não quer alerta nenhum antes de dez. Decisão do PM, com padrão de
-- **7 dias**.
--
-- `not null default 7` de propósito: personal criado antes desta migration
-- ganha o padrão em vez de nulo, e a tela nunca precisa tratar "sem limiar".
--
-- O `check` entre 1 e 90 é a mesma trava que o formulário aplica. O formulário
-- valida para dar mensagem em português; o banco valida porque um POST direto
-- não passa por formulário nenhum.
--
-- **Sem policy nova.** `trainers_update` já deixa o personal escrever a própria
-- linha e só ela — a coluna entra na policy que existe.

alter table public.trainers
  add column dias_para_alerta integer not null default 7
    check (dias_para_alerta between 1 and 90);

comment on column public.trainers.dias_para_alerta is
  'Dias sem sessão concluída até o aluno aparecer em "precisam de atenção". Padrão 7; a conta em si é derivada na leitura, nunca armazenada.';
