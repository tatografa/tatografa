-- Apoios declarados por famosos no 2º turno de 2026 (Lula x Flávio Bolsonaro).
-- Dados públicos: leitura liberada para qualquer um; escrita só pelo painel/service role.

create table public.apoios (
  id bigint generated always as identity primary key,
  nome text not null,
  candidato text not null check (candidato in ('Lula', 'Flávio Bolsonaro')),
  categoria text not null check (categoria in (
    'Música', 'Atores e audiovisual', 'Influência, TV e ex-BBB',
    'Esporte', 'Religião', 'Empresários'
  )),
  area text,
  como_quando text,
  seguidores text,
  faixa_seguidores text not null check (faixa_seguidores in ('milhoes', 'acima_do_corte', 'a_verificar')),
  confianca text not null check (confianca in ('Confirmado', 'Lista', 'Indireto')),
  fontes jsonb not null default '[]'::jsonb,
  fonte_texto text,
  verificado_em date not null default current_date,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (nome, candidato)
);

comment on table public.apoios is 'Famosos (>100 mil no Instagram, >50 mil no X ou >100 mil no TikTok) com voto/apoio declarado no 2º turno de 2026.';
comment on column public.apoios.confianca is 'Confirmado = reportagem específica; Lista = só em listas de veículos/agregador; Indireto = gesto sem declaração explícita.';
comment on column public.apoios.fontes is 'Lista de {"titulo": ..., "url": ...}.';

create index apoios_candidato_categoria_idx on public.apoios (candidato, categoria);

create table public.checagens (
  id bigint generated always as identity primary key,
  nome text not null unique,
  tipo text not null check (tipo in ('Boato ou vídeo falso', 'Não declarou')),
  situacao text not null,
  fontes jsonb not null default '[]'::jsonb,
  verificado_em date not null default current_date,
  criado_em timestamptz not null default now()
);

comment on table public.checagens is 'Boatos, vídeos falsos e famosos cobrados que não declararam voto.';

create function public.tocar_atualizado_em()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

create trigger apoios_tocar_atualizado_em
before update on public.apoios
for each row execute function public.tocar_atualizado_em();

alter table public.apoios enable row level security;
alter table public.checagens enable row level security;

create policy "Leitura pública dos apoios"
on public.apoios for select
to anon, authenticated
using (true);

create policy "Leitura pública das checagens"
on public.checagens for select
to anon, authenticated
using (true);

create view public.resumo_apoios
with (security_invoker = true)
as
select candidato, confianca, categoria, count(*)::int as total
from public.apoios
group by candidato, confianca, categoria;
