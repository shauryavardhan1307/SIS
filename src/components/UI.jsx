import { useState } from "react";

export function CGPABar({ cgpa, t, height = 8 }) {
  const pct = (cgpa / 10) * 100;
  const color = cgpa >= 8.5 ? "#00f5c4" : cgpa >= 7 ? "#7c3aed" : cgpa >= 5 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ width: "100%", background: t.isDark ? "#1a1a2e" : "#e8e8f4", borderRadius: 6, height, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", borderRadius: 6, background: `linear-gradient(90deg,${color}88,${color})`, transition: "width 1s cubic-bezier(.4,0,.2,1)", boxShadow: `0 0 8px ${color}55` }} />
    </div>
  );
}

export function StatCard({ label, value, accent, sub, icon, t, onClick }) {
  return (
    <div onClick={onClick} style={{ background: t.card, border: `1px solid ${accent}33`, borderRadius: 16, padding: "20px 24px", boxShadow: `0 4px 24px ${accent}0d`, minWidth: 110, flex: 1, cursor: onClick ? "pointer" : "default", transition: "transform .18s, box-shadow .18s" }}
      onMouseEnter={e => onClick && (e.currentTarget.style.transform = "translateY(-2px)")}
      onMouseLeave={e => onClick && (e.currentTarget.style.transform = "none")}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: t.textMuted, fontFamily: "'Space Mono',monospace", letterSpacing: 2, textTransform: "uppercase" }}>{label}</div>
        {icon && <span style={{ fontSize: 20 }}>{icon}</span>}
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, color: accent, fontFamily: "'Syne',sans-serif", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: t.textDim, marginTop: 5 }}>{sub}</div>}
    </div>
  );
}

export function Modal({ open, title, onClose, children, t, wide }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: t.overlay, backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn .18s", padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: t.modalBg, border: `1px solid ${t.accentPrimary}44`, borderRadius: 22, padding: "32px 36px", width: "100%", maxWidth: wide ? 700 : 520, boxShadow: "0 16px 64px #7c3aed22", animation: "slideUp .22s cubic-bezier(.4,0,.2,1)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Syne',sans-serif", color: t.text }}>{title}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: t.textMuted, cursor: "pointer", fontSize: 22, lineHeight: 1, padding: 4 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Input({ label, value, onChange, type = "text", placeholder, error, min, max, step, t }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 11, color: t.textMuted, fontFamily: "'Space Mono',monospace", letterSpacing: 1.5, textTransform: "uppercase", display: "block", marginBottom: 6 }}>{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} min={min} max={max} step={step}
        style={{ width: "100%", background: t.input, border: `1px solid ${error ? "#ef4444" : t.inputBorder}`, borderRadius: 8, padding: "10px 14px", color: t.text, fontSize: 14, fontFamily: "'Space Mono',monospace", outline: "none", boxSizing: "border-box", transition: "border-color .2s" }} />
      {error && <div style={{ color: "#ef4444", fontSize: 11, marginTop: 4 }}>{error}</div>}
    </div>
  );
}

export function Btn({ children, onClick, variant = "primary", style: s = {}, disabled, t }) {
  const base = { border: "none", borderRadius: 9, padding: "10px 22px", fontWeight: 700, fontFamily: "'Syne',sans-serif", fontSize: 13, cursor: disabled ? "not-allowed" : "pointer", transition: "all .18s", letterSpacing: 0.5, opacity: disabled ? 0.5 : 1, ...s };
  if (variant === "primary") return <button onClick={onClick} disabled={disabled} style={{ ...base, background: "linear-gradient(90deg,#7c3aed,#5b21b6)", color: "#fff", boxShadow: "0 2px 16px #7c3aed44" }}>{children}</button>;
  if (variant === "accent")  return <button onClick={onClick} disabled={disabled} style={{ ...base, background: "linear-gradient(90deg,#00f5c4,#00c49a)", color: "#07071a", boxShadow: "0 2px 16px #00f5c444" }}>{children}</button>;
  if (variant === "ghost")   return <button onClick={onClick} disabled={disabled} style={{ ...base, background: "transparent", color: t?.textMuted ?? "#888", border: `1px solid ${t?.border ?? "#2a2a4a"}` }}>{children}</button>;
  if (variant === "danger")  return <button onClick={onClick} disabled={disabled} style={{ ...base, background: "linear-gradient(90deg,#ef4444,#b91c1c)", color: "#fff" }}>{children}</button>;
  if (variant === "outline") return <button onClick={onClick} disabled={disabled} style={{ ...base, background: "transparent", color: t?.accentPrimary ?? "#7c3aed", border: `1px solid ${(t?.accentPrimary ?? "#7c3aed")}55` }}>{children}</button>;
  if (variant === "blue")    return <button onClick={onClick} disabled={disabled} style={{ ...base, background: "linear-gradient(90deg,#3b82f6,#2563eb)", color: "#fff", boxShadow: "0 2px 16px #3b82f644" }}>{children}</button>;
}

export function Toast({ toasts, t }) {
  return (
    <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 999, display: "flex", flexDirection: "column", gap: 10 }}>
      {toasts.map(x => (
        <div key={x.id} style={{ background: x.type === "error" ? t.toastError : t.toastSuccess, border: `1px solid ${x.type === "error" ? "#ef4444" : t.accentGreen}`, borderRadius: 10, padding: "12px 20px", color: x.type === "error" ? "#ef4444" : t.accentGreen, fontSize: 13, fontFamily: "'Space Mono',monospace", boxShadow: `0 4px 24px ${x.type === "error" ? "#ef444433" : "#00f5c433"}`, animation: "slideUp .22s" }}>
          {x.type === "error" ? "✗ " : "✓ "}{x.msg}
        </div>
      ))}
    </div>
  );
}

export function Badge({ label, color, bg }) {
  return (
    <span style={{ background: bg ?? `${color}22`, border: `1px solid ${color}55`, color, borderRadius: 6, padding: "2px 10px", fontSize: 10, fontWeight: 700, letterSpacing: 1, fontFamily: "'Space Mono',monospace" }}>{label}</span>
  );
}

export function ScoreRing({ score, color, label, size = 80 }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1a1a2e" strokeWidth={8} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s cubic-bezier(.4,0,.2,1)" }} />
        <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
          fill={color} fontSize={size * 0.22} fontWeight="800" fontFamily="Syne,sans-serif"
          style={{ transform: "rotate(90deg)", transformOrigin: `${size/2}px ${size/2}px` }}>
          {score}
        </text>
      </svg>
      <div style={{ fontSize: 10, color: "#888", fontFamily: "'Space Mono',monospace", letterSpacing: 1, textAlign: "center" }}>{label}</div>
    </div>
  );
}
