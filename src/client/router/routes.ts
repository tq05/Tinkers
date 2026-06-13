// Hand-rolled route model (§B.2). Discriminated union ↔ URL paths, 1:1 with
// react-router paths so a later migration is mechanical.

export type Route =
  | { name: "home" } // /
  | { name: "project"; projectId: string } // /p/:projectId
  | { name: "session"; sessionId: string } // /s/:sessionId
  | { name: "agentNew"; projectId?: string } // /agents/new (?project=)
  | { name: "agentConfig"; agentId: string } // /agents/:agentId/config
  | { name: "globalAgents" } // /global
  | { name: "settings" } // /settings
  | { name: "projectNew" }; // /projects/new

/** Serialize a Route to a URL path. */
export function toPath(r: Route): string {
  switch (r.name) {
    case "home":
      return "/";
    case "project":
      return `/p/${encodeURIComponent(r.projectId)}`;
    case "session":
      return `/s/${encodeURIComponent(r.sessionId)}`;
    case "agentNew":
      return r.projectId
        ? `/agents/new?project=${encodeURIComponent(r.projectId)}`
        : "/agents/new";
    case "agentConfig":
      return `/agents/${encodeURIComponent(r.agentId)}/config`;
    case "globalAgents":
      return "/global";
    case "settings":
      return "/settings";
    case "projectNew":
      return "/projects/new";
  }
}

/** Parse a URL path into a Route, falling back to home. */
export function fromPath(path: string): Route {
  const [rawPath, rawQuery = ""] = path.split("?");
  const segments = rawPath.split("/").filter(Boolean);
  const query = new URLSearchParams(rawQuery);

  if (segments.length === 0) return { name: "home" };

  const [a, b, c] = segments;

  if (a === "p" && b) return { name: "project", projectId: decodeURIComponent(b) };
  if (a === "s" && b) return { name: "session", sessionId: decodeURIComponent(b) };
  if (a === "global") return { name: "globalAgents" };
  if (a === "settings") return { name: "settings" };
  if (a === "projects" && b === "new") return { name: "projectNew" };
  if (a === "agents") {
    if (b === "new") {
      const project = query.get("project");
      return project ? { name: "agentNew", projectId: project } : { name: "agentNew" };
    }
    if (b && c === "config") {
      return { name: "agentConfig", agentId: decodeURIComponent(b) };
    }
  }

  return { name: "home" };
}
