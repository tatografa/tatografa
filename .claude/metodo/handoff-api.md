# Handoff de API — <feature>

> Escrito pelo dev de BACKEND ao concluir o card, ANTES de liberar o dependente. É o contrato que o
> dev de FRONTEND vai seguir para plugar as telas — ele não vai ler o código do backend, só este arquivo.
> Salve em `docs/handoffs/<feature>.md`. Exemplos devem ser REAIS (testados via curl), não teóricos.

## Visão geral
<O que esta API faz, em 2–3 frases. Qual tela/fluxo vai consumi-la.>

## Como rodar localmente
- Subir: `<comando, ex.: pnpm dev>` → base URL: `http://localhost:<porta>`
- Pré-requisitos: `<migrações, seed, variáveis de ambiente NÃO sensíveis>`

## Autenticação
<Como autenticar: header, formato do token, como obter um token de teste, roles/permissões exigidas.>

## Endpoints

### `<MÉTODO> <caminho>` — <o que faz>
**Request:**
```jsonc
// headers / params / body — com todos os campos, tipos e obrigatoriedade
```
**Response `200`:**
```jsonc
// payload real de sucesso
```
**Erros:**
| Status | Quando acontece | Body | O que a tela deve mostrar |
|---|---|---|---|
| 400 | <validação: campo X inválido> | `{ ... }` | <mensagem sugerida ao usuário> |
| 401/403 | <sem auth / sem permissão> | `{ ... }` | <redirect/mensagem> |
| 404 | <recurso não existe> | `{ ... }` | <estado vazio> |

**Exemplo real (testado):**
```bash
curl -X <MÉTODO> http://localhost:<porta><caminho> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ ... }'
# → resposta real colada aqui
```

<Repita o bloco acima para cada endpoint.>

## Comportamentos e regras de negócio que a tela precisa refletir
- <paginação/ordenação/filtros e seus defaults>
- <estados: o que significa cada status/enum retornado>
- <efeitos colaterais: o que muda depois de um POST/PUT/DELETE>
- <limites: rate limit, tamanho máximo de upload, timeouts>

## O que ainda NÃO existe
<Endpoints/campos planejados mas não implementados — para o frontend não assumir que existem.>
