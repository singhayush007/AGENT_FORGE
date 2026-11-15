"use client";

// Last-resort boundary: replaces the whole page if the root layout itself fails.
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: 24,
        }}
      >
        <h1 style={{ fontSize: 24, margin: 0 }}>Something went wrong</h1>
        <p style={{ color: "#666", margin: 0 }}>The app hit an unexpected error.</p>
        <button
          onClick={reset}
          style={{ padding: "10px 18px", borderRadius: 10, border: "1px solid #ccc", cursor: "pointer" }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
