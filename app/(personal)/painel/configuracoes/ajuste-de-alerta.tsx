"use client";

import { useActionState, useState } from "react";
import { Pencil } from "lucide-react";

import { usePainel } from "@/components/personal/idioma-do-painel";
import { Button, Input } from "@/components/ui";
import { LIMITES_DO_ALERTA } from "@/lib/domain/atencao";
import { plural, preencher } from "@/lib/i18n/texto";

import {
  salvarConfiguracoes,
  type EstadoDasConfiguracoes,
} from "./actions";

const INICIAL: EstadoDasConfiguracoes = {};

/**
 * O ajuste do limiar de inatividade, em **modo leitura com botão "Editar"**
 * (doc 06).
 *
 * Modo leitura por padrão porque esta é uma tela de conferir, não de preencher:
 * o personal entra aqui para ver como está configurado, e um formulário sempre
 * aberto convida ao toque acidental num número que muda quem aparece como
 * problema no painel.
 */
export function AjusteDeAlerta({ dias }: { dias: number }) {
  const [estado, acao, enviando] = useActionState(salvarConfiguracoes, INICIAL);
  const [editando, setEditando] = useState(false);
  const { t } = usePainel();
  const a = t.configuracoes.alerta;

  // Fecha quando a ação confirma. Ajuste durante a renderização, não em efeito:
  // é o padrão que o projeto usa desde o onboarding do aluno.
  const [ultimoEstado, setUltimoEstado] = useState(estado);
  if (estado !== ultimoEstado) {
    setUltimoEstado(estado);
    if (estado.sucesso) setEditando(false);
  }

  if (!editando) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[15px] font-bold text-ink">
            {plural(dias, t.comum.dias)}
          </p>
          <p className="mt-1 text-[13px] leading-[1.6] text-ink-3">{a.explicacao}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setEditando(true)}>
          <Pencil size={15} aria-hidden />
          {t.comum.editar}
        </Button>
      </div>
    );
  }

  return (
    <form action={acao} noValidate className="space-y-4">
      <Input
        label={a.rotulo}
        name="dias"
        type="number"
        inputMode="numeric"
        min={LIMITES_DO_ALERTA.minimo}
        max={LIMITES_DO_ALERTA.maximo}
        autoFocus
        defaultValue={estado.campos?.dias ?? String(dias)}
        error={estado.errosPorCampo?.dias}
        hint={preencher(a.apoio, { min: LIMITES_DO_ALERTA.minimo, max: LIMITES_DO_ALERTA.maximo })}
      />

      {estado.erro && (
        <p
          role="alert"
          className="rounded-[9px] bg-danger-bg px-3 py-2.5 text-[12.5px] font-semibold text-danger"
        >
          {estado.erro}
        </p>
      )}

      <div className="flex gap-2.5">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setEditando(false)}
        >
          {t.comum.cancelar}
        </Button>
        <Button type="submit" size="sm" disabled={enviando}>
          {enviando ? t.comum.salvando : t.comum.salvar}
        </Button>
      </div>
    </form>
  );
}
