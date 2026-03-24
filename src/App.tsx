import { useState } from "react";
import { parseTinderFile } from "./lib/fileLoader";
import type { TinderMetrics } from "./types/tinder";
import { UploadPanel } from "./components/UploadPanel";
import { InsightsTree } from "./components/InsightsTree";

type AppState =
  | { status: "idle" }
  | { status: "loading"; fileName: string }
  | { status: "error"; message: string }
  | { status: "success"; fileName: string; metrics: TinderMetrics };

export default function App() {
  const [state, setState] = useState<AppState>({ status: "idle" });

  const handleFileChange = async (file: File | null) => {
    if (!file) {
      return;
    }

    setState({ status: "loading", fileName: file.name });

    try {
      const metrics = await parseTinderFile(file);
      setState({ status: "success", fileName: file.name, metrics });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unsupported file.";
      setState({ status: "error", message });
    }
  };

  const isBusy = state.status === "loading";
  const isSuccess = state.status === "success";

  return (
    <main className={`app-shell ${isSuccess ? "is-success" : ""}`}>
      <div className="app-backdrop" />
      <section className="app-panel" aria-label="Tinder insights app">
        {isSuccess ? (
          <>
            <div className="status-banner success" data-testid="success-state">
              <span>Loaded {state.fileName}</span>
              <button
                type="button"
                className="secondary-action"
                onClick={() => setState({ status: "idle" })}
              >
                Replace file
              </button>
            </div>
            <InsightsTree metrics={state.metrics} />
          </>
        ) : (
          <>
            <UploadPanel busy={isBusy} onFileChange={handleFileChange} />
            <div className="status-region" aria-live="polite">
              {state.status === "loading" && (
                <p className="status-banner loading" data-testid="loading-state">
                  Parsing {state.fileName}...
                </p>
              )}
              {state.status === "error" && (
                <p className="status-banner error" data-testid="error-state">
                  {state.message}
                </p>
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
