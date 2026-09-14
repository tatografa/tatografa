import { z } from "zod";

/**
 * As regras dos campos do perfil do aluno, num lugar só.
 *
 * Os mesmos cinco campos são preenchidos no onboarding (`/convite/[token]`) e
 * editados depois em `/app/perfil`. Duas cópias do mesmo `z.object` divergem na
 * primeira vez que uma mudar — e a que ficaria para trás é justamente a da
 * edição, que é usada menos vezes.
 *
 * Módulo neutro de propósito: zod puro, sem banco e sem React, então tanto a
 * Server Action do onboarding quanto a do perfil importam daqui.
 */

/** Idade aceita. Menor de 12 é erro de digitação; acima de 100 também. */
const IDADE_MINIMA = 12;
const IDADE_MAXIMA = 100;

export const nomeDoAluno = z
  .string()
  .trim()
  .min(2, "Informe seu nome.")
  .max(80, "O nome pode ter até 80 caracteres.");

export const objetivoDoAluno = z.enum(
  ["massa", "gordura", "condicionamento", "saude"],
  { error: "Escolha um objetivo." },
);

export const nivelDoAluno = z.enum(
  ["iniciante", "intermediario", "avancado"],
  { error: "Escolha seu nível." },
);

export const nascimentoDoAluno = z
  .string()
  .min(1, "Informe sua data de nascimento.")
  .refine((valor) => {
    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return false;
    const anos = (Date.now() - data.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    return anos >= IDADE_MINIMA && anos <= IDADE_MAXIMA;
  }, "Data de nascimento inválida.");

/*
 * Os limites de peso e altura são os mesmos das constraints de `students`
 * (migration 0006). O banco é quem decide; isto existe para a mensagem sair em
 * português e no campo certo, antes de a requisição partir.
 */
export const pesoDoAluno = z.coerce
  .number({ error: "Informe seu peso." })
  .gt(0, "Informe seu peso.")
  .lt(500, "Peso inválido.");

export const alturaDoAluno = z.coerce
  .number({ error: "Informe sua altura." })
  .gt(0, "Informe sua altura.")
  .lt(300, "Altura inválida.");

/** Os campos que o aluno edita depois — sem senha, sem termos, sem e-mail. */
export const esquemaDoPerfil = z.object({
  nome: nomeDoAluno,
  objetivo: objetivoDoAluno,
  nivel: nivelDoAluno,
  nascimento: nascimentoDoAluno,
  peso: pesoDoAluno,
  altura: alturaDoAluno,
});

export type CampoDoPerfil = keyof z.infer<typeof esquemaDoPerfil>;
