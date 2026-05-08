import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  SVG helpers (inline so the page stays a single server component)  */
/* ------------------------------------------------------------------ */

function SquiggleUnderline({ color = "#6f8a5e", width = 120 }: { color?: string; width?: number }) {
  return (
    <svg
      width={width}
      height="8"
      viewBox={`0 0 ${width} 8`}
      fill="none"
      style={{ display: "block", margin: "0 auto" }}
    >
      <path
        d={`M0 4 Q ${width * 0.125} 0, ${width * 0.25} 4 T ${width * 0.5} 4 T ${width * 0.75} 4 T ${width} 4`}
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}

function WavyUnderlineSVG() {
  return (
    <svg
      width="200"
      height="8"
      viewBox="0 0 200 8"
      fill="none"
      style={{ position: "absolute", bottom: "-6px", left: "50%", transform: "translateX(-50%)" }}
    >
      <path
        d="M0 4 Q 25 0, 50 4 T 100 4 T 150 4 T 200 4"
        stroke="#6f8a5e"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}

function BotanicalCorner({ style }: { style: React.CSSProperties }) {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      style={{ position: "absolute", opacity: 0.25, ...style }}
    >
      <path
        d="M5 75 Q 5 40, 20 25 Q 30 15, 45 10 Q 35 20, 30 35 Q 25 50, 28 65"
        stroke="#3a342b"
        strokeWidth="1"
        fill="none"
      />
      <path
        d="M10 70 Q 15 50, 25 40 Q 32 33, 40 28"
        stroke="#3a342b"
        strokeWidth="0.8"
        fill="none"
      />
      <ellipse cx="45" cy="10" rx="4" ry="7" fill="none" stroke="#3a342b" strokeWidth="0.8" transform="rotate(-30 45 10)" />
      <ellipse cx="40" cy="28" rx="3" ry="5" fill="none" stroke="#3a342b" strokeWidth="0.8" transform="rotate(-15 40 28)" />
    </svg>
  );
}

function StepIcon({ step }: { step: 1 | 2 | 3 }) {
  if (step === 1)
    return (
      <svg width="90" height="90" viewBox="0 0 90 90" fill="none">
        <rect x="15" y="10" width="60" height="70" rx="2" stroke="#3a342b" strokeWidth="1.2" fill="none" />
        <rect x="20" y="15" width="50" height="60" rx="1" stroke="#b8a784" strokeWidth="0.8" strokeDasharray="3 2" fill="none" />
        <line x1="28" y1="30" x2="62" y2="30" stroke="#3a342b" strokeWidth="0.8" />
        <line x1="28" y1="38" x2="55" y2="38" stroke="#b8a784" strokeWidth="0.6" />
        <line x1="28" y1="46" x2="58" y2="46" stroke="#b8a784" strokeWidth="0.6" />
        <line x1="28" y1="54" x2="50" y2="54" stroke="#b8a784" strokeWidth="0.6" />
        <circle cx="35" cy="22" r="3" fill="#9bb08a" opacity="0.5" />
      </svg>
    );
  if (step === 2)
    return (
      <svg width="90" height="90" viewBox="0 0 90 90" fill="none">
        <rect x="12" y="20" width="66" height="50" rx="2" stroke="#3a342b" strokeWidth="1.2" fill="none" />
        <polyline points="12,20 45,50 78,20" stroke="#3a342b" strokeWidth="1" fill="none" />
        <polyline points="12,70 35,50" stroke="#b8a784" strokeWidth="0.6" fill="none" />
        <polyline points="78,70 55,50" stroke="#b8a784" strokeWidth="0.6" fill="none" />
        <circle cx="65" cy="25" r="8" fill="#c98a8a" opacity="0.3" />
        <text x="65" y="28" textAnchor="middle" fontSize="8" fill="#c98a8a" fontFamily="Caveat, cursive">2x</text>
      </svg>
    );
  return (
    <svg width="90" height="90" viewBox="0 0 90 90" fill="none">
      <circle cx="45" cy="45" r="30" stroke="#3a342b" strokeWidth="1.2" fill="none" />
      <polyline points="32,45 42,55 60,35" stroke="#6f8a5e" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  return (
    <>
      <style>{`
        /* ---- base tokens ---- */
        :root {
          --paper: #efe7d4;
          --paper-2: #e3d7ba;
          --card: #fffbf0;
          --ink: #3a342b;
          --ink-soft: #6b5f4d;
          --sage: #9bb08a;
          --sage-d: #6f8a5e;
          --rose: #c98a8a;
          --ochre: #d4a83c;
          --rule: #b8a784;
        }

        /* ---- paper grain ---- */
        .grain {
          background-color: var(--paper);
          background-image: radial-gradient(circle, rgba(58,52,43,.04) 1px, transparent 1.4px);
          background-size: 3px 3px;
        }

        /* ---- fonts ---- */
        .f-headline, .f-body, .f-btn-primary {
          font-family: 'Cormorant Garamond', Georgia, serif;
        }
        .f-hand {
          font-family: 'Homemade Apple', cursive;
        }
        .f-label {
          font-family: 'Caveat', cursive;
        }

        /* ---- double frame ---- */
        .double-frame {
          position: relative;
          border: 1px solid var(--rule);
        }
        .double-frame::before {
          content: '';
          position: absolute;
          inset: 6px;
          border: 1px solid var(--rule);
          pointer-events: none;
        }

        /* ---- primary CTA (framed) ---- */
        .cta-wrap {
          display: inline-block;
          border: 1px solid var(--ink);
          padding: 6px;
          line-height: 1;
        }
        .cta-wrap:hover { transform: translate(2px,2px); }
        .cta-inner {
          display: inline-block;
          background: var(--ink);
          color: var(--card);
          text-transform: uppercase;
          letter-spacing: 1.5px;
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 600;
          font-size: 15px;
          padding: 14px 36px;
          border-radius: 0;
          border: none;
          cursor: pointer;
          text-decoration: none;
        }

        /* ---- pill button ---- */
        .btn-pill {
          display: inline-block;
          border: 1.5px solid var(--ink);
          border-radius: 30px;
          padding: 8px 22px;
          font-family: 'Caveat', cursive;
          font-size: 18px;
          color: var(--ink);
          text-decoration: none;
          background: transparent;
          cursor: pointer;
          transition: background .2s;
        }
        .btn-pill:hover {
          background: var(--ink);
          color: var(--card);
        }

        /* ---- section rule ---- */
        .section-rule {
          width: 120px;
          height: 1px;
          background: var(--rule);
          margin: 0 auto 28px;
        }

        /* ---- dotted connector (horizontal between steps) ---- */
        .dot-connector {
          border-top: 2px dotted var(--rule);
          flex: 1;
          align-self: center;
          margin: 0 -8px;
        }

        /* ---- postmark ---- */
        .postmark {
          position: absolute;
          top: 32px;
          right: 32px;
          width: 110px;
          height: 110px;
          border: 2px dashed var(--rose);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(-12deg);
          opacity: 0.7;
        }
        .postmark span {
          font-family: 'Caveat', cursive;
          font-size: 13px;
          color: var(--rose);
          text-align: center;
          line-height: 1.3;
        }

        /* ---- watercolor blobs ---- */
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: .35;
          pointer-events: none;
        }

        /* ---- card tile credits ---- */
        .credit-list li {
          position: relative;
          padding-left: 16px;
          margin-bottom: 6px;
        }
        .credit-list li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 8px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--sage);
        }

        /* ---- email preview shadow ---- */
        .email-shadow {
          position: absolute;
          top: 8px;
          left: 8px;
          right: -8px;
          bottom: -8px;
          background: var(--paper-2);
          z-index: 0;
        }
      `}</style>

      <div className="grain" style={{ color: "var(--ink)", minHeight: "100vh" }}>

        {/* ============================================================ */}
        {/*  HEADER                                                      */}
        {/* ============================================================ */}
        <header
          style={{
            maxWidth: 960,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <span className="f-hand" style={{ fontSize: 32, color: "var(--ink)" }}>
              claim<span style={{ color: "var(--sage-d)" }}>.</span>app
            </span>
            <SquiggleUnderline color="var(--sage)" width={130} />
          </div>
          <Link href="/signup" className="btn-pill">
            get started
          </Link>
        </header>

        {/* ============================================================ */}
        {/*  HERO                                                        */}
        {/* ============================================================ */}
        <section
          style={{
            position: "relative",
            overflow: "hidden",
            maxWidth: 960,
            margin: "0 auto",
            padding: "80px 24px 64px",
            textAlign: "center",
          }}
        >
          {/* watercolor blobs */}
          <div className="blob" style={{ width: 320, height: 320, background: "var(--sage)", top: -60, left: -80 }} />
          <div className="blob" style={{ width: 260, height: 260, background: "var(--rose)", top: 40, right: -40 }} />
          <div className="blob" style={{ width: 200, height: 200, background: "var(--ochre)", bottom: -40, left: "40%" }} />

          {/* botanical corners */}
          <BotanicalCorner style={{ top: 0, left: 0 }} />
          <BotanicalCorner style={{ top: 0, right: 0, transform: "scaleX(-1)" }} />
          <BotanicalCorner style={{ bottom: 0, left: 0, transform: "scaleY(-1)" }} />
          <BotanicalCorner style={{ bottom: 0, right: 0, transform: "scale(-1,-1)" }} />

          {/* postmark */}
          <div className="postmark" aria-hidden="true">
            <span>est. 2026<br />no app<br />just email</span>
          </div>

          {/* eyebrow */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              marginBottom: 28,
              position: "relative",
              zIndex: 1,
            }}
          >
            <span style={{ flex: "0 0 60px", height: 1, background: "var(--rule)" }} />
            <span className="f-label" style={{ fontSize: 18, color: "var(--sage-d)", fontWeight: 500 }}>
              a small reminder, lovingly sent
            </span>
            <span style={{ flex: "0 0 60px", height: 1, background: "var(--rule)" }} />
          </div>

          {/* headline */}
          <h1
            className="f-headline"
            style={{
              fontSize: "clamp(32px, 5vw, 52px)",
              fontWeight: 500,
              lineHeight: 1.2,
              maxWidth: 720,
              margin: "0 auto",
              position: "relative",
              zIndex: 1,
            }}
          >
            Use every dollar your{" "}
            <span
              className="f-hand"
              style={{ color: "var(--sage-d)", position: "relative", display: "inline-block" }}
            >
              premium card
              <WavyUnderlineSVG />
            </span>{" "}
            quietly promised.
          </h1>

          {/* subheadline */}
          <p
            className="f-body"
            style={{
              fontStyle: "italic",
              fontSize: 19,
              color: "var(--ink-soft)",
              maxWidth: 560,
              margin: "24px auto 0",
              lineHeight: 1.6,
              position: "relative",
              zIndex: 1,
            }}
          >
            Annual fees on a single premium card run $500&ndash;$700. Most holders
            leave hundreds in credits unclaimed every year.
          </p>

          {/* CTA */}
          <div style={{ marginTop: 40, position: "relative", zIndex: 1 }}>
            <Link href="/signup" className="cta-wrap" style={{ textDecoration: "none" }}>
              <span className="cta-inner">begin &mdash; sixty seconds</span>
            </Link>
          </div>

          {/* note */}
          <p
            className="f-label"
            style={{
              marginTop: 18,
              fontSize: 17,
              color: "var(--ink-soft)",
              position: "relative",
              zIndex: 1,
            }}
          >
            no app to install &middot; just two emails per credit &#9993;
          </p>
        </section>

        {/* ============================================================ */}
        {/*  HOW IT WORKS                                                */}
        {/* ============================================================ */}
        <section style={{ maxWidth: 960, margin: "0 auto", padding: "64px 24px 48px" }}>
          <div className="section-rule" />
          <h2
            className="f-headline"
            style={{
              textAlign: "center",
              fontStyle: "italic",
              fontWeight: 500,
              fontSize: 30,
              marginBottom: 4,
            }}
          >
            How it works
          </h2>
          <p
            className="f-label"
            style={{ textAlign: "center", fontSize: 18, color: "var(--ink-soft)", marginBottom: 48 }}
          >
            three steps, no friction
          </p>

          {/* steps grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr auto 1fr",
              alignItems: "start",
              gap: 0,
              maxWidth: 820,
              margin: "0 auto",
            }}
          >
            {[
              { num: "i", icon: 1 as const, title: "Tell us your cards", desc: "Pick which premium cards you carry. Takes about 30 seconds." },
              { num: "ii", icon: 2 as const, title: "A reminder, twice", desc: "We email you 30 days and 7 days before each credit expires." },
              { num: "iii", icon: 3 as const, title: "Mark it complete", desc: "Used the credit? Tap done and we skip the rest." },
            ].map((step, i) => (
              <>
                {i > 0 && <div key={`dot-${i}`} className="dot-connector" style={{ marginTop: 80 }} />}
                <div key={step.num} style={{ textAlign: "center", padding: "0 12px" }}>
                  <span
                    className="f-hand"
                    style={{ fontSize: 54, color: "var(--sage)", display: "block", lineHeight: 1, marginBottom: 8 }}
                  >
                    {step.num}
                  </span>
                  <StepIcon step={step.icon} />
                  <h3
                    className="f-headline"
                    style={{ fontWeight: 600, fontSize: 20, marginTop: 12, marginBottom: 6 }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="f-body"
                    style={{ fontStyle: "italic", fontSize: 15, color: "var(--ink-soft)", lineHeight: 1.5 }}
                  >
                    {step.desc}
                  </p>
                </div>
              </>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/*  CARDS WE TRACK                                              */}
        {/* ============================================================ */}
        <section style={{ maxWidth: 960, margin: "0 auto", padding: "64px 24px 48px" }}>
          <div className="section-rule" />
          <h2
            className="f-headline"
            style={{
              textAlign: "center",
              fontStyle: "italic",
              fontWeight: 500,
              fontSize: 30,
              marginBottom: 4,
            }}
          >
            Cards we track
          </h2>
          <p
            className="f-label"
            style={{ textAlign: "center", fontSize: 18, color: "var(--ink-soft)", marginBottom: 48 }}
          >
            more added every month
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 14,
              maxWidth: 900,
              margin: "0 auto",
            }}
          >
            {[
              { name: "Chase Sapphire Reserve", fee: "$795", perks: 10, value: "$2,200+" },
              { name: "Amex Platinum", fee: "$895", perks: 17, value: "$3,500+" },
              { name: "Amex Gold", fee: "$325", perks: 5, value: "$424+" },
              { name: "United Club Infinite", fee: "$525", perks: 2, value: "$220+" },
              { name: "Hilton Honors Aspire", fee: "$550", perks: 7, value: "$809+" },
              { name: "Capital One Venture X", fee: "$395", perks: 2, value: "$420+" },
              { name: "Marriott Bonvoy Brilliant", fee: "$650", perks: 3, value: "$400+" },
              { name: "Delta SkyMiles Reserve", fee: "$650", perks: 5, value: "$800+" },
              { name: "Citi Strata Elite", fee: "$595", perks: 5, value: "$700+" },
              { name: "Citi Strata Premier", fee: "$250", perks: 1, value: "$100" },
              { name: "BofA Premium Rewards Elite", fee: "$550", perks: 3, value: "$450+" },
              { name: "U.S. Bank Altitude Reserve", fee: "$400", perks: 2, value: "$325+" },
              { name: "World of Hyatt", fee: "$95", perks: 1, value: "$250+" },
              { name: "IHG One Rewards Premier", fee: "$99", perks: 4, value: "$250+" },
              { name: "Bilt Palladium", fee: "$495", perks: 5, value: "$780+" },
            ].map((card) => (
              <div
                key={card.name}
                style={{
                  border: "1px solid var(--rule)",
                  background: "var(--card)",
                  padding: "16px 18px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span className="f-headline" style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.2 }}>
                    {card.name}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 8 }}>
                  <span className="f-label" style={{ fontSize: 15, color: "var(--ink-soft)" }}>
                    {card.perks} perks tracked
                  </span>
                  <span className="f-hand" style={{ fontSize: 16, color: "var(--sage-d)" }}>
                    {card.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/*  WHAT LANDS IN YOUR INBOX                                    */}
        {/* ============================================================ */}
        <section style={{ maxWidth: 960, margin: "0 auto", padding: "64px 24px 48px" }}>
          <div className="section-rule" />
          <h2
            className="f-headline"
            style={{
              textAlign: "center",
              fontStyle: "italic",
              fontWeight: 500,
              fontSize: 30,
              marginBottom: 4,
            }}
          >
            What lands in your inbox
          </h2>
          <p
            className="f-label"
            style={{ textAlign: "center", fontSize: 18, color: "var(--ink-soft)", marginBottom: 48 }}
          >
            a sample 7-day reminder
          </p>

          {/* email card */}
          <div
            style={{
              position: "relative",
              maxWidth: 620,
              margin: "0 auto",
            }}
          >
            <div className="email-shadow" />
            <div
              style={{
                position: "relative",
                zIndex: 1,
                border: "1px solid var(--rule)",
                background: "var(--card)",
                padding: "32px 36px",
              }}
            >
              {/* email header */}
              <div style={{ borderBottom: "1px solid var(--rule)", paddingBottom: 16, marginBottom: 20 }}>
                <p className="f-label" style={{ fontSize: 14, color: "var(--ink-soft)", margin: 0 }}>
                  From: reminders@claim.app
                </p>
                <p className="f-label" style={{ fontSize: 14, color: "var(--ink-soft)", margin: "4px 0 0" }}>
                  Subject: <strong style={{ color: "var(--ink)" }}>7 days left &mdash; $300 dining credit</strong>
                </p>
              </div>

              <p className="f-body" style={{ fontSize: 16, lineHeight: 1.7, margin: "0 0 14px" }}>
                Hi there, you have <span style={{ color: "var(--rose)", fontWeight: 600 }}>3 credits expiring soon</span> on your Chase Sapphire Reserve:
              </p>

              {[
                { name: "$300 Exclusive Tables dining", days: 7, link: "Browse restaurants", color: "var(--rose)" },
                { name: "$150 StubHub / viagogo credit", days: 24, link: "Activate on Chase", color: "var(--ochre)" },
                { name: "$500 The Edit hotel credit", days: 30, link: "Book via Chase Travel", color: "var(--ink-soft)" },
              ].map((item) => (
                <div
                  key={item.name}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    padding: "10px 0",
                    borderBottom: "1px solid var(--rule)",
                  }}
                >
                  <div>
                    <span className="f-body" style={{ fontSize: 15, fontWeight: 600 }}>{item.name}</span>
                    <span className="f-label" style={{ fontSize: 14, color: item.color, marginLeft: 8 }}>
                      {item.days}d left
                    </span>
                  </div>
                  <span
                    className="f-label"
                    style={{
                      fontSize: 14,
                      color: "var(--sage-d)",
                      textDecoration: "underline",
                      textDecorationStyle: "wavy",
                      cursor: "pointer",
                      flexShrink: 0,
                      marginLeft: 12,
                    }}
                  >
                    {item.link} &rarr;
                  </span>
                </div>
              ))}

              <p className="f-body" style={{ fontSize: 15, lineHeight: 1.7, margin: "14px 0 0", color: "var(--ink-soft)" }}>
                Already used one?{" "}
                <span
                  style={{
                    textDecoration: "underline",
                    textDecorationStyle: "wavy",
                    textDecorationColor: "var(--sage)",
                    cursor: "pointer",
                    color: "var(--ink)",
                  }}
                >
                  Mark as done
                </span>
              </p>
              <div style={{ marginTop: 20, borderTop: "1px dashed var(--rule)", paddingTop: 12 }}>
                <p className="f-label" style={{ fontSize: 13, color: "var(--ink-soft)", margin: 0 }}>
                  claim.app &middot; kept simple, on purpose
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  END CTA                                                     */}
        {/* ============================================================ */}
        <section style={{ maxWidth: 960, margin: "0 auto", padding: "64px 24px 80px" }}>
          <div
            className="double-frame"
            style={{
              maxWidth: 560,
              margin: "0 auto",
              padding: "48px 32px",
              textAlign: "center",
              background: "var(--card)",
            }}
          >
            <h2 className="f-headline" style={{ fontWeight: 500, fontSize: 30, marginBottom: 4 }}>
              Begin in{" "}
              <span className="f-hand" style={{ color: "var(--sage-d)" }}>sixty seconds</span>.
            </h2>
            <p
              className="f-body"
              style={{ fontStyle: "italic", fontSize: 16, color: "var(--ink-soft)", marginTop: 8, marginBottom: 32 }}
            >
              Free while we grow. No card required.
            </p>
            <Link href="/signup" className="cta-wrap" style={{ textDecoration: "none" }}>
              <span className="cta-inner">start free</span>
            </Link>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  FOOTER                                                      */}
        {/* ============================================================ */}
        <footer
          style={{
            textAlign: "center",
            padding: "24px 24px 36px",
            borderTop: "1px solid var(--rule)",
          }}
        >
          <p className="f-label" style={{ fontSize: 17, color: "var(--ink-soft)", margin: 0 }}>
            kept simple, on purpose &middot;{" "}
            <span className="f-hand" style={{ fontSize: 16, color: "var(--ink)" }}>
              claim<span style={{ color: "var(--sage-d)" }}>.</span>app
            </span>
          </p>
        </footer>
      </div>
    </>
  );
}
