import { useEffect, useState } from "react";

interface Health {
  status: string;
  uptime: number;
}

export function App() {
  const [health, setHealth] = useState<Health | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then(setHealth)
      .catch((e) => setError(String(e)));
  }, []);

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
      <h1>Tinkers</h1>
      <p>Web harness for the pi coding agent.</p>
      {error && <p style={{ color: "crimson" }}>Backend error: {error}</p>}
      {health ? (
        <p>
          Backend status: <strong>{health.status}</strong> (uptime{" "}
          {health.uptime.toFixed(1)}s)
        </p>
      ) : (
        !error && <p>Checking backend…</p>
      )}
    </main>
  );
}
