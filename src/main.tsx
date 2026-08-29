import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App";
import { CLERK_ENABLED, CLERK_PUBLISHABLE_KEY } from "./clerk";
import "./index.css";

// Only in a build: the dev server serves modules the cache-first worker must not keep.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker
      .register("/sw.js")
      .then(() => navigator.serviceWorker.ready)
      .then((registration) => {
        // This load's assets were fetched before the worker took control, so hand
        // it their URLs — otherwise a first offline launch has no scripts.
        const urls = performance
          .getEntriesByType("resource")
          .filter((entry) => entry.name.startsWith(location.origin))
          .map((entry) => entry.name);
        registration.active?.postMessage({ type: "precache", urls });
      })
      .catch(() => undefined);
  });
}

const root = createRoot(document.getElementById("root")!);

root.render(
  <StrictMode>
    {CLERK_ENABLED ? (
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY!}>
        <App />
      </ClerkProvider>
    ) : (
      <App />
    )}
  </StrictMode>,
);
