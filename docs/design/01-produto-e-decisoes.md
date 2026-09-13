# 01 · Produto e decisões

## O que é

Reps Club é uma plataforma onde **personal trainers montam treinos** e **alunos executam esses
treinos na academia**, registrando carga e repetições série por série. O valor central é o
histórico: o aluno vê sua evolução por exercício, e o personal vê o que o aluno realmente fez.

Dois produtos, um sistema:

| Papel | Interface | Contexto de uso |
|---|---|---|
| **Aluno** | Web mobile-first (PWA) | Celular, na academia, entre séries, às vezes com internet ruim |
| **Personal** | Web desktop | Computador, sentado, montando treinos e acompanhando alunos |

Essa divisão é literal nos protótipos: telas em moldura de celular são do aluno, telas em
moldura de navegador são do personal.

## Papéis e permissões

- Um **personal** tem muitos alunos.
- Um **aluno** pertence a um personal (na v1; múltiplos personais é decisão futura).
- Um aluno só vê os próprios dados. Um personal só vê os dados dos seus alunos.
- Não há papel de administrador na v1.

## Fluxo principal do produto

```
Personal cria conta  →  cria um treino  →  convida o aluno por e-mail
                                                    ↓
Aluno abre o link  →  define perfil  →  vê o treino do dia  →  executa
                                                    ↓
                         registra carga e reps por série  →  conclui
                                                    ↓
             histórico e gráfico de evolução  ←  personal acompanha
```

Esse é o loop que precisa funcionar antes de qualquer outra coisa.

## Escopo da v1 (piloto)

**Dentro:**
- Autenticação: personal com e-mail/senha; aluno com link mágico por e-mail (sem senha).
- Convite de aluno pelo personal.
- Cadastro de exercícios: catálogo base compartilhado + exercícios próprios do personal.
- Montagem de treino: séries, repetições, descanso, ordem, observações.
- Execução do treino pelo aluno: registro de carga e reps por série, timer de descanso.
- Histórico por exercício, com gráfico de evolução de carga.
- Foto do treino e feed social simples (post, curtida, comentário).
- Reavaliação física: fotos antes/depois e medidas.
- Painel do personal: lista de alunos, detalhe do aluno, treinos, exercícios, agenda.

**Fora:**
- Pontos e gamificação (cortado por decisão do produto).
- Cobrança, assinatura, gateway de pagamento.
- App nativo nas lojas.
- Modo offline completo.
- Integração com Apple Health, Google Fit ou wearables.
- Notificações push.
- Vídeos de execução dos exercícios.

## Decisões já tomadas

Estas não estão em aberto. Se alguma delas se mostrar inviável na prática, isso é uma decisão
técnica com impacto no produto — traga para o Otávio antes de mudar (ver seção final).

| Decisão | Escolha | Motivo |
|---|---|---|
| Distribuição | Web mobile-first (PWA), não app nativo | Piloto rápido, sem fila de aprovação de loja |
| Stack | Next.js (App Router) + Supabase | Auth, banco, storage e plano gratuito em um só lugar |
| Login do aluno | Link mágico por e-mail | Nada de senha esquecida na academia |
| Login do personal | E-mail e senha | Uso recorrente em desktop |
| Custo de infra no piloto | Praticamente zero (planos gratuitos) | Piloto não deve custar dinheiro |
| Catálogo de exercícios | Base pronta + personal adiciona os dele | Personal monta treino do zero, mas não do vazio |
| Cobrança | Nenhuma no piloto | Validar uso antes de monetizar |
| Ordem de construção | Fatia vertical ponta a ponta | Poucas horas por semana; precisa de algo testável logo |
| Piloto | 2 a 5 personais, ~50 alunos | Suficiente para achar problemas reais |
| Domínio | Já registrado, marca Reps Club definida | — |
| Idioma | Português do Brasil em toda a interface | Público brasileiro |

## Como as decisões são tomadas neste projeto

Otávio define o produto e valida o fluxo. **As decisões técnicas são do agente desenvolvedor** —
escolha de biblioteca, estrutura de pastas, padrão de estado, formato de query, estratégia de
cache, nomes de tabela. Decida, registre no código e siga. Não pare o trabalho para pedir
aprovação técnica.

**Traga para o Otávio antes de seguir quando a decisão:**

1. **Muda o que o usuário vê ou faz na tela** — layout, fluxo, quantidade de passos, texto de
   interface, comportamento de um botão.
2. **Custa dinheiro** — serviço pago, ultrapassar limite de plano gratuito, cobrança por uso.
3. **Cria dependência difícil de reverter** — trocar de banco, de provedor de auth, de framework,
   adotar algo que amarra o projeto a longo prazo.
4. **Reduz o escopo de alguma funcionalidade** — "isso não dá para fazer assim, vou entregar uma
   versão menor".

Fora desses quatro casos, decida e siga.

Quando trouxer uma decisão, apresente assim, curto: **o que precisa decidir**, **duas ou três
opções**, **o que cada uma custa** (tempo, dinheiro, escopo), e **sua recomendação**. Otávio
prefere decidir na conversa, sem documento formal de decisões.
