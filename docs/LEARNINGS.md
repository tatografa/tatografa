# Aprendizados — Reps Club

> Memória evolutiva dos agentes deste produto. Todo dev lê antes de codar e, se descobrir
> algo não óbvio, relata uma linha no handoff do card. A curadoria acontece ao fim do
> milestone: lição recorrente vira regra nas Convenções do `CLAUDE.md` e sai daqui;
> entrada obsoleta é apagada. Manter ≤ ~40 linhas.
>
> Formato: `- [AAAA-MM-DD] [área] <erro/descoberta> → <regra a seguir>`

## Backend

- [2026-08-23] [rls] Policy de `students` que consulta `students` se auto-invoca → helper
  `security definer` com `search_path` fixo quebra a recursão.
- [2026-08-23] [rls] O PostgREST publica como RPC toda função de `public`, inclusive os
  helpers de autorização → helper vive no schema `private`, que não é publicado.
- [2026-08-23] [supabase] `signUp` com confirmação de e-mail ligada não devolve sessão, e
  sem sessão o insert do cliente esbarra no RLS → criar a linha de perfil por gatilho em
  `auth.users`, atômico com a criação do usuário.
- [2026-08-31] [postgres] `select ... for update` no gatilho serializa duas tentativas com
  o mesmo token de convite → a segunda só vê a linha já consumida e é recusada.
- [2026-08-31] [seguranca] Convite lido sem sessão não precisa de chave de serviço → função
  `security definer` estreita (um token exato, três campos) tem raio de dano muito menor
  que uma chave que ignora o RLS inteiro.
- [2026-08-31] [supabase] Projeto do plano gratuito **pausa sozinho** após ~7 dias sem uso,
  e a primeira query depois disso falha com timeout ou "relation does not exist" → conferir
  `status` do projeto antes de concluir que o schema sumiu.

## Frontend

- [2026-08-23] [next16] Este não é o Next.js do treinamento: `proxy.ts` no lugar de
  `middleware.ts`, `params`/`searchParams`/`cookies` assíncronos → ler
  `node_modules/next/dist/docs/` antes de escrever, não confiar na memória.
- [2026-08-23] [i18n] `required` e `type="email"` disparam validação nativa em inglês →
  `noValidate` no formulário e validação por zod na Server Action, em português.
- [2026-08-31] [zod4] A v4 trocou `errorMap` e `invalid_type_error` por `error` → mensagem
  customizada de enum, literal e coerce usa a chave nova.
- [2026-08-31] [react] `setState` dentro de `useEffect` para reagir a resultado de action
  reprova no lint e causa render em cascata → ajustar durante a renderização comparando
  com o resultado anterior (`if (estado !== ultimoEstado)`).
- [2026-08-31] [ux] Formulário multi-etapa com as etapas montadas juntas esconde o erro de
  servidor dentro da etapa oculta → validar no cliente antes de avançar e, se o erro vier
  do servidor mesmo assim, voltar para a etapa que o contém.
- [2026-08-31] [ux] Falha de rede tratada no mesmo ramo de "não encontrado" faz um convite
  válido parecer expirado → separar erro técnico de ausência de dado, com texto diferente.

## Infra / processo

- [2026-08-23] [rede] O host do Supabase é bloqueado pela política de egresso deste
  ambiente remoto (403 no CONNECT) → lógica de banco se valida por SQL via MCP; interface
  que precisa de dado se confere com props fixas numa rota descartável.
- [2026-08-31] [testes] Regex de teste procurando palavra que a aplicação não usa gera
  falso negativo → conferir a mensagem real antes de afirmar que há bug no código.
- [2026-08-31] [npm] `npm install <pkg>` para uso só de teste suja `package.json` →
  `npm install --no-save` quando a dependência não deve ser commitada.
