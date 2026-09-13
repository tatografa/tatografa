import { OPERADOR, type Documento } from "./documentos";

/**
 * Termos de uso — **rascunho para revisão do Otávio.**
 *
 * O ponto delicado deste texto não é jurídico, é de produto: o Reps Club
 * carrega prescrição de exercício, e prescrição errada machuca. Por isso a
 * seção sobre quem responde pelo treino vem cedo e sem rodeio — quem prescreve
 * é o personal, não o app.
 */
export const TERMOS: Documento = {
  slug: "termos",
  titulo: "Termos de uso",
  resumo:
    "As regras de uso do Reps Club: o que a gente entrega, o que é responsabilidade sua e do seu personal.",
  secoes: [
    {
      titulo: "O que é o Reps Club",
      paragrafos: [
        "Uma ferramenta onde personal trainers montam treinos e alunos registram o que executaram — carga e repetições, série por série. Nada mais que isso.",
        `Quem opera o serviço é ${OPERADOR.nome}. Para falar com a gente: ${OPERADOR.contato}.`,
      ],
    },
    {
      titulo: "Quem responde pelo treino",
      paragrafos: [
        "**O seu personal.** É ele quem avalia você, decide os exercícios, as cargas e as repetições. O Reps Club só guarda e mostra o que ele montou — não escolhe, não sugere carga, não corrige execução e não substitui o acompanhamento presencial.",
        "**O Reps Club não é serviço de saúde.** Não damos orientação médica, nutricional nem de treinamento. Nenhum número mostrado aqui é recomendação: é registro do que já aconteceu.",
        "Antes de começar ou mudar um programa de exercícios, procure um médico. Se sentir dor, tontura ou qualquer coisa fora do comum durante o treino, pare e procure ajuda. Essa decisão é sua e de quem te acompanha, não do app.",
      ],
    },
    {
      titulo: "Sua conta",
      paragrafos: [
        "Aluno entra por convite do personal. Personal cria a própria conta.",
        "A senha é sua e não se empresta — quem entra com ela vê e altera o que é seu. Se desconfiar que alguém acessou sua conta, troque a senha e avise a gente.",
        "Você é responsável pelo que informa. Dado errado no perfil vira treino errado.",
      ],
    },
    {
      titulo: "O que não pode",
      paragrafos: [
        "Usar a conta de outra pessoa, ou tentar ver dado de quem não é seu aluno.",
        "Tentar burlar as regras de acesso do sistema, sobrecarregar o serviço ou automatizar uso em massa.",
        "Usar o Reps Club para qualquer coisa ilegal, ou para prescrever treino sem ser habilitado para isso.",
        "Conta que fizer qualquer uma dessas coisas é encerrada, sem aviso prévio quando houver risco a outra pessoa.",
      ],
    },
    {
      titulo: "Seus dados e seu conteúdo",
      paragrafos: [
        "O treino que o personal monta é dele. O histórico do que você executou é seu. Nenhum dos dois é nosso: guardamos para vocês, e a política de privacidade explica com quem isso é compartilhado.",
        "Não usamos seu conteúdo para outra finalidade, não vendemos e não publicamos.",
      ],
    },
    {
      titulo: "Disponibilidade",
      paragrafos: [
        "O Reps Club está em fase piloto. Isso significa que pode sair do ar, mudar de funcionamento ou perder recursos sem aviso longo. Fazemos o possível para não perder o que você registrou, mas não prometemos disponibilidade contínua nesta fase.",
        "O app funciona parcialmente sem internet: as séries que você confirma ficam guardadas no aparelho e sobem quando o sinal voltar. Se você limpar os dados do navegador antes disso, o que não subiu se perde — por isso o app mostra na tela quantas séries ainda faltam enviar.",
      ],
    },
    {
      titulo: "Encerrar a conta",
      paragrafos: [
        `Você pode encerrar quando quiser: peça ao seu personal ou escreva para ${OPERADOR.contato}. Apagamos tudo em até 30 dias.`,
        "Também podemos encerrar a sua, com aviso, se o serviço for descontinuado ou se estes termos forem descumpridos.",
      ],
    },
    {
      titulo: "Limites da nossa responsabilidade",
      paragrafos: [
        "Não respondemos por lesão, por resultado de treino, nem por decisão tomada com base no que está no app — isso é do seu personal e seu.",
        "Também não respondemos por indisponibilidade do serviço nesta fase piloto. Nada aqui afasta os direitos que o Código de Defesa do Consumidor te garante.",
      ],
    },
    {
      titulo: "Mudanças e foro",
      paragrafos: [
        "Se estes termos mudarem de forma relevante, avisamos no app e pedimos seu aceite de novo. A data da versão está no rodapé desta página.",
        "Vale a lei brasileira. Fica eleito o foro do seu domicílio para resolver o que não der para resolver conversando.",
      ],
    },
  ],
};
