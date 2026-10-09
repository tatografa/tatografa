import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { BotaoSair } from "@/components/botao-sair";
import { CardDoPersonal } from "@/components/aluno/card-do-personal";
import { EscolhaDeIdioma } from "@/components/escolha-de-idioma";
import { Card } from "@/components/ui";
import { requireStudent } from "@/lib/auth/session";
import { textosDoApp } from "@/lib/i18n/app/servidor";
import { preencher } from "@/lib/i18n/texto";

import { fotoDe, urlDoAvatar } from "@/lib/queries/avatar";

import { FormularioDePerfil } from "./formulario-de-perfil";
import { FotoDePerfil } from "./foto-de-perfil";

/**
 * Perfil do aluno: ver, **corrigir** e sair.
 *
 * Nasceu (M1) só com o **sair**, porque até o primeiro teste de campo o app do
 * aluno não tinha saída nenhuma: o proxy devolve todo usuário logado que abre
 * `/entrar`, `/cadastro` ou `/acesso` para a sua própria área, e quem entrava
 * como aluno ficava preso até limpar os cookies. Num produto usado em celular
 * emprestado na academia, isso não é detalhe.
 *
 * A **edição** entrou depois, e não por pedido de tela: a política de
 * privacidade publicada promete, em "Seus direitos", que o perfil é editável —
 * corrigir dado errado sobre si é direito da LGPD. A tela só de leitura fazia
 * dessa frase uma promessa vazia. O peso, além disso, muda com o tempo, e é
 * dele que o personal parte para montar o treino.
 */
export default async function PerfilDoAluno() {
  const [{ student, personal }, { idioma, t }] = await Promise.all([
    requireStudent(),
    textosDoApp(),
  ]);
  const [avatarUrl, fotoDoPersonal] = await Promise.all([
    urlDoAvatar(student.avatar_path),
    fotoDe(personal.id),
  ]);
  const p = t.perfil.perfil;

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="truncate text-[21px] font-extrabold tracking-[-0.02em] text-ink">
          {student.name}
        </h1>
        <p className="truncate text-[13px] text-ink-4">
          {preencher(p.treinaCom, { nome: personal.name })}
        </p>
      </header>

      <Card>
        <FotoDePerfil nome={student.name} avatarUrl={avatarUrl} />
      </Card>

      <Card>
        <FormularioDePerfil aluno={student} />
      </Card>

      {/*
        O card do personal (doc 05 §11). O botão de WhatsApp é o único canal do
        aluno para falar com quem o treina — o app não tem mensagem, e nem
        deveria ter: a conversa já acontece onde essas duas pessoas se falam.

        `trainers.phone` existe desde a primeira migration e ficou vazia até
        agora, porque nenhuma tela do painel pedia o número. Sem o formulário em
        /painel/configuracoes, este botão nunca apareceria para ninguém — e é
        por isso que o personal sem número informado não vira um botão quebrado,
        vira card sem botão.
      */}
      <CardDoPersonal
        nome={personal.name}
        foto={fotoDoPersonal}
        telefone={personal.phone}
        rotulo={t.comum.cardDoPersonal.seuPersonal}
      />

      {/*
        A porta da reavaliação (doc 05, tela 11: "acesso à reavaliação e às
        configurações"). Fica no perfil, e não na bottom nav: a nav tem quatro
        abas e são as quatro coisas do dia a dia — reavaliação acontece uma vez
        por ciclo. Quando há uma esperando, a home é que avisa.
      */}
      <Link
        href="/app/reavaliacao"
        className="flex items-center justify-between gap-3 rounded-card border border-border-soft bg-surface px-4 py-3.5 transition hover:border-border-strong"
      >
        <span className="min-w-0">
          <span className="block text-[13.5px] font-semibold text-ink">
            {p.reavaliacao}
          </span>
          <span className="block text-[11.5px] text-ink-4">
            {p.reavaliacaoApoio}
          </span>
        </span>
        <ChevronRight size={16} className="shrink-0 text-ink-5" aria-hidden />
      </Link>

      {/*
        O idioma do app (etapa 2 da tradução, pedido do Otávio): mora aqui, e
        não num seletor no topo de cada tela, porque é configuração — se escolhe
        uma vez. Fica antes do "Sair" porque é o último ajuste da conta, e o
        sair é o fim da tela.
      */}
      <Card className="space-y-1">
        <h2 className="text-[13.5px] font-semibold text-ink">{p.idioma}</h2>
        <p className="text-[11.5px] text-ink-4">{p.idiomaApoio}</p>
        <EscolhaDeIdioma idioma={idioma} rotulo={p.idioma} caminho="/app/perfil" />
      </Card>

      <Card className="space-y-3">
        <p className="text-[13px] leading-[1.6] text-ink-3">{p.sairTexto}</p>
        <BotaoSair
          variant="danger"
          size="md"
          block
          rotulo={t.comum.sair.rotulo}
          rotuloSaindo={t.comum.sair.saindo}
        />
      </Card>
    </div>
  );
}
