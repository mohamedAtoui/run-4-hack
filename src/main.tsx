import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App";
import { CLERK_ENABLED, CLERK_PUBLISHABLE_KEY } from "./clerk";
import "./index.css";

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
