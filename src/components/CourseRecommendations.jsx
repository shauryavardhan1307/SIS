import { recommendCourses } from "../utils/helpers";
import { COURSE_CATALOG } from "../utils/theme";
import { Badge } from "./UI";

const DIFF_COLORS = { Easy: "#00f5c4", Medium: "#f59e0b", Hard: "#ef4444" };
const CAT_COLORS  = { "Core CS": "#7c3aed", "AI/ML": "#3b82f6", Systems: "#f97316", Security: "#ec4899", Dev: "#00f5c4", Math: "#f59e0b" };

export default function CourseRecommendations({ student, onAddCourse, t }) {
  const recs = recommendCourses(student, COURSE_CATALOG);

  return (
    <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 16, padding: "20px 24px", marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: t.accentBlue, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>🎯 AI Recommends</div>
          <div style={{ fontSize: 17, fontWeight: 800, fontFamily: "'Syne',sans-serif", color: t.text }}>Suggested Courses</div>
        </div>
        <div style={{ fontSize: 11, color: t.textFaint, fontFamily: "'Space Mono',monospace" }}>Based on your performance</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {recs.map(c => (
          <div key={c.name} style={{ background: t.isDark ? "#0a0a1e" : "#f9f9ff", border: `1px solid ${t.border}`, borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
            {/* Match score */}
            <div style={{ width: 48, height: 48, borderRadius: 10, background: `${CAT_COLORS[c.category] ?? "#7c3aed"}22`, border: `1px solid ${CAT_COLORS[c.category] ?? "#7c3aed"}44`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: CAT_COLORS[c.category] ?? "#7c3aed", fontFamily: "'Syne',sans-serif", lineHeight: 1 }}>{c.matchScore}</div>
              <div style={{ fontSize: 8, color: t.textFaint, letterSpacing: 0.5 }}>MATCH</div>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 4, fontFamily: "'Syne',sans-serif" }}>{c.name}</div>
              <div style={{ fontSize: 11, color: t.textDim, marginBottom: 6 }}>{c.reason}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <Badge label={c.category}   color={CAT_COLORS[c.category]  ?? "#7c3aed"} />
                <Badge label={c.difficulty} color={DIFF_COLORS[c.difficulty] ?? "#888"} />
              </div>
            </div>

            <button onClick={() => onAddCourse(c.name)} style={{ background: "linear-gradient(90deg,#7c3aed,#5b21b6)", border: "none", borderRadius: 8, padding: "8px 14px", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Syne',sans-serif", flexShrink: 0 }}>
              + Enroll
            </button>
          </div>
        ))}
        {recs.length === 0 && (
          <div style={{ textAlign: "center", color: t.textFaint, padding: 28, fontSize: 13 }}>All courses enrolled!</div>
        )}
      </div>
    </div>
  );
}
