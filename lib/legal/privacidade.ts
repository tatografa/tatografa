import { OPERADOR, type Documento } from "./documentos";

/**
 * Política de privacidade — **rascunho para revisão do Otávio.**
 *
 * Escrita a partir do inventário real do banco, não de modelo genérico: cada
 * dado citado aqui existe como coluna, e nada que existe como coluna ficou de
 * fora. Se o schema mudar, este texto muda junto.
 *
 * O tom é o do resto do produto: frase curta, sem "outrossim", sem parágrafo
 * que só existe para parecer jurídico. Quem lê é um aluno de academia no
 * celular, não um advogado.
 */
export const PRIVACIDADE: Documento = {
  slug: "privacidade",
  titulo: "Política de privacidade",
  resumo:
    "O que o Reps Club guarda sobre você, para que serve, quem vê e como pedir para apagar.",
  secoes: [
    {
      titulo: "O resumo, em quatro linhas",
      paragrafos: [
        "Guardamos o que você informa no cadastro e o que você registra treinando. Isso serve para montar seu treino e mostrar sua evolução — nada mais.",
        "Seu personal vê os seus dados. Nenhum outro aluno vê. Não vendemos nada para ninguém e não usamos seus dados para anúncio.",
        "Você pode pedir para ver, corrigir ou apagar tudo, a qualquer momento.",
        `Dúvida, pedido ou reclamação: ${OPERADOR.contato}.`,
      ],
    },
    {
      titulo: "Que dados coletamos",
      paragrafos: [
        "**Para criar sua conta:** nome, e-mail e senha. A senha é guardada cifrada, e nem nós conseguimos lê-la.",
        "**Que você informa no primeiro acesso:** data de nascimento, peso, altura, objetivo (ganhar massa, perder gordura, condicionamento ou saúde) e nível de experiência.",
        "**Que nasce do seu treino:** os treinos que seu personal montou para você, e, a cada série que você registra, a carga, as repetições, se você pulou a série, quando a sessão começou e terminou e quanto tempo durou.",
        "**Nada além disso.** Não pedimos documento, endereço, telefone, cartão nem localização. Não usamos cookie de rastreamento, nem ferramenta de publicidade.",
      ],
    },
    {
      titulo: "Isso é dado de saúde",
      paragrafos: [
        "Peso, altura e data de nascimento, junto com o que você levanta, dizem coisas sobre seu corpo. A lei brasileira (LGPD) chama isso de **dado pessoal sensível** e exige cuidado maior — inclusive o seu consentimento explícito, que é o que você dá ao aceitar esta política no primeiro acesso.",
        "Consentimento dado é consentimento que pode ser retirado. Se você retirar, a conta é encerrada, porque sem esses dados o produto não tem o que fazer.",
      ],
    },
    {
      titulo: "Para que usamos",
      paragrafos: [
        "Para seu personal montar e ajustar seu treino. Para você ver seu histórico, seus recordes e sua evolução por exercício. Para o app saber qual treino sugerir hoje.",
        "Não usamos seus dados para nenhuma outra finalidade. Se um dia isso mudar, pediremos sua permissão de novo antes — não por um aviso escondido numa atualização.",
      ],
    },
    {
      titulo: "Quem vê seus dados",
      paragrafos: [
        "**Seu personal**, o mesmo que te convidou: vê seu perfil, seus treinos e todo o seu histórico de execução. É o ponto do produto — ele precisa disso para te treinar.",
        "**Nenhum outro aluno**, nem os outros alunos do mesmo personal. **Nenhum outro personal.** Isso não é promessa: é regra no banco de dados, conferida a cada consulta.",
        "**Quem opera o Reps Club**, para manter o serviço no ar e responder aos seus pedidos.",
        "**A Supabase**, empresa que hospeda o banco de dados, e a **Vercel**, que hospeda o site. Elas armazenam os dados para que o serviço funcione; não os usam para nada próprio. O banco fica em região do Brasil (São Paulo).",
        "Você troca de personal? Quem te convida decide o vínculo, e o histórico vai junto — é seu.",
      ],
    },
    {
      titulo: "Por quanto tempo guardamos",
      paragrafos: [
        "Enquanto sua conta existir. Seu histórico de treino só tem valor porque é longo: apagar o ano passado apagaria a sua evolução.",
        "Quando você pedir exclusão, apagamos tudo em até 30 dias — perfil, treinos e todas as séries registradas. Não guardamos cópia depois disso.",
      ],
    },
    {
      titulo: "Seus direitos",
      paragrafos: [
        "A LGPD te dá o direito de saber o que temos sobre você, corrigir o que estiver errado, pedir uma cópia, e pedir exclusão. Também de retirar o consentimento e de saber com quem compartilhamos.",
        "Boa parte disso você já faz sozinho no app: seu perfil e seu histórico estão todos lá, e o perfil é editável.",
        `Para o resto — cópia de tudo ou exclusão da conta —, peça ao seu personal ou escreva para ${OPERADOR.contato}. Respondemos em até 15 dias.`,
        "Se não ficar satisfeito, você pode reclamar à ANPD, a autoridade nacional de proteção de dados.",
      ],
    },
    {
      titulo: "Segurança",
      paragrafos: [
        "O acesso é por senha, e todo tráfego é cifrado. No banco, cada linha tem regra de quem pode ler e escrever, conferida pelo próprio banco a cada consulta — não por código de tela, que é onde esse tipo de regra costuma falhar.",
        "Nenhum sistema é perfeito. Se houver vazamento que possa te trazer risco, avisamos você e a ANPD.",
      ],
    },
    {
      titulo: "Menores de idade",
      paragrafos: [
        "O Reps Club é para maiores de 18 anos. Menor de 18 só pode usar com consentimento de quem tem a guarda, dado ao personal que o convida.",
      ],
    },
    {
      titulo: "Mudanças nesta política",
      paragrafos: [
        "Se mudarmos o que coletamos, para quê, com quem compartilhamos ou por quanto tempo guardamos, avisamos no app e pedimos seu aceite de novo. A data da versão fica no rodapé desta página, e guardamos o registro de qual versão você aceitou e quando.",
      ],
    },
  ],
};
