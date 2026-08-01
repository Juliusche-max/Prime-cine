"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="fr">
      <body style={{ background: "#0A0A0A", color: "#F5F5F0", fontFamily: "sans-serif" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "1.75rem", fontWeight: 600, marginBottom: "0.75rem" }}>
            Prime Ciné a rencontré une erreur critique
          </h1>
          <p style={{ color: "#A3A3A0", marginBottom: "2rem", maxWidth: 480 }}>
            Veuillez rafraîchir la page. Si le problème persiste, revenez plus tard.
          </p>
          <button
            onClick={() => reset()}
            style={{
              background: "#E4142D",
              color: "white",
              padding: "0.75rem 1.75rem",
              borderRadius: 6,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}
