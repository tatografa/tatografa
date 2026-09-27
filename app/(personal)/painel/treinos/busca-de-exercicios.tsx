"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Search, X } from "lucide-react";

import { Dialog, Input, Select } from "@/components/ui";
import type { ExercicioDisponivel } from "@/lib/queries/exercicios";
import { EQUIPAMENTO, GRUPO_MUSCULAR } from "@/lib/rotulos";
import type { Enums } from "@/types/database";

import { buscarExerciciosAction } from "./actions";

/**
 * A busca do catálogo, aberta pelo "Adicionar exercício" de cada cartão.
 *
 * Um diálogo só para a tela inteira, e não um por cartão: o personal adiciona
 * a um treino por vez, e sete diálogos montados seriam sete buscas esperando.
 */
export function BuscaDeExercicios({
  aberto,
  aoFechar,
  aoEscolher,
  titulo = "Adicionar exercício",
}: {
  aberto: boolean;
  aoFechar: () => void;
  aoEscolher: (exercicio: ExercicioDisponivel) => void;
  titulo?: string;
}) {
  const [termo, setTermo] = useState("");
  const [grupo, setGrupo] = useState("");
  const [equipamento, setEquipamento] = useState("");
  const [resultados, setResultados] = useState<ExercicioDisponivel[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [falhou, setFalhou] = useState(false);
  const requisicao = useRef(0);

  useEffect(() => {
    if (!aberto) return;

    // Espera o personal parar de digitar antes de consultar: sem isso, cada
    // tecla vira uma ida ao servidor.
    const id = setTimeout(async () => {
      const minha = ++requisicao.current;
      setCarregando(true);
      try {
        const lista = await buscarExerciciosAction({
          termo: termo || undefined,
          grupo: (grupo || undefined) as Enums<"muscle_group"> | undefined,
          equipamento: (equipamento || undefined) as Enums<"equipment"> | undefined,
        });
        // Resposta de uma busca antiga chegando depois da nova sobrescreveria
        // a lista certa com a errada.
        if (minha !== requisicao.current) return;
        setResultados(lista);
        setFalhou(false);
      } catch {
        if (minha !== requisicao.current) return;
        setFalhou(true);
      } finally {
        if (minha === requisicao.current) setCarregando(false);
      }
    }, 250);

    return () => clearTimeout(id);
  }, [aberto, termo, grupo, equipamento]);

  return (
    <Dialog
      aberto={aberto}
      aoFechar={aoFechar}
      titulo={titulo}
      descricao="Busque pelo nome ou filtre por grupo e equipamento."
      className="max-w-[560px]"
    >
      {/* O <dialog> nativo não usa portal: se um dia este diálogo morar dentro
          de um <form>, Enter no campo de busca dispararia o envio implícito no
          meio da escolha do exercício. */}
      <div
        className="space-y-4"
        onKeyDown={(evento) => {
          const alvo = evento.target as HTMLElement;
          const ehCampo = alvo.tagName === "INPUT" || alvo.tagName === "SELECT";
          if (evento.key === "Enter" && ehCampo) evento.preventDefault();
        }}
      >
        <div className="relative">
          <Search
            size={16}
            aria-hidden
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-4"
          />
          <Input
            aria-label="Buscar exercício"
            placeholder="Supino, remada, agachamento…"
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            className="pl-10"
            autoFocus
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Select
            aria-label="Grupo muscular"
            value={grupo}
            onChange={(e) => setGrupo(e.target.value)}
          >
            <option value="">Todos os grupos</option>
            {Object.entries(GRUPO_MUSCULAR).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>
                {rotulo}
              </option>
            ))}
          </Select>
          <Select
            aria-label="Equipamento"
            value={equipamento}
            onChange={(e) => setEquipamento(e.target.value)}
          >
            <option value="">Todos os equipamentos</option>
            {Object.entries(EQUIPAMENTO).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>
                {rotulo}
              </option>
            ))}
          </Select>
        </div>

        <div className="max-h-[320px] overflow-y-auto rounded-card border border-border">
          {falhou ? (
            <p className="px-4 py-6 text-center text-[13px] font-semibold text-danger">
              Não deu para buscar agora. Tente de novo.
            </p>
          ) : carregando && resultados.length === 0 ? (
            <p className="px-4 py-6 text-center text-[13px] text-ink-4">Buscando…</p>
          ) : resultados.length === 0 ? (
            <p className="px-4 py-6 text-center text-[13px] text-ink-4">
              Nenhum exercício com esse filtro.
            </p>
          ) : (
            <ul className="divide-y divide-border-soft">
              {resultados.map((exercicio) => (
                <li key={`${exercicio.source}:${exercicio.id}`}>
                  <button
                    type="button"
                    onClick={() => aoEscolher(exercicio)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-canvas-sunken"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[14px] font-semibold text-ink">
                        {exercicio.name}
                      </span>
                      <span className="block truncate text-[12px] text-ink-4">
                        {GRUPO_MUSCULAR[exercicio.muscle_group]} ·{" "}
                        {EQUIPAMENTO[exercicio.equipment]}
                        {exercicio.source === "custom" ? " · seu exercício" : ""}
                      </span>
                    </span>
                    <Plus size={16} aria-hidden className="shrink-0 text-ink-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="button"
          onClick={aoFechar}
          className="flex w-full items-center justify-center gap-1.5 text-[13px] font-semibold text-ink-4 transition hover:text-ink-2"
        >
          <X size={14} aria-hidden /> Fechar
        </button>
      </div>
    </Dialog>
  );
}
