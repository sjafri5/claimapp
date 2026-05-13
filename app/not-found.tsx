import Link from "next/link";

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

export default function NotFound() {
  return (
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
          Page not found
        </h1>

        <p
          style={{
            color: T.inkSoft,
            fontSize: "1.1rem",
            lineHeight: 1.5,
            marginBottom: "2rem",
          }}
        >
          The page you&rsquo;re looking for doesn&rsquo;t exist.
        </p>

        <Link
          href="/"
          style={{
            display: "inline-block",
            backgroundColor: T.sage,
            color: T.card,
            fontFamily: FONT.body,
            fontSize: "1.05rem",
            fontWeight: 500,
            padding: "0.65rem 1.8rem",
            borderRadius: "8px",
            textDecoration: "none",
            transition: "opacity .15s",
          }}
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
