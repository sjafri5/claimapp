export default function DashboardLoading() {
  const shimmer = `linear-gradient(90deg, #efe7d4 25%, #e8dfc8 50%, #efe7d4 75%)`;

  const skeletonBar = (width: string, height = 16) => (
    <div
      style={{
        width,
        height,
        background: shimmer,
        backgroundSize: "200% 100%",
        borderRadius: 2,
        animation: "shimmer 1.5s infinite",
      }}
    />
  );

  const skeletonCard = (i: number) => (
    <div
      key={i}
      style={{
        border: "1px solid #b8a784",
        background: "#fffbf0",
        padding: 24,
        marginBottom: 12,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        {skeletonBar("40%", 14)}
        {skeletonBar("60px", 14)}
      </div>
      {skeletonBar("70%", 22)}
      <div style={{ marginTop: 12 }}>{skeletonBar("50%", 14)}</div>
    </div>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#efe7d4",
        backgroundImage:
          "radial-gradient(circle, rgba(58,52,43,.04) 1px, transparent 1.4px)",
        backgroundSize: "3px 3px",
        color: "#3a342b",
        padding: "48px 16px",
      }}
    >
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
      <div style={{ maxWidth: 672, margin: "0 auto" }}>
        <div
          style={{
            marginBottom: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontFamily: "'Homemade Apple', cursive",
              fontSize: 32,
              color: "#3a342b",
            }}
          >
            claim<span style={{ color: "#6f8a5e" }}>.</span>app
          </div>
          {skeletonBar("120px", 16)}
        </div>

        {skeletonBar("180px", 28)}
        <div style={{ marginTop: 8, marginBottom: 24 }}>{skeletonBar("60%", 16)}</div>

        {[0, 1, 2, 3].map(skeletonCard)}
      </div>
    </div>
  );
}
