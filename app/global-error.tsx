"use client";

/**
 * Último recurso: erro no layout raiz, onde nem fonte nem CSS podem ter
 * carregado. Substitui o documento inteiro, então traz `<html>` e `<body>`
 * próprios — e por isso não usa nada de `components/`, que depende dos tokens
 * do `globals.css`.
 *
 * Estilo embutido de propósito. Esta é a única tela do produto onde hex solto
 * é a escolha certa: ela precisa funcionar mesmo quando o CSS não carregou.
 */
export default function ErroGlobal({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f7f6f4",
          color: "#16130f",
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          padding: "1.5rem",
          textAlign: "center",
        }}
      >
        <main style={{ maxWidth: "26rem" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "1.35rem",
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
          >
            O Reps Club travou
          </h1>
          <p
            style={{
              margin: "0.6rem 0 0",
              fontSize: "0.95rem",
              lineHeight: 1.55,
              color: "#55504a",
            }}
          >
            Foi uma falha nossa, não sua — e nada do que você registrou se
            perdeu. Tente de novo; se continuar, me avise com o código abaixo.
          </p>

          <button
            type="button"
            onClick={retry}
            style={{
              marginTop: "1.4rem",
              minHeight: "44px",
              padding: "0 1.3rem",
              border: "none",
              borderRadius: "11px",
              background: "#e5231f",
              color: "#fff",
              fontSize: "0.95rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Tentar de novo
          </button>

          {error.digest ? (
            <p
              style={{
                margin: "1.4rem 0 0",
                fontFamily: "ui-monospace, Menlo, monospace",
                fontSize: "0.68rem",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#837c74",
              }}
            >
              código {error.digest}
            </p>
          ) : null}
        </main>
      </body>
    </html>
  );
}
