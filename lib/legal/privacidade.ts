import { OPERADOR, type Documento } from "./documentos";

/**
 * Política de privacidade — **rascunho para revisão do Otávio.**
 *
 * Escrita a partir do inventário real do banco, não de modelo genérico: cada
 * dado citado aqui existe como coluna ou como arquivo no Storage, e nada que
 * existe ficou de fora. Se o schema mudar, este texto muda junto.
 *
 * O tom é o do resto do produto: frase curta, sem "outrossim", sem parágrafo
 * que só existe para parecer jurídico. Quem lê é um aluno de academia no
 * celular, não um advogado.
 *
 * ---
 *
 * **Revisão de 14/09: o feed.** A versão anterior dizia, em duas seções, que
 * nenhum outro aluno vê nada seu — e isso deixou de ser verdade no instante em
 * que o aluno passou a poder publicar para a turma. Também dizia "nada além
 * disso" numa lista que não tinha foto. Foto de corpo é dado sensível, e uma
 * política que não a menciona é pior do que uma que a menciona mal.
 *
 * Três afirmações desta página são checáveis no código, e foram checadas antes
 * de serem escritas:
 * - o alcance do post é conferido pelo banco, inclusive para o arquivo da foto
 *   (`private.pode_ver_post` e a policy de `storage.objects`, migration 0018);
 * - a foto é reduzida e recodificada no aparelho (`lib/imagem.ts`), e a
 *   recodificação descarta os metadados da câmera — medido com um arquivo que
 *   tinha marcador plantado no lugar do GPS: não sobreviveu;
 * - o aluno apaga o próprio post pela tela do post, e o personal não apaga
 *   (`posts_delete`).
 */
export const PRIVACIDADE: Documento = {
  slug: "privacidade",
  titulo: "Política de privacidade",
  resumo:
    "O que o Reps Club guarda sobre você, para que serve, quem vê e como pedir para apagar.",
  secoes: [
    {
      titulo: "O resumo, em cinco linhas",
      paragrafos: [
        "Guardamos o que você informa no cadastro e o que você registra treinando. Isso serve para montar seu treino e mostrar sua evolução — nada mais.",
        "Seu personal vê os seus dados. Nenhum outro aluno vê o seu treino, o seu histórico, o seu perfil nem as suas medidas e fotos de reavaliação.",
        "**A exceção é o que você publica no feed**, e só ela: cada post tem a sua escolha de quem vê — só o seu personal, ou também os outros alunos dele. Nada do Reps Club vai para a internet aberta.",
        "Não vendemos nada para ninguém, não usamos seus dados para anúncio e não treinamos inteligência artificial com eles.",
        `Você pode apagar um post na hora, e pedir para ver, corrigir ou apagar tudo, a qualquer momento: ${OPERADOR.contato}.`,
      ],
    },
    {
      titulo: "Que dados coletamos",
      paragrafos: [
        "**Para criar sua conta:** nome, e-mail e senha. A senha é guardada cifrada, e nem nós conseguimos lê-la.",
        "**Que você informa no primeiro acesso:** data de nascimento, peso, altura, objetivo (ganhar massa, perder gordura, condicionamento ou saúde) e nível de experiência.",
        "**Que nasce do seu treino:** os treinos que seu personal montou para você, e, a cada série que você registra, a carga, as repetições, se você pulou a série, quando a sessão começou e terminou e quanto tempo durou.",
        "**Que você publica, se quiser:** foto, legenda e comentários no feed, mais o registro de quais posts você curtiu. Publicar é opcional do começo ao fim — dá para usar o Reps Club inteiro sem nunca abrir o feed.",
        "**Que você preenche na reavaliação, se quiser:** peso, percentual de gordura, medidas de braço, peito, cintura, quadril e coxa, uma observação sua, e até três fotos suas — de frente, de lado e de costas. Seu personal libera o formulário; preencher é escolha sua, campo por campo, e a reavaliação pode ser enviada sem nenhuma foto.",
        "**Nada além disso.** Não pedimos documento, endereço, telefone, cartão nem localização. Não usamos cookie de rastreamento, nem ferramenta de publicidade.",
      ],
    },
    {
      titulo: "Isso é dado de saúde",
      paragrafos: [
        "Peso, altura e data de nascimento, junto com o que você levanta, dizem coisas sobre seu corpo. Foto de treino, mais ainda. **As medidas e as fotos da reavaliação são o caso mais forte de todos**: são um retrato do seu corpo, feito para ser comparado com o de três meses atrás. A lei brasileira (LGPD) chama isso de **dado pessoal sensível** e exige cuidado maior — inclusive o seu consentimento explícito, que é o que você dá ao aceitar esta política no primeiro acesso.",
        "Consentimento dado é consentimento que pode ser retirado. Se você retirar, a conta é encerrada, porque sem esses dados o produto não tem o que fazer.",
      ],
    },
    {
      titulo: "A foto do feed",
      paragrafos: [
        "**Você escolhe quem vê, post por post**, e a escolha aparece na tela antes de publicar: “só o seu personal” ou “o seu personal e os outros alunos dele”. Não existe opção que mande a foto para fora disso. O Reps Club não tem perfil público, não tem link compartilhável e não aparece em busca.",
        "**Quem confere é o banco de dados, não a tela.** A permissão do arquivo da foto segue a mesma regra do post: quem não pode ver o post não consegue abrir a imagem, nem com o endereço dela na mão. A foto fica num armazenamento fechado e só é servida por um link temporário, emitido na hora para quem tem permissão.",
        "**A foto que sai do seu celular é uma cópia reduzida.** Antes de subir, o app diminui a imagem e a recodifica. Isso descarta os metadados que a câmera grava junto — **incluindo o local onde a foto foi tirada**, que nunca chega até nós. O arquivo original não sai do seu aparelho.",
        "**Você apaga quando quiser**, na própria tela do post. A foto sai do Reps Club e os comentários vão junto. Seu personal pode comentar no seu post, mas não pode apagá-lo.",
        "**Não usamos suas fotos para mais nada.** Não aparecem em divulgação, não são mostradas a outros personais, não alimentam nenhum modelo de inteligência artificial.",
        "Uma coisa que depende de você: publicar para a turma é publicar para pessoas reais, que podem ver a imagem na tela delas. Se um post é para ficar entre você e quem te treina, escolha “só o seu personal” — é o que já vem marcado.",
      ],
    },
    {
      titulo: "As fotos e as medidas da reavaliação",
      paragrafos: [
        "**Só você e o seu personal.** Nenhum outro aluno vê a sua reavaliação — nem as medidas, nem as fotos, nem a observação —, e não existe escolha de alcance aqui, ao contrário do feed. Reavaliação **nunca** vira post: são telas separadas, e nada passa de uma para a outra.",
        "**Quem confere é o banco de dados, não a tela.** As fotos ficam num armazenamento fechado, separado do armazenamento do feed, e só são servidas por um link temporário emitido na hora para você ou para o seu personal. Quem não é um dos dois não abre a imagem nem com o endereço dela na mão.",
        "**A foto que sai do seu celular é uma cópia reduzida**, como a do feed: o app diminui e recodifica a imagem antes de subir, o que descarta os metadados da câmera — **incluindo o local onde a foto foi tirada**. O arquivo original não sai do seu aparelho.",
        "**Você apaga as fotos quando quiser**, na própria tela da reavaliação, mesmo depois de enviada. Elas saem do Reps Club e o seu personal deixa de vê-las.",
        `**Os números, depois de enviados, ficam.** Peso, medidas e observação não mudam mais, e isso é de propósito: eles existem para ser comparados com a próxima reavaliação, e um valor reescrito depois de lido faria o seu personal acompanhar uma evolução que não aconteceu. Se você quiser apagar uma reavaliação inteira, é um pedido como outro qualquer: escreva para ${OPERADOR.contato}.`,
        "**Preencher é opcional, campo por campo.** Seu personal libera o formulário e vê o que você respondeu; ele não escreve medida nenhuma no seu lugar.",
      ],
    },
    {
      titulo: "Para que usamos",
      paragrafos: [
        "Para seu personal montar e ajustar seu treino. Para você ver seu histórico, seus recordes e sua evolução por exercício. Para o app saber qual treino sugerir hoje. Para mostrar no feed o que você publicou, para quem você escolheu. Para comparar a sua reavaliação com a anterior, e mostrar essa comparação a você e ao seu personal.",
        "Não usamos seus dados para nenhuma outra finalidade. Se um dia isso mudar, pediremos sua permissão de novo antes — não por um aviso escondido numa atualização.",
      ],
    },
    {
      titulo: "Quem vê seus dados",
      paragrafos: [
        "**Seu personal**, o mesmo que te convidou: vê seu perfil, seus treinos, todo o seu histórico de execução, as suas reavaliações — medidas e fotos — e tudo o que você publica no feed, inclusive os posts marcados como “só o seu personal”. É o ponto do produto — ele precisa disso para te treinar.",
        "**Os outros alunos do seu personal**, e apenas eles, veem os posts que você marcou para a turma: a foto, a legenda, os comentários e a contagem de curtidas. Nada mais seu: nem perfil, nem peso, nem treino, nem histórico, nem reavaliação. Você também vê os posts que eles marcaram para a turma.",
        "**Nenhum outro personal**, e nenhum aluno de fora da sua turma, vê qualquer coisa sua — inclusive os posts da turma. Isso não é promessa: é regra no banco de dados, conferida a cada consulta.",
        "**Quem opera o Reps Club**, para manter o serviço no ar e responder aos seus pedidos.",
        "**A Supabase**, empresa que hospeda o banco de dados e as fotos, e a **Vercel**, que hospeda o site. Elas armazenam os dados para que o serviço funcione; não os usam para nada próprio. O banco fica em região do Brasil (São Paulo).",
        "Você troca de personal? Quem te convida decide o vínculo, e o histórico vai junto — é seu.",
      ],
    },
    {
      titulo: "Por quanto tempo guardamos",
      paragrafos: [
        "Enquanto sua conta existir. Seu histórico de treino só tem valor porque é longo: apagar o ano passado apagaria a sua evolução.",
        "Post e foto ficam até você apagar o post. Apagou, saiu — junto com as curtidas e os comentários dele.",
        "As fotos da reavaliação ficam até você apagá-las, na tela da reavaliação. As medidas ficam enquanto a conta existir: é a série histórica que dá sentido à comparação.",
        "Quando você pedir exclusão da conta, apagamos tudo em até 30 dias — perfil, treinos, todas as séries registradas, seus posts, suas reavaliações e todas as suas fotos. Não guardamos cópia depois disso.",
      ],
    },
    {
      titulo: "Seus direitos",
      paragrafos: [
        "A LGPD te dá o direito de saber o que temos sobre você, corrigir o que estiver errado, pedir uma cópia, e pedir exclusão. Também de retirar o consentimento e de saber com quem compartilhamos.",
        "Boa parte disso você já faz sozinho no app: seu perfil e seu histórico estão todos lá, o perfil é editável, cada post tem o botão de apagar, e as fotos de cada reavaliação também.",
        `Para o resto — cópia de tudo ou exclusão da conta —, peça ao seu personal ou escreva para ${OPERADOR.contato}. Respondemos em até 15 dias.`,
        "Se não ficar satisfeito, você pode reclamar à ANPD, a autoridade nacional de proteção de dados.",
      ],
    },
    {
      titulo: "Segurança",
      paragrafos: [
        "O acesso é por senha, e todo tráfego é cifrado. No banco, cada linha tem regra de quem pode ler e escrever, conferida pelo próprio banco a cada consulta — não por código de tela, que é onde esse tipo de regra costuma falhar. As fotos seguem a mesma lógica: a permissão do arquivo do feed espelha a do post, e a da foto de reavaliação alcança só você e o seu personal.",
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
        "**Mudou em 14 de setembro de 2026:** o feed. Agora dá para publicar foto e legenda, escolhendo a cada post se aquilo fica só com o seu personal ou também com os outros alunos dele. Antes, nada seu era visível para outro aluno — e por isso pedimos seu aceite de novo.",
      ],
    },
  ],
};
