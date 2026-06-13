import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { fromPath, toPath, type Route } from "./routes";

interface RouterValue {
  route: Route;
  navigate: (r: Route) => void;
  back: () => void;
}

const RouterContext = createContext<RouterValue | null>(null);

export function RouterProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>(() =>
    typeof window === "undefined"
      ? { name: "home" }
      : fromPath(window.location.pathname + window.location.search),
  );

  const navigate = useCallback((r: Route) => {
    const path = toPath(r);
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", path);
    }
    setRoute(r);
  }, []);

  const back = useCallback(() => {
    if (typeof window !== "undefined") window.history.back();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onPop = () => {
      setRoute(fromPath(window.location.pathname + window.location.search));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const value = useMemo<RouterValue>(
    () => ({ route, navigate, back }),
    [route, navigate, back],
  );

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRoute(): RouterValue {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("useRoute must be used within a RouterProvider");
  return ctx;
}
