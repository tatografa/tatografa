/**
 * Formato de identificador, para a rota não virar erro 500.
 *
 * Um id que não é uuid faz o Postgres estourar `22P02` em vez de devolver
 * vazio — e o id vem da URL, que qualquer um edita. A checagem é de **formato**,
 * não de existência: quem decide se aquele id existe (e se quem pede pode
 * vê-lo) continua sendo a consulta e o RLS.
 *
 * Deliberadamente mais frouxo que `z.string().uuid()` do zod v4, que confere os
 * bits de versão e variante do RFC: aqui só interessa que o cast não estoure.
 */
export function pareceUuid(valor: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    valor,
  );
}
