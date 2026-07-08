export function ProbeSlider({ real, preview, onPreview }: { real: number; preview: number; onPreview: (value: number) => void }) {
  return (
    <label className="probe-slider">
      <span>座舱亮度</span><small>{preview}% · 预演</small>
      <div className="slider-track">
        <span className="slider-link" style={{ left: `${Math.min(real, preview)}%`, width: `${Math.abs(preview - real)}%` }} />
        <span className="slider-real" style={{ left: `${real}%` }} />
        <span className="slider-ghost" style={{ left: `${preview}%` }} />
        <input type="range" min="0" max="100" value={preview} onChange={(event) => onPreview(Number(event.target.value))} />
      </div>
    </label>
  );
}

