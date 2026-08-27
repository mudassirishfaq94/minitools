import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

// Verifies calculations against known-good values and audits catalog
// integrity. Both are tree-shaken out of production builds.
if (import.meta.env.DEV) {
  void import("./utils/selftest").then(({ runCalculationSelfTest }) =>
    runCalculationSelfTest(),
  );
  void import("./utils/audit").then(({ reportProjectAudit }) => reportProjectAudit());
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
