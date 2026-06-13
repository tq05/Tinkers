// App root (§J). Mounts the provider stack and the app shell:
//   MockStoreProvider > RouterProvider > TinkersProvider > AppShell + TinkersDock
// Global styles are imported here so the whole tree is themed.

import "./styles/tokens.css";
import "./styles/global.css";

import { MockStoreProvider } from "./mock/store";
import { RouterProvider } from "./router/RouterContext";
import { TinkersProvider } from "./components/tinkers/TinkersProvider";
import { TinkersDock } from "./components/tinkers/TinkersDock";
import { AppShell } from "./shell/AppShell";

export function App() {
  return (
    <MockStoreProvider>
      <RouterProvider>
        <TinkersProvider>
          <AppShell />
          <TinkersDock />
        </TinkersProvider>
      </RouterProvider>
    </MockStoreProvider>
  );
}
