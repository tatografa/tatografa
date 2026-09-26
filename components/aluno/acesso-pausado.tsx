import { History, Lock, User } from "lucide-react";
import Link from "next/link";

import { CardDoPersonal } from "@/components/aluno/card-do-personal";
import type { Personal } from "@/lib/auth/session";

/**
 * O que o aluno inativo vê no lugar do app (decisão do Otávio, 26/09).
 *
 * **Não diz "arquivado" nem "inativo".** São palavras do painel do personal —
 * do lado de cá elas soam como punição e não explicam nada. "Pausado" diz o
 * que é: interrompido, reversível, e com um caminho de volta.
 *
 * **Não diz por que foi pausado.** O produto não sabe: não há cobrança no
 * modelo de dados, e chutar "sua mensalidade venceu" seria inventar um fato
 * sobre a vida de alguém. Quem sabe é o personal, e é para ele que o botão
 * aponta.
 *
 * **Não é beco sem saída.** As duas coisas que continuam acessíveis aparecem
 * aqui como link, porque tela que tranca sem mostrar a porta aberta faz o
 * usuário achar que perdeu tudo — e o histórico dele não foi apagado nem vai
 * ser. É também o que mantém a política de privacidade verdadeira: ela promete
 * que o perfil e o histórico estão no app.
 */
export function AcessoPausado({ personal }: { personal: Personal }) {
  return (
    <div className="space-y-5 py-6">
      <header className="space-y-3 text-center">
        <span
          aria-hidden
          className="mx-auto flex size-12 items-center justify-center rounded-full bg-canvas-sunken text-ink-3"
        >
          <Lock size={20} />
        </span>
        <h1 className="text-[21px] font-extrabold leading-tight tracking-[-0.02em] text-ink">
          Seu acesso está pausado
        </h1>
        <p className="text-[13.5px] leading-relaxed text-ink-3">
          Enquanto isso você não consegue abrir treinos, registrar séries nem ver
          o feed da turma. <strong className="font-semibold text-ink-2">Nada
          foi apagado:</strong> seu histórico e seus recordes continuam aqui,
          esperando você voltar.
        </p>
      </header>

      {/*
        O card é o mesmo do perfil, e não uma cópia com outro texto: é a mesma
        pessoa, o mesmo botão e a mesma regra de "sem número não vira botão
        quebrado". Duas versões divergiriam no dia em que o número mudar de
        formato.
      */}
      <section className="space-y-2">
        <h2 className="eyebrow text-ink-4">Fale com quem te treina</h2>
        <CardDoPersonal nome={personal.name} telefone={personal.phone} />
        {/*
          Sem número cadastrado o card perde o botão — e nesta tela, cujo
          assunto inteiro é "fale com ele", isso viraria beco sem saída. A
          frase muda para dizer que o caminho existe fora do app, que é a
          verdade: essas duas pessoas se conhecem, e o WhatsApp aqui é atalho,
          não o único canal. Achado no screenshot dos dois estados lado a lado.
        */}
        <p className="text-[12px] leading-relaxed text-ink-4">
          É {personal.name.split(" ")[0]} quem reativa o seu acesso.
          {personal.phone
            ? null
            : " Ele ainda não cadastrou um WhatsApp aqui — procure-o pelo canal de sempre."}
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="eyebrow text-ink-4">O que continua aberto</h2>
        <ul className="space-y-2">
          <Porta
            href="/app/historico"
            Icone={History}
            titulo="Seu histórico"
            apoio="Cada treino que você fez, série por série."
          />
          <Porta
            href="/app/perfil"
            Icone={User}
            titulo="Seu perfil"
            apoio="Seus dados, e você pode corrigi-los quando quiser."
          />
        </ul>
      </section>
    </div>
  );
}

function Porta({
  href,
  Icone,
  titulo,
  apoio,
}: {
  href: string;
  Icone: React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
  titulo: string;
  apoio: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex min-h-[60px] items-center gap-3 rounded-card border border-border bg-surface px-4 py-3 transition hover:border-border-strong hover:bg-canvas-sunken"
      >
        <Icone size={17} aria-hidden />
        <span className="min-w-0">
          <span className="block text-[14px] font-bold text-ink">{titulo}</span>
          <span className="block text-[12px] text-ink-4">{apoio}</span>
        </span>
      </Link>
    </li>
  );
}
