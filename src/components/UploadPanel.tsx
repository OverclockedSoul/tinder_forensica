interface UploadPanelProps {
  busy: boolean;
  onFileChange: (file: File | null) => void;
}

export function UploadPanel({ busy, onFileChange }: UploadPanelProps) {
  return (
    <section className="upload-panel" data-testid="upload-panel">
      <h1>Upload your Tinder data.</h1>
      <div className="upload-actions">
        <input
          id="tinder-file-input"
          className="file-input"
          data-testid="file-input"
          type="file"
          accept=".json,.zip,application/json,application/zip"
          disabled={busy}
          onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
        />
        <p className="upload-hint">Accepted: `data.json` or a `.zip` containing `data.json`.</p>
      </div>
    </section>
  );
}
