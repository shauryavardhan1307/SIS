import { useState } from "react";
import { calculateCGPA, getGrade } from "../utils/helpers";
import { GRADE_CONFIG } from "../utils/theme";

function MobileScreen({ screen, student, t }) {
  const cgpa = calculateCGPA(student.courses);
  const cgpaColor = cgpa >= 8.5 ? "#00f5c4" : cgpa >= 6 ? "#7c3aed" : "#ef4444";

  if (screen === "home") return (
    <div style={{ padding: "0 12px" }}>
      <div style={{ fontSize: 9, color: "#666", letterSpacing: 1, marginBottom: 4 }}>WELCOME BACK</div>
      <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", fontFamily: "'Syne',sans-serif", marginBottom: 12 }}>{student.name.split(" ")[0]} 👋</div>
      <div style={{ background: "linear-gradient(135deg,#7c3aed,#00f5c4)", borderRadius: 12, padding: "14px", marginBottom: 10 }}>
        <div style={{ fontSize: 8, color: "#ffffffaa", letterSpacing: 1, marginBottom: 2 }}>CURRENT CGPA</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", fontFamily: "'Syne',sans-serif" }}>{cgpa.toFixed(2)}</div>
        <div style={{ fontSize: 8, color: "#ffffffaa" }}>/ 10.00</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
        <div style={{ background: "#1a1a3a", borderRadius: 10, padding: "10px 10px" }}>
          <div style={{ fontSize: 8, color: "#666", marginBottom: 2 }}>COURSES</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#7c3aed", fontFamily: "'Syne',sans-serif" }}>{student.courses.length}</div>
        </div>
        <div style={{ background: "#1a1a3a", borderRadius: 10, padding: "10px 10px" }}>
          <div style={{ fontSize: 8, color: "#666", marginBottom: 2 }}>DEBARRED</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#ef4444", fontFamily: "'Syne',sans-serif" }}>{student.courses.filter(c => c.attendance < 75).length}</div>
        </div>
      </div>
      {student.courses.slice(0, 2).map(c => {
        const g = c.attendance < 75 ? "F" : getGrade(c.marks);
        return (
          <div key={c.name} style={{ background: "#1a1a3a", borderRadius: 8, padding: "8px 10px", marginBottom: 5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#ccc" }}>{c.name.slice(0, 16)}</div>
              <div style={{ fontSize: 8, color: "#555" }}>Att: {c.attendance}%</div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: GRADE_CONFIG[g]?.color, fontFamily: "'Syne',sans-serif" }}>{g}</div>
          </div>
        );
      })}
    </div>
  );

  if (screen === "courses") return (
    <div style={{ padding: "0 12px" }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", fontFamily: "'Syne',sans-serif", marginBottom: 12 }}>My Courses</div>
      {student.courses.map(c => {
        const g = c.attendance < 75 ? "F" : getGrade(c.marks);
        const gc = GRADE_CONFIG[g];
        return (
          <div key={c.name} style={{ background: "#1a1a3a", borderRadius: 10, padding: "10px 12px", marginBottom: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#ddd" }}>{c.name.slice(0, 18)}</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: gc?.color, fontFamily: "'Syne',sans-serif" }}>{g}</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 7, color: "#555", marginBottom: 2 }}>MARKS</div>
                <div style={{ background: "#0d0d20", borderRadius: 3, height: 4, overflow: "hidden" }}>
                  <div style={{ width: `${c.attendance < 75 ? 0 : c.marks}%`, height: "100%", background: gc?.color }} />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 7, color: "#555", marginBottom: 2 }}>ATTEND</div>
                <div style={{ background: "#0d0d20", borderRadius: 3, height: 4, overflow: "hidden" }}>
                  <div style={{ width: `${c.attendance}%`, height: "100%", background: c.attendance < 75 ? "#ef4444" : "#3b82f6" }} />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  if (screen === "notify") return (
    <div style={{ padding: "0 12px" }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", fontFamily: "'Syne',sans-serif", marginBottom: 12 }}>Notifications</div>
      {[
        { icon: "⚠️", msg: "Attendance below 75% in Algorithms", time: "2m ago", color: "#ef4444" },
        { icon: "📈", msg: "CGPA improved by 0.3 this month", time: "1h ago", color: "#00f5c4" },
        { icon: "🎯", msg: "Machine Learning exam tomorrow", time: "3h ago", color: "#f59e0b" },
        { icon: "✅", msg: "Assignment submitted successfully", time: "1d ago", color: "#7c3aed" },
        { icon: "📅", msg: "Class schedule updated for next week", time: "2d ago", color: "#3b82f6" },
      ].map((n, i) => (
        <div key={i} style={{ background: "#1a1a3a", borderRadius: 10, padding: "10px 12px", marginBottom: 6, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ fontSize: 14 }}>{n.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: "#ccc", marginBottom: 2 }}>{n.msg}</div>
            <div style={{ fontSize: 8, color: "#444" }}>{n.time}</div>
          </div>
        </div>
      ))}
    </div>
  );

  if (screen === "profile") return (
    <div style={{ padding: "0 12px" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 12 }}>
        <div style={{ width: 50, height: 50, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#00f5c4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: "#fff", fontFamily: "'Syne',sans-serif", marginBottom: 6 }}>{student.name[0]}</div>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", fontFamily: "'Syne',sans-serif" }}>{student.name}</div>
        <div style={{ fontSize: 9, color: "#666" }}>ID: {student.id}</div>
      </div>
      {[
        { label: "CGPA", value: cgpa.toFixed(2), color: cgpaColor },
        { label: "Courses", value: student.courses.length, color: "#7c3aed" },
        { label: "Credits", value: student.courses.reduce((a, c) => a + c.credit, 0), color: "#3b82f6" },
      ].map(r => (
        <div key={r.label} style={{ display: "flex", justifyContent: "space-between", background: "#1a1a3a", borderRadius: 8, padding: "8px 12px", marginBottom: 5 }}>
          <span style={{ fontSize: 10, color: "#666" }}>{r.label}</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: r.color, fontFamily: "'Syne',sans-serif" }}>{r.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function MobilePreview({ student, t }) {
  const [screen, setScreen] = useState("home");
  const navItems = [
    { id: "home",    icon: "⬡", label: "Home"    },
    { id: "courses", icon: "◈", label: "Courses" },
    { id: "notify",  icon: "🔔", label: "Alerts"  },
    { id: "profile", icon: "👤", label: "Profile" },
  ];

  return (
    <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 16, padding: "20px 24px", marginBottom: 24 }}>
      <div style={{ fontSize: 11, color: t.accentPink ?? "#ec4899", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>📱 Mobile View</div>
      <div style={{ fontSize: 17, fontWeight: 800, fontFamily: "'Syne',sans-serif", color: t.text, marginBottom: 20 }}>App Preview</div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        {/* Phone frame */}
        <div style={{ width: 220, background: "#07071a", border: "3px solid #2a2a4a", borderRadius: 28, overflow: "hidden", boxShadow: "0 20px 60px #0008", position: "relative" }}>
          {/* Notch */}
          <div style={{ background: "#111128", height: 28, display: "flex", alignItems: "center", justifyContent: "center", gap: 40 }}>
            <div style={{ fontSize: 8, color: "#444" }}>9:41</div>
            <div style={{ width: 40, height: 10, background: "#0d0d20", borderRadius: 10 }} />
            <div style={{ fontSize: 8, color: "#444" }}>📶</div>
          </div>

          {/* Screen content */}
          <div style={{ height: 380, overflowY: "auto", padding: "12px 0" }}>
            <MobileScreen screen={screen} student={student} t={t} />
          </div>

          {/* Nav bar */}
          <div style={{ background: "#0e0e24", borderTop: "1px solid #1c1c3c", display: "flex" }}>
            {navItems.map(n => (
              <button key={n.id} onClick={() => setScreen(n.id)} style={{ flex: 1, background: "none", border: "none", padding: "8px 4px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <span style={{ fontSize: 14 }}>{n.icon}</span>
                <span style={{ fontSize: 7, color: screen === n.id ? "#7c3aed" : "#444", fontFamily: "'Space Mono',monospace" }}>{n.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 16, fontSize: 11, color: t.textFaint, fontFamily: "'Space Mono',monospace" }}>
        Tap nav icons to preview different screens
      </div>
    </div>
  );
}
