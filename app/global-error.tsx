"use client";

import { useEffect } from "react";

const T = {
  paper: "#efe7d4",
  card: "#fffbf0",
  ink: "#3a342b",
  inkSoft: "#6b5f4d",
  sage: "#6f8a5e",
  rule: "#b8a784",
};

const FONT = {
  body: "'Cormorant Garamond', Georgia, serif",
  hand: "'Homemade Apple', cursive",
};

const GRAIN_BG =
  "radial-gradient(circle, rgba(58,52,43,.04) 1px, transparent 1.4px)";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=Homemade+Apple&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0 }}>
        <div
          style={{
            minHeight: "100vh",
            backgroundColor: T.paper,
            backgroundImage: GRAIN_BG,
            backgroundSize: "3px 3px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FONT.body,
            color: T.ink,
            padding: "2rem",
          }}
        >
          <div
            style={{
              backgroundColor: T.card,
              border: `1px solid ${T.rule}`,
              borderRadius: "12px",
              padding: "3rem 2.5rem",
              maxWidth: "420px",
              width: "100%",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontFamily: FONT.hand,
                fontSize: "1.5rem",
                marginBottom: "1.5rem",
              }}
            >
              claim<span style={{ color: T.sage }}>.</span>app
            </p>

            <h1
              style={{
                fontFamily: FONT.body,
                fontSize: "2rem",
                fontWeight: 500,
                marginBottom: "0.75rem",
              }}
            >
              Something went wrong
            </h1>

            <p
              style={{
                color: T.inkSoft,
                fontSize: "1.1rem",
                lineHeight: 1.5,
                marginBottom: "2rem",
              }}
            >
              An unexpected error occurred. Please try again.
            </p>

            <button
              onClick={() => reset()}
              style={{
                backgroundColor: T.sage,
                color: T.card,
                fontFamily: FONT.body,
                fontSize: "1.05rem",
                fontWeight: 500,
                padding: "0.65rem 1.8rem",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                transition: "opacity .15s",
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
