import { useState } from "react";
import { predictPerformance } from "../utils/helpers";
import { ScoreRing } from "./UI";

export default function AIPrediction({ student, t }) {
  const [expanded, setExpanded] = useState(false);
  const p = predictPerformance(student);
  if (!p) return (
    <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 16, padding: "24px", marginBottom: 24, textAlign: "center", color: t.textFaint, fontSize: 13 }}>
      Add courses to unlock AI performance prediction
    </div>
  );

  const delta = p.predictedCGPA - p.currentCGPA;

  return (
    <div style={{ background: t.isDark ? "linear-gradient(135deg,#0e0e24,#160d35)" : "linear-gradient(135deg,#fff,#f4f0ff)", border: `1px solid ${t.accentPrimary}44`, borderRadius: 16, padding: "24px", marginBottom: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: t.accentPrimary, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>🤖 AI Engine</div>
          <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Syne',sans-serif", color: t.text }}>Performance Prediction</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ background: `${p.riskColor}22`, border: `1px solid ${p.riskColor}55`, color: p.riskColor, borderRadius: 20, padding: "4px 14px", fontSize: 11, fontWeight: 700, fontFamily: "'Space Mono',monospace" }}>
            {p.risk} Risk
          </div>
          <button onClick={() => setExpanded(x => !x)} style={{ background: t.isDark ? "#1a1a3a" : "#f0e8ff", border: `1px solid ${t.border}`, borderRadius: 8, padding: "6px 14px", color: t.textMuted, cursor: "pointer", fontSize: 11, fontFamily: "'Space Mono',monospace" }}>
            {expanded ? "Less ▲" : "More ▼"}
          </button>
        </div>
      </div>

      {/* Score Rings */}
      <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
        <ScoreRing score={p.scoreBreakdown.academic}     color="#7c3aed" label="Academic"    />
        <ScoreRing score={p.scoreBreakdown.attendance}   color="#3b82f6" label="Attendance"  />
        <ScoreRing score={p.scoreBreakdown.consistency}  color="#f59e0b" label="Consistency" />
        <ScoreRing score={p.scoreBreakdown.improvement}  color="#00f5c4" label="Improvement" />
      </div>

      {/* Predicted CGPA */}
      <div style={{ background: t.isDark ? "#0a0a1e" : "#f4f0ff", borderRadius: 12, padding: "16px 20px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: 1, marginBottom: 4 }}>PREDICTED NEXT SEMESTER CGPA</div>
          <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "'Syne',sans-serif", color: t.accentPrimary }}>
            {p.predictedCGPA.toFixed(2)}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 4 }}>CHANGE</div>
          <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Syne',sans-serif", color: delta >= 0 ? t.accentGreen : "#ef4444" }}>
            {delta >= 0 ? "+" : ""}{delta.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Suggestions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: expanded ? 16 : 0 }}>
        {p.suggestions.map((s, i) => (
          <div key={i} style={{ background: t.isDark ? "#0a0a1e" : "#f9f9ff", border: `1px solid ${t.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 12, color: t.textMuted, fontFamily: "'Space Mono',monospace" }}>{s}</div>
        ))}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
          {p.strengths.length > 0 && (
            <div style={{ flex: 1, minWidth: 180, background: "#00f5c411", border: "1px solid #00f5c433", borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 10, color: t.accentGreen, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>💪 Strengths</div>
              {p.strengths.map(s => <div key={s} style={{ fontSize: 12, color: t.textMuted, marginBottom: 4 }}>• {s}</div>)}
            </div>
          )}
          {p.weaknesses.length > 0 && (
            <div style={{ flex: 1, minWidth: 180, background: "#ef444411", border: "1px solid #ef444433", borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 10, color: "#ef4444", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>⚡ Needs Work</div>
              {p.weaknesses.map(s => <div key={s} style={{ fontSize: 12, color: t.textMuted, marginBottom: 4 }}>• {s}</div>)}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 180, background: "#3b82f611", border: "1px solid #3b82f633", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 10, color: "#3b82f6", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>📊 Stats</div>
            <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 4 }}>Avg Marks: {p.avgMarks}%</div>
            <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 4 }}>Avg Attendance: {p.avgAttendance}%</div>
            <div style={{ fontSize: 12, color: t.textMuted }}>Trend: {p.trend > 0 ? "+" : ""}{p.trend.toFixed(1)} pts/course</div>
          </div>
        </div>
      )}
    </div>
  );
}
