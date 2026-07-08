export function ProbeSwitch({ real, preview, onPreview }: { real: boolean; preview: boolean; onPreview: (value: boolean) => void }) {
  return (
    <button className="probe-switch-row" type="button" onClick={() => onPreview(!preview)} aria-label="预演安静模式">
      <span>安静模式</span>
      <span className="probe-switch" data-real={real}>
        <span className="switch-ghost" data-on={preview} />
        <span className="switch-real" />
      </span>
      <small>预演</small>
    </button>
  );
}

