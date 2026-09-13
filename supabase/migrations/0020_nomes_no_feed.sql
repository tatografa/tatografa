-- Reps Club · Fase 3 · O nome de quem aparece no feed
--
-- **O defeito.** `lerFeed` buscava o nome dos autores com
-- `from("students").select("id, name").in("id", ...)`, e `students_select`
-- devolve só `id = auth.uid() or trainer_id = auth.uid()`: o aluno enxerga **a
-- própria linha e mais nada**. Conferido por SQL antes de escrever isto — o
-- aluno "raul", pedindo três ids, recebeu um. Ou seja, na aba "Da turma" todo
-- colega apareceria como "Aluno", que é o texto de reserva da função.
--
-- **Por que não é caso de abrir o `students_select`.** A linha do aluno tem
-- e-mail, peso, altura, data de nascimento e objetivo. Para escrever um nome
-- em cima de um avatar, liberar tudo isso para os colegas é caro demais.
--
-- **Por que não é caso de chave de serviço.** Mesma razão da 0006: a chave
-- ignora o RLS do banco inteiro se vazar do ambiente.
--
-- A saída é a mesma de `convite_por_token`: uma função estreita, que devolve
-- só `(id, name)` e só de quem o chamador já podia ver postando.
--
-- Repare que ela **recebe os ids**. Não existe "me dê a lista da turma": é
-- preciso já conhecer o id, e o único jeito de conhecê-lo é ter lido um post
-- ou um comentário que o RLS deixou passar. A função responde "como se chama
-- esta pessoa", nunca "quem está na minha turma".
--
-- A regra de quem conta como turma é **a mesma** de `private.pode_ver_post`:
-- você, a carteira de quem você treina, e os alunos do seu personal. Se as
-- duas discordarem, o feed mostra post sem nome ou nome sem post.
create function public.nomes_no_feed(p_ids uuid[])
  returns table (id uuid, name text)
  language sql stable security definer set search_path = public
as $$
  select s.id, s.name
    from public.students s
   where s.id = any(p_ids)
     and (
       -- eu mesmo
       s.id = auth.uid()
       -- meu aluno (quem está olhando é o personal)
       or s.trainer_id = auth.uid()
       -- colega de turma (mesmo personal que o meu)
       or (private.my_trainer_id() is not null
           and s.trainer_id = private.my_trainer_id())
     )
$$;

comment on function public.nomes_no_feed(uuid[]) is
  'Nome de quem aparece no feed, pelos ids já conhecidos. Devolve só (id, name) e segue a mesma regra de turma de private.pode_ver_post.';

-- API de propósito, ao contrário dos helpers de `private`: é a tela do aluno
-- que chama. `anon` não entra — feed não existe sem sessão.
revoke all on function public.nomes_no_feed(uuid[]) from public, anon;
grant execute on function public.nomes_no_feed(uuid[]) to authenticated;
