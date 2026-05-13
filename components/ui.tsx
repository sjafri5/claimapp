"use client";

import React from "react";

/* ------------------------------------------------------------------ */
/*  Design tokens (inline)                                             */
/* ------------------------------------------------------------------ */
const T = {
  paper: "#efe7d4",
  card: "#fffbf0",
  ink: "#3a342b",
  inkSoft: "#6b5f4d",
  sage: "#9bb08a",
  sageD: "#6f8a5e",
  rose: "#c98a8a",
  ochre: "#d4a83c",
  rule: "#b8a784",
};

const FONT = {
  body: "'Cormorant Garamond', Georgia, serif",
  hand: "'Homemade Apple', cursive",
  label: "'Caveat', cursive",
};

const GRAIN_BG = `radial-gradient(circle, rgba(58,52,43,.04) 1px, transparent 1.4px)`;

/* ------------------------------------------------------------------ */
/*  Button                                                             */
/* ------------------------------------------------------------------ */
export function Button({
  children,
  onClick,
  disabled,
  variant = "primary",
  type = "button",
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  type?: "button" | "submit";
  className?: string;
}) {
  if (variant === "secondary") {
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={className}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          border: `1.5px solid ${T.ink}`,
          borderRadius: 30,
          padding: "10px 24px",
          fontFamily: FONT.label,
          fontSize: 18,
          color: T.ink,
          background: "transparent",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
          transition: "background .2s, color .2s",
          width: className.includes("w-full") ? "100%" : undefined,
          textDecoration: "none",
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            (e.currentTarget as HTMLButtonElement).style.background = T.ink;
            (e.currentTarget as HTMLButtonElement).style.color = T.card;
          }
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          (e.currentTarget as HTMLButtonElement).style.color = T.ink;
        }}
      >
        {children}
      </button>
    );
  }

  if (variant === "ghost") {
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={className}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
          border: "none",
          fontFamily: FONT.body,
          fontSize: 15,
          color: T.inkSoft,
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
          padding: "8px 16px",
          textDecoration: "underline",
          textDecorationStyle: "wavy" as const,
          textDecorationColor: T.sage,
          width: className.includes("w-full") ? "100%" : undefined,
        }}
      >
        {children}
      </button>
    );
  }

  // primary — double-frame CTA
  return (
    <span
      style={{
        display: className.includes("w-full") ? "block" : "inline-block",
        border: `1px solid ${T.ink}`,
        padding: 6,
        lineHeight: 1,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        width: className.includes("w-full") ? "100%" : undefined,
        boxSizing: "border-box",
      }}
    >
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={className}
        style={{
          display: "block",
          width: "100%",
          background: T.ink,
          color: T.card,
          textTransform: "uppercase",
          letterSpacing: "1.5px",
          fontFamily: FONT.body,
          fontWeight: 600,
          fontSize: 15,
          padding: "14px 36px",
          borderRadius: 0,
          border: "none",
          cursor: disabled ? "not-allowed" : "pointer",
          boxSizing: "border-box",
        }}
      >
        {children}
      </button>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Input                                                              */
/* ------------------------------------------------------------------ */
export function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  className = "",
}: {
  label?: string;
  type?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  error?: string;
  className?: string;
}) {
  return (
    <div className={className} style={{ marginBottom: 4 }}>
      {label && (
        <label
          style={{
            display: "block",
            fontFamily: FONT.label,
            fontSize: 18,
            color: T.inkSoft,
            marginBottom: 6,
          }}
        >
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          display: "block",
          width: "100%",
          border: `1px solid ${T.rule}`,
          borderRadius: 0,
          padding: "12px 14px",
          fontFamily: FONT.body,
          fontSize: 16,
          color: T.ink,
          background: T.card,
          outline: "none",
          boxSizing: "border-box",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = T.sageD;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = T.rule;
        }}
      />
      {error && (
        <p
          style={{
            fontFamily: FONT.label,
            fontSize: 15,
            color: T.rose,
            marginTop: 6,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Card (double-frame)                                                */
/* ------------------------------------------------------------------ */
export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        position: "relative",
        border: `1px solid ${T.rule}`,
        background: T.card,
        padding: 32,
        borderRadius: 0,
      }}
    >
      {/* inner frame */}
      <div
        style={{
          position: "absolute",
          inset: 6,
          border: `1px solid ${T.rule}`,
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative" }}>{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PageContainer (kraft paper bg + grain)                             */
/* ------------------------------------------------------------------ */
export function PageContainer({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const maxW = className.includes("max-w-2xl")
    ? 672
    : className.includes("max-w-lg")
      ? 512
      : 448;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: T.paper,
        backgroundImage: GRAIN_BG,
        backgroundSize: "3px 3px",
        color: T.ink,
        padding: "48px 16px",
      }}
    >
      <div
        style={{
          maxWidth: maxW,
          margin: "0 auto",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Logo                                                               */
/* ------------------------------------------------------------------ */
export function Logo() {
  return (
    <div
      style={{
        fontFamily: FONT.hand,
        fontSize: 32,
        color: T.ink,
      }}
    >
      claim<span style={{ color: T.sageD }}>.</span>app
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Checkbox (journal style)                                           */
/* ------------------------------------------------------------------ */
export function Checkbox({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      style={{
        display: "flex",
        cursor: "pointer",
        alignItems: "flex-start",
        gap: 12,
        border: `1px solid ${checked ? T.sageD : T.rule}`,
        borderRadius: 0,
        padding: "12px 14px",
        background: checked ? "rgba(155,176,138,.1)" : T.card,
        transition: "border-color .15s, background .15s",
      }}
      onMouseEnter={(e) => {
        if (!checked) {
          e.currentTarget.style.borderColor = T.sage;
        }
      }}
      onMouseLeave={(e) => {
        if (!checked) {
          e.currentTarget.style.borderColor = T.rule;
        }
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{
          marginTop: 3,
          width: 18,
          height: 18,
          accentColor: T.sageD,
          flexShrink: 0,
        }}
      />
      <div>
        <div
          style={{
            fontFamily: FONT.body,
            fontWeight: 600,
            fontSize: 16,
            color: T.ink,
            lineHeight: 1.3,
          }}
        >
          {label}
        </div>
        {description && (
          <div
            style={{
              fontFamily: FONT.label,
              fontSize: 15,
              color: T.inkSoft,
              marginTop: 2,
              lineHeight: 1.3,
            }}
          >
            {description}
          </div>
        )}
      </div>
    </label>
  );
}
