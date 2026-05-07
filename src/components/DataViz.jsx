import { useState } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, LineChart, Line,
  ScatterChart, Scatter, PieChart, Pie, Legend, CartesianGrid
} from "recharts";
import { getGrade, calculateCGPA } from "../utils/helpers";
import { GRADE_CONFIG } from "../utils/theme";

const CHART_TABS = ["Radar", "Bar", "Trend", "Attendance", "Grade Pie"];

export default function DataViz({ student, allStudents, t }) {
  const [tab, setTab] = useState("Radar");
  const tick = { fill: t.textDim, fontSize: 10, fontFamily: "'Space Mono',monospace" };
  const tooltip = { contentStyle: { background: t.card, border: `1px solid ${t.border}`, borderRadius: 8, fontFamily: "'Space Mono',monospace", fontSize: 11, color: t.text }, cursor: { fill: `${t.accentPrimary}11` } };

  const courses = student.courses;

  // Radar data
  const radarData = courses.map(c => ({
    subject: c.name.length > 10 ? c.name.slice(0, 10) + "…" : c.name,
    Marks: c.attendance < 75 ? 0 : c.marks,
    Attendance: c.attendance,
    "Credit Weight": c.credit * 20,
  }));

  // Bar data
  const barData = courses.map(c => ({
    name: c.name.length > 10 ? c.name.slice(0, 10) + "…" : c.name,
    marks: c.attendance < 75 ? 0 : c.marks,
    attendance: c.attendance,
    grade: c.attendance < 75 ? "F" : getGrade(c.marks),
  }));

  // Trend: simulate semester-wise marks (using course order)
  const trendData = courses.map((c, i) => ({
    name: `C${i + 1}`,
    fullName: c.name,
    marks: c.attendance < 75 ? 0 : c.marks,
    gpa: GRADE_CONFIG[c.attendance < 75 ? "F" : getGrade(c.marks)]?.point ?? 0,
  }));

  // Attendance breakdown
  const attData = courses.map(c => ({
    name: c.name.length > 10 ? c.name.slice(0, 10) + "…" : c.name,
    attendance: c.attendance,
    threshold: 75,
  }));

  // Grade Pie
  const gradeCount = courses.reduce((acc, c) => {
    const g = c.attendance < 75 ? "F" : getGrade(c.marks);
    acc[g] = (acc[g] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(gradeCount).map(([g, v]) => ({ name: g, value: v, color: GRADE_CONFIG[g]?.color }));

  // Class-wide CGPA comparison
  const classData = allStudents.map(s => ({
    name: s.name.split(" ")[0],
    cgpa: Math.round(calculateCGPA(s.courses) * 100) / 100,
    isSelected: s.id === student.id,
  })).sort((a, b) => b.cgpa - a.cgpa);

  return (
    <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 16, padding: "20px 24px", marginBottom: 24 }}>
      <div style={{ fontSize: 11, color: t.accentBlue, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>📈 Analytics</div>
      <div style={{ fontSize: 17, fontWeight: 800, fontFamily: "'Syne',sans-serif", color: t.text, marginBottom: 16 }}>Data Visualization</div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        {CHART_TABS.map(tab2 => (
          <button key={tab2} onClick={() => setTab(tab2)} style={{ background: tab === tab2 ? "linear-gradient(90deg,#7c3aed,#5b21b6)" : (t.isDark ? "#0a0a1e" : "#f4f4fc"), border: `1px solid ${tab === tab2 ? "#7c3aed" : t.border}`, borderRadius: 8, padding: "6px 14px", color: tab === tab2 ? "#fff" : t.textMuted, fontSize: 11, fontWeight: tab === tab2 ? 700 : 400, cursor: "pointer", fontFamily: "'Space Mono',monospace", transition: "all .18s" }}>
            {tab2}
          </button>
        ))}
      </div>

      {courses.length === 0 ? (
        <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: t.textFaint, fontSize: 13 }}>Add courses to see charts</div>
      ) : (
        <>
          {tab === "Radar" && (
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData}>
                <PolarGrid stroke={t.border} />
                <PolarAngleAxis dataKey="subject" tick={tick} />
                <Radar name="Marks" dataKey="Marks" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.3} />
                <Radar name="Attendance" dataKey="Attendance" stroke="#00f5c4" fill="#00f5c4" fillOpacity={0.15} />
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: "'Space Mono',monospace", color: t.textMuted }} />
              </RadarChart>
            </ResponsiveContainer>
          )}

          {tab === "Bar" && (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData} barSize={18} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.border} vertical={false} />
                <XAxis dataKey="name" tick={tick} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={tick} axisLine={false} tickLine={false} />
                <Tooltip {...tooltip} formatter={(v, n, p) => n === "marks" ? [`${v} (${p.payload.grade})`, "Marks"] : [`${v}%`, "Attendance"]} />
                <Bar dataKey="marks" radius={[4, 4, 0, 0]} name="marks">
                  {barData.map((e, i) => <Cell key={i} fill={GRADE_CONFIG[e.grade]?.color ?? "#6b7280"} />)}
                </Bar>
                <Bar dataKey="attendance" fill="#3b82f644" stroke="#3b82f6" radius={[4, 4, 0, 0]} name="attendance" />
              </BarChart>
            </ResponsiveContainer>
          )}

          {tab === "Trend" && (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.border} vertical={false} />
                <XAxis dataKey="name" tick={tick} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" domain={[0, 100]} tick={tick} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 10]} tick={tick} axisLine={false} tickLine={false} />
                <Tooltip {...tooltip} formatter={(v, n) => [v, n === "marks" ? "Marks" : "GPA"]} labelFormatter={l => trendData.find(d => d.name === l)?.fullName ?? l} />
                <Line yAxisId="left"  type="monotone" dataKey="marks" stroke="#7c3aed" strokeWidth={2.5} dot={{ fill: "#7c3aed", r: 4 }} name="marks" />
                <Line yAxisId="right" type="monotone" dataKey="gpa"   stroke="#00f5c4" strokeWidth={2.5} dot={{ fill: "#00f5c4", r: 4 }} name="gpa" strokeDasharray="5 3" />
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: "'Space Mono',monospace", color: t.textMuted }} />
              </LineChart>
            </ResponsiveContainer>
          )}

          {tab === "Attendance" && (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={attData} layout="vertical" barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.border} horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={tick} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                <YAxis type="category" dataKey="name" tick={tick} axisLine={false} tickLine={false} width={90} />
                <Tooltip {...tooltip} formatter={v => [`${v}%`, "Attendance"]} />
                <Bar dataKey="attendance" radius={[0, 4, 4, 0]}>
                  {attData.map((e, i) => <Cell key={i} fill={e.attendance >= 75 ? "#3b82f6" : "#ef4444"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          {tab === "Grade Pie" && (
            <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
              <ResponsiveContainer width="50%" height={220}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={3} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip {...tooltip} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {pieData.map(e => (
                  <div key={e.name} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: e.color, flexShrink: 0 }} />
                    <div style={{ fontSize: 12, color: t.textMuted, flex: 1 }}>{GRADE_CONFIG[e.name]?.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: e.color, fontFamily: "'Syne',sans-serif" }}>{e.value}×</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Class comparison bar */}
      {allStudents.length > 1 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 10, color: t.textFaint, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Class CGPA Comparison</div>
          <ResponsiveContainer width="100%" height={80}>
            <BarChart data={classData} barSize={16}>
              <XAxis dataKey="name" tick={{ ...tick, fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltip} formatter={v => [v, "CGPA"]} />
              <Bar dataKey="cgpa" radius={[3, 3, 0, 0]}>
                {classData.map((e, i) => <Cell key={i} fill={e.isSelected ? "#00f5c4" : "#7c3aed55"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ fontSize: 10, color: t.textFaint, textAlign: "center", marginTop: 4 }}>
            <span style={{ color: "#00f5c4" }}>■</span> You &nbsp; <span style={{ color: "#7c3aed55" }}>■</span> Classmates
          </div>
        </div>
      )}
    </div>
  );
}
