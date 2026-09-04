"use client";

import { Dumbbell, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge, Button, Card } from "@/components/ui";
import { normalizarParaBusca } from "@/lib/domain/prescricao";
import type {
  ExercicioDisponivel,
  ExercicioProprio,
} from "@/lib/queries/exercicios";
import { EQUIPAMENTO, GRUPO_MUSCULAR } from "@/lib/rotulos";
import type { Enums } from "@/types/database";

import { DialogoDeExercicio } from "./dialogo-de-exercicio";
import { DialogoDeExclusao } from "./dialogo-de-exclusao";

type Linha = ExercicioDisponivel & { em_uso?: number };

export function TelaDeExercicios({
  catalogo,
  proprios,
}: {
  catalogo: ExercicioDisponivel[];
  proprios: ExercicioProprio[];
}) {
  const [termo, setTermo] = useState("");
  const [grupo, setGrupo] = useState<Enums<"muscle_group"> | "">("");
  const [equipamento, setEquipamento] = useState<Enums<"equipment"> | "">("");
  const [emEdicao, setEmEdicao] = useState<ExercicioProprio | null>(null);
  const [criando, setCriando] = useState(false);
  const [aExcluir, setAExcluir] = useState<ExercicioProprio | null>(null);

  // Os próprios primeiro: é o que o personal acabou de cadastrar e o que ele
  // vem conferir. O catálogo tem 117 itens e não muda.
  const lista = useMemo<Linha[]>(() => {
    const todos: Linha[] = [...proprios, ...catalogo];
    const busca = normalizarParaBusca(termo);

    return todos.filter((e) => {
      if (grupo && e.muscle_group !== grupo) return false;
      if (equipamento && e.equipment !== equipamento) return false;
      if (busca && !normalizarParaBusca(e.name).includes(busca)) return false;
      return true;
    });
  }, [catalogo, proprios, termo, grupo, equipamento]);

  const filtrando = Boolean(termo || grupo || equipamento);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="eyebrow text-ink-4">Exercícios</p>
          <h1 className="text-[28px] font-extrabold leading-[1.15] tracking-[-0.02em] text-ink">
            {catalogo.length + proprios.length} exercícios
          </h1>
          <p className="text-[13.5px] text-ink-3">
            O catálogo do Reps Club mais os seus. Os seus aparecem no editor de
            treino junto com o resto.
          </p>
        </div>
        <Button onClick={() => setCriando(true)}>
          <Plus size={16} aria-hidden />
          Novo exercício
        </Button>
      </header>

      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Buscar por nome"
          aria-label="Buscar exercício por nome"
          className="h-11 min-w-[220px] flex-1 rounded-input border-[1.5px] border-border bg-surface px-3.5 text-[14px] font-medium text-ink transition placeholder:font-normal placeholder:text-ink-5 focus:border-brand focus:ring-[3px] focus:ring-brand/15 focus:outline-none"
        />
        <select
          value={grupo}
          onChange={(e) => setGrupo(e.target.value as Enums<"muscle_group"> | "")}
          aria-label="Filtrar por grupo muscular"
          className="h-11 rounded-input border-[1.5px] border-border bg-surface px-3 text-[14px] font-medium text-ink focus:border-brand focus:outline-none"
        >
          <option value="">Todos os grupos</option>
          {Object.entries(GRUPO_MUSCULAR).map(([valor, rotulo]) => (
            <option key={valor} value={valor}>
              {rotulo}
            </option>
          ))}
        </select>
        <select
          value={equipamento}
          onChange={(e) =>
            setEquipamento(e.target.value as Enums<"equipment"> | "")
          }
          aria-label="Filtrar por equipamento"
          className="h-11 rounded-input border-[1.5px] border-border bg-surface px-3 text-[14px] font-medium text-ink focus:border-brand focus:outline-none"
        >
          <option value="">Todos os equipamentos</option>
          {Object.entries(EQUIPAMENTO).map(([valor, rotulo]) => (
            <option key={valor} value={valor}>
              {rotulo}
            </option>
          ))}
        </select>
      </div>

      {lista.length === 0 ? (
        <Card size="lg" className="max-w-xl space-y-2">
          <h2 className="text-[16px] font-extrabold tracking-[-0.02em] text-ink">
            Nada com esse filtro
          </h2>
          <p className="text-[14px] leading-[1.6] text-ink-3">
            Tente outro termo, ou cadastre esse exercício se a sua academia tem
            um aparelho que o catálogo não cobre.
          </p>
        </Card>
      ) : (
        <>
          <p className="eyebrow text-ink-4">
            {filtrando
              ? `${lista.length} de ${catalogo.length + proprios.length}`
              : `Seus: ${proprios.length} · Catálogo: ${catalogo.length}`}
          </p>

          <ul className="space-y-2">
            {lista.map((exercicio) => (
              <li
                key={`${exercicio.source}:${exercicio.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-surface px-4 py-3"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-[14.5px] font-semibold text-ink">
                      {exercicio.name}
                    </p>
                    {exercicio.source === "custom" && (
                      <Badge tone="brand">Seu</Badge>
                    )}
                  </div>
                  <p className="truncate text-[12.5px] text-ink-4">
                    {GRUPO_MUSCULAR[exercicio.muscle_group]} ·{" "}
                    {EQUIPAMENTO[exercicio.equipment]} ·{" "}
                    {exercicio.default_rest_seconds}s de descanso
                    {exercicio.is_bodyweight && " · peso corporal"}
                    {exercicio.is_unilateral && " · unilateral"}
                  </p>
                </div>

                {exercicio.source === "custom" ? (
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEmEdicao(exercicio as ExercicioProprio)}
                      aria-label={`Editar ${exercicio.name}`}
                      className="flex size-9 items-center justify-center rounded-button text-ink-4 transition hover:bg-canvas-sunken hover:text-ink-2"
                    >
                      <Pencil size={15} aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => setAExcluir(exercicio as ExercicioProprio)}
                      aria-label={`Excluir ${exercicio.name}`}
                      className="flex size-9 items-center justify-center rounded-button text-ink-4 transition hover:bg-danger-bg hover:text-danger"
                    >
                      <Trash2 size={15} aria-hidden />
                    </button>
                  </div>
                ) : (
                  <span
                    aria-label="Do catálogo do Reps Club"
                    title="Do catálogo do Reps Club"
                    className="flex size-9 shrink-0 items-center justify-center text-ink-5"
                  >
                    <Dumbbell size={15} aria-hidden />
                  </span>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      <DialogoDeExercicio
        aberto={criando || emEdicao !== null}
        exercicio={emEdicao}
        aoFechar={() => {
          setCriando(false);
          setEmEdicao(null);
        }}
      />

      <DialogoDeExclusao
        exercicio={aExcluir}
        aoFechar={() => setAExcluir(null)}
      />
    </div>
  );
}
