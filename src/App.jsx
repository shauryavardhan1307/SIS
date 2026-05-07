import { useState, useRef, useCallback } from "react";
import { THEMES, GRADE_CONFIG } from "./utils/theme";
import { getGrade, calculateCGPA, exportPDF } from "./utils/helpers";
import { CGPABar, StatCard, Modal, Input, Btn, Toast, Badge } from "./components/UI";
import AIPrediction from "./components/AIPrediction";
import QRAttendance from "./components/QRAttendance";
import CourseRecommendations from "./components/CourseRecommendations";
import DataViz from "./components/DataViz";
import MobilePreview from "./components/MobilePreview";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from "recharts";

const SAMPLE_STUDENTS = [
  { id: 1001, name: "Arjun Mehta",  courses: [{ name: "Data Structures", credit: 4, marks: 92, attendance: 88 }, { name: "Operating Systems", credit: 3, marks: 78, attendance: 76 }, { name: "DBMS", credit: 3, marks: 85, attendance: 91 }, { name: "Discrete Math", credit: 2, marks: 88, attendance: 93 }] },
  { id: 1002, name: "Priya Sharma", courses: [{ name: "Algorithms", credit: 4, marks: 67, attendance: 64 }, { name: "Computer Networks", credit: 3, marks: 54, attendance: 82 }, { name: "Statistics", credit: 2, marks: 72, attendance: 78 }] },
  { id: 1003, name: "Ravi Kumar",   courses: [{ name: "Machine Learning", credit: 4, marks: 95, attendance: 97 }, { name: "Cloud Computing", credit: 3, marks: 88, attendance: 90 }, { name: "Cryptography", credit: 3, marks: 73, attendance: 85 }, { name: "Deep Learning", credit: 3, marks: 91, attendance: 94 }] },
  { id: 1004, name: "Sneha Patel",  courses: [{ name: "Web Development", credit: 3, marks: 83, attendance: 88 }, { name: "Software Engineering", credit: 3, marks: 76, attendance: 80 }] },
  { id: 1005, name: "Dev Kapoor",   courses: [{ name: "Data Science", credit: 4, marks: 61, attendance: 72 }, { name: "NLP", credit: 3, marks: 58, attendance: 69 }] },
];

const NAV = [
  { id: "dashboard",   label: "Dashboard",    icon: "⬡" },
  { id: "students",    label: "Students",     icon: "◈" },
  { id: "analytics",   label: "Analytics",    icon: "📈" },
  { id: "attendance",  label: "Attendance",   icon: "📅" },
];

export default function App() {
  const [themeName, setThemeName]   = useState("dark");
  const t = THEMES[themeName];
  const [students, setStudents]     = useState(SAMPLE_STUDENTS);
  const [view, setView]             = useState("dashboard");
  const [selectedId, setSelectedId] = useState(null);
  const [detailTab, setDetailTab]   = useState("overview");
  const [toasts, setToasts]         = useState([]);
  const [search, setSearch]         = useState("");
  const [sortBy, setSortBy]         = useState("cgpa");

  // Modals
  const [addStudentOpen, setAddStudentOpen]     = useState(false);
  const [addCourseOpen, setAddCourseOpen]       = useState(false);
  const [editCourseOpen, setEditCourseOpen]     = useState(false);
  const [editStudentOpen, setEditStudentOpen]   = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteCourseConfirmOpen, setDeleteCourseConfirmOpen] = useState(false);
  const [courseToDelete, setCourseToDelete]     = useState(null);
  const [prefillCourseName, setPrefillCourseName] = useState("");

  const [newStu, setNewStu]         = useState({ id: "", name: "" });
  const [newCourse, setNewCourse]   = useState({ name: "", credit: "", marks: "", attendance: "" });
  const [editCourse, setEditCourse] = useState(null);
  const [editStuForm, setEditStuForm] = useState({ name: "" });
  const [formErrors, setFormErrors] = useState({});

  const toastId    = useRef(0);
  const fileInputRef = useRef(null);

  const toast = useCallback((msg, type = "success") => {
    const id = ++toastId.current;
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(x => x.id !== id)), 3200);
  }, []);

  const selectedStudent = students.find(s => s.id === selectedId);

  // Computed stats
  const totalStudents  = students.length;
  const avgCGPA        = students.length ? (students.reduce((a, s) => a + calculateCGPA(s.courses), 0) / students.length).toFixed(2) : "0.00";
  const totalCourses   = students.reduce((a, s) => a + s.courses.length, 0);
  const debarredCount  = students.reduce((a, s) => a + s.courses.filter(c => c.attendance < 75).length, 0);
  const topper         = students.length ? students.reduce((b, s) => calculateCGPA(s.courses) > calculateCGPA(b.courses) ? s : b, students[0]) : null;
  const atRisk         = students.filter(s => calculateCGPA(s.courses) < 5 || s.courses.some(c => c.attendance < 75));

  const filteredStudents = students
    .filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || String(s.id).includes(search))
    .sort((a, b) => sortBy === "cgpa" ? calculateCGPA(b.courses) - calculateCGPA(a.courses) : sortBy === "id" ? a.id - b.id : a.name.localeCompare(b.name));

  // Handlers
  function handleAddStudent() {
    const errs = {};
    if (!newStu.id.match(/^\d+$/)) errs.id = "ID must be numeric";
    if (!newStu.name.trim() || /\d/.test(newStu.name)) errs.name = "Name cannot contain numbers";
    if (students.find(s => s.id === parseInt(newStu.id))) errs.id = "ID already exists";
    setFormErrors(errs); if (Object.keys(errs).length) return;
    setStudents(p => [...p, { id: parseInt(newStu.id), name: newStu.name.trim(), courses: [] }]);
    setNewStu({ id: "", name: "" }); setAddStudentOpen(false);
    toast(`Student "${newStu.name}" added!`);
  }

  function handleAddCourse() {
    const errs = {};
    if (!newCourse.name.trim() || !/^[a-zA-Z ]+$/.test(newCourse.name)) errs.name = "Letters and spaces only";
    const credit = parseInt(newCourse.credit);
    if (isNaN(credit) || credit <= 0) errs.credit = "Must be a positive integer";
    const att = parseFloat(newCourse.attendance);
    if (isNaN(att) || att < 0 || att > 100) errs.attendance = "Must be 0–100";
    if (att >= 75) { const m = parseInt(newCourse.marks); if (isNaN(m) || m < 0 || m > 100) errs.marks = "Must be 0–100"; }
    if (selectedStudent?.courses.find(c => c.name.toLowerCase() === newCourse.name.trim().toLowerCase())) errs.name = "Course already enrolled";
    setFormErrors(errs); if (Object.keys(errs).length) return;
    const marks2 = att < 75 ? 0 : parseInt(newCourse.marks);
    setStudents(p => p.map(s => s.id === selectedId ? { ...s, courses: [...s.courses, { name: newCourse.name.trim(), credit, marks: marks2, attendance: att }] } : s));
    setNewCourse({ name: "", credit: "", marks: "", attendance: "" }); setAddCourseOpen(false);
    toast(`Course "${newCourse.name}" added!`);
  }

  function handleEditCourse() {
    if (!editCourse) return;
    const errs = {};
    const att = parseFloat(editCourse.attendance);
    if (isNaN(att) || att < 0 || att > 100) errs.attendance = "Must be 0–100";
    if (att >= 75) { const m = parseInt(editCourse.marks); if (isNaN(m) || m < 0 || m > 100) errs.marks = "Must be 0–100"; }
    const credit = parseInt(editCourse.credit);
    if (isNaN(credit) || credit <= 0) errs.credit = "Must be a positive integer";
    setFormErrors(errs); if (Object.keys(errs).length) return;
    const marks2 = att < 75 ? 0 : parseInt(editCourse.marks);
    setStudents(p => p.map(s => s.id === selectedId ? { ...s, courses: s.courses.map(c => c.name === editCourse.original ? { ...c, marks: marks2, attendance: att, credit } : c) } : s));
    setEditCourseOpen(false); toast("Course updated!");
  }

  function handleEditStudent() {
    const errs = {};
    if (!editStuForm.name.trim() || /\d/.test(editStuForm.name)) errs.name = "Name cannot contain numbers";
    setFormErrors(errs); if (Object.keys(errs).length) return;
    setStudents(p => p.map(s => s.id === selectedId ? { ...s, name: editStuForm.name.trim() } : s));
    setEditStudentOpen(false); toast("Student updated!");
  }

  function handleDeleteStudent() {
    setStudents(p => p.filter(s => s.id !== selectedId));
    setDeleteConfirmOpen(false); setView("students"); setSelectedId(null);
    toast("Student deleted.", "error");
  }

  function handleDeleteCourse() {
    setStudents(p => p.map(s => s.id === selectedId ? { ...s, courses: s.courses.filter(c => c.name !== courseToDelete) } : s));
    setDeleteCourseConfirmOpen(false); toast(`Course removed.`, "error");
  }

  function handleExportJSON() {
    const blob = new Blob([JSON.stringify({ students, exportedAt: new Date().toISOString() }, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "sis-data.json"; a.click();
    toast("Exported sis-data.json!");
  }

  function handleImportJSON(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!Array.isArray(data.students)) throw new Error("Invalid format");
        setStudents(data.students);
        toast(`Imported ${data.students.length} students!`);
      } catch (err) { toast("Import failed: " + err.message, "error"); }
    };
    reader.readAsText(file); e.target.value = "";
  }

  function openAddCourseWithPrefill(name) {
    setNewCourse({ name, credit: "3", marks: "", attendance: "" });
    setFormErrors({});
    setAddCourseOpen(true);
  }

  // ── Analytics page data ──
  const gradeDistribution = Object.entries(
    students.flatMap(s => s.courses).reduce((acc, c) => {
      const g = c.attendance < 75 ? "F" : getGrade(c.marks);
      acc[g] = (acc[g] || 0) + 1; return acc;
    }, {})
  ).map(([g, v]) => ({ grade: g, count: v, color: GRADE_CONFIG[g]?.color }));

  const cgpaDistribution = [
    { range: "9–10", count: students.filter(s => calculateCGPA(s.courses) >= 9).length, color: "#00f5c4" },
    { range: "8–9",  count: students.filter(s => { const c = calculateCGPA(s.courses); return c >= 8 && c < 9; }).length, color: "#7c3aed" },
    { range: "7–8",  count: students.filter(s => { const c = calculateCGPA(s.courses); return c >= 7 && c < 8; }).length, color: "#3b82f6" },
    { range: "6–7",  count: students.filter(s => { const c = calculateCGPA(s.courses); return c >= 6 && c < 7; }).length, color: "#f59e0b" },
    { range: "< 6",  count: students.filter(s => calculateCGPA(s.courses) < 6).length, color: "#ef4444" },
  ];

  const tick = { fill: t.textDim, fontSize: 10, fontFamily: "'Space Mono',monospace" };
  const tooltip = { contentStyle: { background: t.card, border: `1px solid ${t.border}`, borderRadius: 8, fontFamily: "'Space Mono',monospace", fontSize: 11, color: t.text } };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Space+Mono:wght@400;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:${t.bg};transition:background .3s}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:${t.bg}}
        ::-webkit-scrollbar-thumb{background:${t.border};border-radius:4px}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes scan{0%{top:0}100%{top:100%}}
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Space Mono',monospace", background: t.bg }}>

        {/* ── Sidebar ── */}
        <div style={{ width: 210, background: t.sidebar, borderRight: `1px solid ${t.sidebarBorder}`, display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 100, transition: "background .3s" }}>
          <div style={{ padding: "28px 22px 22px" }}>
            <div style={{ fontSize: 10, color: t.accentPrimary, letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>v3.0</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: t.text, fontFamily: "'Syne',sans-serif", lineHeight: 1.2 }}>Student Info<br />System</div>
          </div>

          <nav style={{ flex: 1, padding: "0 10px" }}>
            {NAV.map(n => (
              <button key={n.id} onClick={() => { setView(n.id); setSelectedId(null); }}
                style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "11px 12px", background: view === n.id ? `${t.accentPrimary}22` : "none", border: "none", cursor: "pointer", color: view === n.id ? t.text : t.textDim, fontSize: 12, fontFamily: "'Space Mono',monospace", textAlign: "left", borderRadius: 10, marginBottom: 3, transition: "all .18s" }}>
                <span style={{ fontSize: 17 }}>{n.icon}</span>
                {n.label}
              </button>
            ))}
          </nav>

          <div style={{ padding: "12px 16px", borderTop: `1px solid ${t.sidebarBorder}` }}>
            <button onClick={() => setThemeName(n => n === "dark" ? "light" : "dark")}
              style={{ width: "100%", background: t.isDark ? "#1a1a3a" : "#f0e8ff", border: `1px solid ${t.border}`, borderRadius: 9, padding: "8px 12px", color: t.textMuted, cursor: "pointer", fontSize: 11, fontFamily: "'Space Mono',monospace", display: "flex", alignItems: "center", gap: 8 }}>
              {t.isDark ? "☀ Light mode" : "☾ Dark mode"}
            </button>
          </div>

          <div style={{ padding: "8px 16px 14px", borderTop: `1px solid ${t.sidebarBorder}`, display: "flex", flexDirection: "column", gap: 7 }}>
            <button onClick={handleExportJSON} style={{ background: "none", border: `1px solid ${t.accentGreen}44`, borderRadius: 7, padding: "7px 10px", color: t.accentGreen, cursor: "pointer", fontSize: 11, fontFamily: "'Space Mono',monospace", textAlign: "left" }}>↓ Export JSON</button>
            <button onClick={() => fileInputRef.current?.click()} style={{ background: "none", border: `1px solid ${t.accentBlue}44`, borderRadius: 7, padding: "7px 10px", color: t.accentBlue, cursor: "pointer", fontSize: 11, fontFamily: "'Space Mono',monospace", textAlign: "left" }}>↑ Import JSON</button>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImportJSON} style={{ display: "none" }} />
          </div>

          <div style={{ padding: "0 16px 14px" }}>
            <div style={{ fontSize: 10, color: t.textFaint, lineHeight: 2 }}>{students.length} students · {totalCourses} courses</div>
          </div>
        </div>

        {/* ── Main ── */}
        <div style={{ marginLeft: 210, flex: 1, padding: "32px 36px", minHeight: "100vh" }}>

          {/* ── DASHBOARD ── */}
          {view === "dashboard" && !selectedId && (
            <div style={{ animation: "fadeIn .3s" }}>
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 11, color: t.accentPrimary, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>Overview</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: t.text, fontFamily: "'Syne',sans-serif" }}>Dashboard</div>
              </div>

              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 28 }}>
                <StatCard label="Students"    value={totalStudents} accent={t.accentPrimary} icon="👥" t={t} onClick={() => setView("students")} />
                <StatCard label="Avg CGPA"    value={avgCGPA}       accent={t.accentGreen}   icon="📊" sub="/ 10.0" t={t} />
                <StatCard label="Enrollments" value={totalCourses}  accent={t.accentBlue}    icon="📚" t={t} />
                <StatCard label="Debarred"    value={debarredCount} accent="#ef4444"          icon="⚠️" sub="low attendance" t={t} />
                <StatCard label="At Risk"     value={atRisk.length} accent="#f97316"          icon="🔴" sub="need attention" t={t} onClick={() => setView("students")} />
              </div>

              {/* Top performer */}
              {topper && (
                <div style={{ background: t.isDark ? "linear-gradient(90deg,#7c3aed22,#00f5c411)" : "linear-gradient(90deg,#f0e8ff,#e8fff5)", border: `1px solid ${t.accentPrimary}33`, borderRadius: 16, padding: "18px 24px", marginBottom: 24, display: "flex", alignItems: "center", gap: 16, cursor: "pointer" }}
                  onClick={() => { setSelectedId(topper.id); setView("students"); }}>
                  <span style={{ fontSize: 32 }}>🏆</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: t.accentPrimary, letterSpacing: 2, textTransform: "uppercase", marginBottom: 2 }}>Top Performer</div>
                    <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Syne',sans-serif", color: t.text }}>{topper.name}</div>
                    <div style={{ fontSize: 11, color: t.textDim, marginTop: 2 }}>{topper.courses.length} courses · CGPA {calculateCGPA(topper.courses).toFixed(2)}</div>
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 800, color: t.accentGreen, fontFamily: "'Syne',sans-serif" }}>{calculateCGPA(topper.courses).toFixed(2)}</div>
                </div>
              )}

              {/* At-risk alert */}
              {atRisk.length > 0 && (
                <div style={{ background: "#ef444411", border: "1px solid #ef444433", borderRadius: 14, padding: "16px 20px", marginBottom: 24 }}>
                  <div style={{ fontSize: 11, color: "#ef4444", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>⚠ Students Needing Attention</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {atRisk.map(s => (
                      <div key={s.id} onClick={() => { setSelectedId(s.id); setView("students"); }} style={{ background: "#ef444422", border: "1px solid #ef444444", borderRadius: 8, padding: "6px 12px", cursor: "pointer" }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#ef4444" }}>{s.name}</div>
                        <div style={{ fontSize: 10, color: "#ef444488" }}>CGPA: {calculateCGPA(s.courses).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CGPA Ranking */}
              <div style={{ fontSize: 11, color: t.textDim, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>CGPA Ranking</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[...students].sort((a, b) => calculateCGPA(b.courses) - calculateCGPA(a.courses)).map((s, i) => {
                  const cgpa = calculateCGPA(s.courses);
                  return (
                    <div key={s.id} onClick={() => { setSelectedId(s.id); setView("students"); }}
                      style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", transition: "border-color .18s, transform .18s" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = `${t.accentPrimary}55`; e.currentTarget.style.transform = "translateX(3px)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.transform = "none"; }}>
                      <div style={{ fontSize: 13, color: i < 3 ? t.accentGreen : t.textFaint, fontWeight: 700, minWidth: 26, fontFamily: "'Syne',sans-serif" }}>#{i + 1}</div>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg,#7c3aed,#00f5c4)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: "#fff", fontFamily: "'Syne',sans-serif", flexShrink: 0 }}>{s.name[0]}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 5 }}>{s.name} <span style={{ color: t.textFaint, fontSize: 10 }}>#{s.id}</span></div>
                        <CGPABar cgpa={cgpa} t={t} />
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: cgpa >= 8.5 ? t.accentGreen : cgpa >= 6 ? t.accentPrimary : "#ef4444", fontFamily: "'Syne',sans-serif", minWidth: 50, textAlign: "right" }}>{cgpa.toFixed(2)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── STUDENTS LIST or DETAIL ── */}
          {view === "students" && !selectedId && (
            <div style={{ animation: "fadeIn .3s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
                <div>
                  <div style={{ fontSize: 11, color: t.accentPrimary, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>All Records</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: t.text, fontFamily: "'Syne',sans-serif" }}>Students</div>
                </div>
                <Btn variant="accent" t={t} onClick={() => { setFormErrors({}); setNewStu({ id: "", name: "" }); setAddStudentOpen(true); }}>+ Add Student</Btn>
              </div>
              <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or ID…"
                  style={{ flex: 1, background: t.input, border: `1px solid ${t.border}`, borderRadius: 8, padding: "9px 14px", color: t.text, fontSize: 12, fontFamily: "'Space Mono',monospace", outline: "none" }} />
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  style={{ background: t.input, border: `1px solid ${t.border}`, borderRadius: 8, padding: "9px 14px", color: t.text, fontSize: 11, fontFamily: "'Space Mono',monospace", outline: "none" }}>
                  <option value="cgpa">Sort: CGPA</option>
                  <option value="name">Sort: Name</option>
                  <option value="id">Sort: ID</option>
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {filteredStudents.map(s => {
                  const cgpa = calculateCGPA(s.courses);
                  const deb = s.courses.filter(c => c.attendance < 75).length;
                  return (
                    <div key={s.id} onClick={() => { setSelectedId(s.id); setDetailTab("overview"); }}
                      style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: "16px 22px", cursor: "pointer", display: "flex", alignItems: "center", gap: 18, transition: "all .18s" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = `${t.accentPrimary}55`; e.currentTarget.style.transform = "translateX(4px)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.transform = "none"; }}>
                      <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#00f5c4)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, color: "#fff", fontFamily: "'Syne',sans-serif", flexShrink: 0 }}>{s.name[0]}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 3, fontFamily: "'Syne',sans-serif" }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: t.textDim }}>ID: {s.id} · {s.courses.length} courses {deb > 0 && <span style={{ color: "#ef4444" }}>· {deb} debarred</span>}</div>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        {deb > 0 && <Badge label="AT RISK" color="#ef4444" />}
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 10, color: t.textDim, marginBottom: 2 }}>CGPA</div>
                          <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Syne',sans-serif", color: cgpa >= 8.5 ? t.accentGreen : cgpa >= 6 ? t.accentPrimary : "#ef4444" }}>{cgpa.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filteredStudents.length === 0 && <div style={{ textAlign: "center", color: t.textFaint, padding: 40, border: `1px dashed ${t.border}`, borderRadius: 12 }}>No students found.</div>}
              </div>
            </div>
          )}

          {/* ── STUDENT DETAIL ── */}
          {view === "students" && selectedId && selectedStudent && (
            <div style={{ animation: "fadeIn .3s" }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <button onClick={() => setSelectedId(null)} style={{ background: "none", border: "none", color: t.textMuted, cursor: "pointer", fontSize: 13, fontFamily: "'Space Mono',monospace" }}>← All Students</button>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Btn variant="ghost"   t={t} onClick={() => { setEditStuForm({ name: selectedStudent.name }); setFormErrors({}); setEditStudentOpen(true); }}>Edit</Btn>
                  <Btn variant="outline" t={t} onClick={() => exportPDF(selectedStudent)}>⬇ PDF</Btn>
                  <Btn variant="accent"  t={t} onClick={() => { setFormErrors({}); setNewCourse({ name: "", credit: "", marks: "", attendance: "" }); setAddCourseOpen(true); }}>+ Course</Btn>
                  <Btn variant="danger"  t={t} onClick={() => setDeleteConfirmOpen(true)}>Delete</Btn>
                </div>
              </div>

              {/* Profile */}
              <div style={{ background: t.isDark ? "linear-gradient(135deg,#0e0e24 60%,#160d35 100%)" : "linear-gradient(135deg,#fff 60%,#f0e8ff 100%)", border: `1px solid ${t.accentPrimary}33`, borderRadius: 18, padding: "24px 28px", marginBottom: 20, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                <div style={{ width: 68, height: 68, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#00f5c4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 800, color: "#fff", fontFamily: "'Syne',sans-serif", flexShrink: 0 }}>{selectedStudent.name[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: t.text, fontFamily: "'Syne',sans-serif", marginBottom: 4 }}>{selectedStudent.name}</div>
                  <div style={{ fontSize: 12, color: t.textDim }}>ID: {selectedStudent.id} · {selectedStudent.courses.length} courses · {selectedStudent.courses.reduce((a, c) => a + c.credit, 0)} credits</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: t.textDim, marginBottom: 3, letterSpacing: 1 }}>CGPA</div>
                  <div style={{ fontSize: 38, fontWeight: 800, fontFamily: "'Syne',sans-serif", color: t.accentGreen, lineHeight: 1 }}>{calculateCGPA(selectedStudent.courses).toFixed(2)}</div>
                  <div style={{ fontSize: 10, color: t.textDim }}>/ 10.00</div>
                  <div style={{ marginTop: 6, width: 130 }}><CGPABar cgpa={calculateCGPA(selectedStudent.courses)} t={t} height={6} /></div>
                </div>
              </div>

              {/* Detail tabs */}
              <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
                {["overview", "ai prediction", "charts", "qr attendance", "recommendations", "mobile preview"].map(tab => (
                  <button key={tab} onClick={() => setDetailTab(tab)}
                    style={{ background: detailTab === tab ? "linear-gradient(90deg,#7c3aed,#5b21b6)" : (t.isDark ? "#0a0a1e" : "#f4f4fc"), border: `1px solid ${detailTab === tab ? "#7c3aed" : t.border}`, borderRadius: 9, padding: "7px 16px", color: detailTab === tab ? "#fff" : t.textMuted, fontSize: 11, fontWeight: detailTab === tab ? 700 : 400, cursor: "pointer", fontFamily: "'Space Mono',monospace", textTransform: "capitalize", transition: "all .18s" }}>
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              {detailTab === "overview" && (
                <>
                  {/* Grade distribution */}
                  {selectedStudent.courses.length > 0 && (
                    <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: "18px 22px", marginBottom: 16 }}>
                      <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Grade Distribution</div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {Object.entries(selectedStudent.courses.reduce((acc, c) => { const g = c.attendance < 75 ? "F" : getGrade(c.marks); acc[g] = (acc[g] || 0) + 1; return acc; }, {})).map(([g, cnt]) => (
                          <div key={g} style={{ background: `${GRADE_CONFIG[g]?.color}22`, border: `1px solid ${GRADE_CONFIG[g]?.color}55`, borderRadius: 10, padding: "10px 18px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <div style={{ fontSize: 20, fontWeight: 800, color: GRADE_CONFIG[g]?.color, fontFamily: "'Syne',sans-serif" }}>{g}</div>
                            <div style={{ fontSize: 10, color: t.textDim }}>{GRADE_CONFIG[g]?.label}</div>
                            <div style={{ fontSize: 11, color: t.textMuted }}>{cnt}×</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Courses */}
                  <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Enrolled Courses</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {selectedStudent.courses.map(c => {
                      const debarred = c.attendance < 75;
                      const grade = debarred ? "F" : getGrade(c.marks);
                      const gc = GRADE_CONFIG[grade];
                      return (
                        <div key={c.name} style={{ background: t.card, border: `1px solid ${debarred ? "#ef444433" : t.border}`, borderRadius: 12, padding: "14px 18px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 2, fontFamily: "'Syne',sans-serif" }}>{c.name}</div>
                              <div style={{ fontSize: 11, color: t.textDim }}>{c.credit} credits</div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              {debarred && <Badge label="DEBARRED" color="#ef4444" />}
                              <div style={{ width: 36, height: 36, borderRadius: 8, background: `${gc?.color}22`, border: `1px solid ${gc?.color}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: gc?.color, fontFamily: "'Syne',sans-serif" }}>{grade}</div>
                              <button onClick={() => { setEditCourse({ ...c, original: c.name, marks: String(c.marks), attendance: String(c.attendance), credit: String(c.credit) }); setFormErrors({}); setEditCourseOpen(true); }}
                                style={{ background: t.isDark ? "#1a1a3a" : "#f0e8ff", border: `1px solid ${t.border}`, borderRadius: 6, color: t.textMuted, cursor: "pointer", padding: "5px 10px", fontSize: 11, fontFamily: "'Space Mono',monospace" }}>Edit</button>
                              <button onClick={() => { setCourseToDelete(c.name); setDeleteCourseConfirmOpen(true); }}
                                style={{ background: "#1a0508", border: "1px solid #ef444433", borderRadius: 6, color: "#ef4444", cursor: "pointer", padding: "5px 10px", fontSize: 11, fontFamily: "'Space Mono',monospace" }}>✕</button>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 10 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: t.textDim, marginBottom: 4 }}>
                                <span>Marks: {debarred ? "0 (debarred)" : c.marks}</span>
                                <span style={{ color: gc?.color }}>{gc?.label}</span>
                              </div>
                              <div style={{ background: t.isDark ? "#0a0a1e" : "#eee", borderRadius: 4, height: 5, overflow: "hidden" }}>
                                <div style={{ width: `${debarred ? 0 : c.marks}%`, height: "100%", background: `linear-gradient(90deg,${gc?.color}88,${gc?.color})`, borderRadius: 4, transition: "width .6s" }} />
                              </div>
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: t.textDim, marginBottom: 4 }}>
                                <span>Attendance: {c.attendance}%</span>
                                {debarred && <span style={{ color: "#ef4444" }}>Below 75%</span>}
                              </div>
                              <div style={{ background: t.isDark ? "#0a0a1e" : "#eee", borderRadius: 4, height: 5, overflow: "hidden" }}>
                                <div style={{ width: `${c.attendance}%`, height: "100%", background: c.attendance < 75 ? "linear-gradient(90deg,#ef444488,#ef4444)" : "linear-gradient(90deg,#3b82f688,#3b82f6)", borderRadius: 4, transition: "width .6s" }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {selectedStudent.courses.length === 0 && (
                      <div style={{ textAlign: "center", color: t.textFaint, padding: 36, border: `1px dashed ${t.border}`, borderRadius: 12 }}>No courses added yet. <span onClick={() => setAddCourseOpen(true)} style={{ color: t.accentPrimary, cursor: "pointer" }}>Add one</span></div>
                    )}
                  </div>
                </>
              )}

              {detailTab === "ai prediction" && <AIPrediction student={selectedStudent} t={t} />}

              {detailTab === "charts" && <DataViz student={selectedStudent} allStudents={students} t={t} />}

              {detailTab === "qr attendance" && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>QR Attendance System</div>
                  <QRAttendance student={selectedStudent} t={t} />
                </div>
              )}

              {detailTab === "recommendations" && (
                <CourseRecommendations student={selectedStudent} t={t}
                  onAddCourse={name => openAddCourseWithPrefill(name)} />
              )}

              {detailTab === "mobile preview" && <MobilePreview student={selectedStudent} t={t} />}
            </div>
          )}

          {/* ── ANALYTICS PAGE ── */}
          {view === "analytics" && (
            <div style={{ animation: "fadeIn .3s" }}>
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 11, color: t.accentPrimary, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>Insights</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: t.text, fontFamily: "'Syne',sans-serif" }}>Analytics</div>
              </div>

              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 28 }}>
                <StatCard label="Total Students" value={totalStudents} accent={t.accentPrimary} t={t} />
                <StatCard label="Avg CGPA"       value={avgCGPA}       accent={t.accentGreen} sub="/10" t={t} />
                <StatCard label="Pass Rate"      value={`${Math.round((students.filter(s => calculateCGPA(s.courses) >= 4).length / Math.max(students.length, 1)) * 100)}%`} accent={t.accentBlue} t={t} />
                <StatCard label="Excellence"     value={`${Math.round((students.filter(s => calculateCGPA(s.courses) >= 8.5).length / Math.max(students.length, 1)) * 100)}%`} accent="#00f5c4" sub="CGPA ≥ 8.5" t={t} />
              </div>

              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                {/* Grade distribution */}
                <div style={{ flex: 1, minWidth: 260, background: t.card, border: `1px solid ${t.border}`, borderRadius: 16, padding: "20px" }}>
                  <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>Grade Distribution (All Courses)</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={gradeDistribution} barSize={28}>
                      <XAxis dataKey="grade" tick={tick} axisLine={false} tickLine={false} />
                      <YAxis tick={tick} axisLine={false} tickLine={false} />
                      <Tooltip {...tooltip} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {gradeDistribution.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* CGPA distribution */}
                <div style={{ flex: 1, minWidth: 260, background: t.card, border: `1px solid ${t.border}`, borderRadius: 16, padding: "20px" }}>
                  <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>CGPA Distribution</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={cgpaDistribution} barSize={28}>
                      <XAxis dataKey="range" tick={tick} axisLine={false} tickLine={false} />
                      <YAxis tick={tick} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip {...tooltip} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {cgpaDistribution.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Student CGPA radar (top 5) */}
                <div style={{ flex: 1, minWidth: 260, background: t.card, border: `1px solid ${t.border}`, borderRadius: 16, padding: "20px" }}>
                  <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>Top 5 Students CGPA</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={[...students].sort((a, b) => calculateCGPA(b.courses) - calculateCGPA(a.courses)).slice(0, 5).map(s => ({ name: s.name.split(" ")[0], cgpa: Math.round(calculateCGPA(s.courses) * 100) / 100 }))} layout="vertical" barSize={14}>
                      <XAxis type="number" domain={[0, 10]} tick={tick} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" tick={tick} axisLine={false} tickLine={false} width={60} />
                      <Tooltip {...tooltip} />
                      <Bar dataKey="cgpa" radius={[0, 4, 4, 0]}>
                        {students.slice(0, 5).map((_, i) => <Cell key={i} fill={["#00f5c4","#7c3aed","#3b82f6","#f59e0b","#f97316"][i]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Attendance vs Marks scatter (approximate) */}
              <div style={{ marginTop: 14, background: t.card, border: `1px solid ${t.border}`, borderRadius: 16, padding: "20px" }}>
                <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>All Students — CGPA Leaderboard</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[...students].sort((a, b) => calculateCGPA(b.courses) - calculateCGPA(a.courses)).map((s, i) => {
                    const cgpa = calculateCGPA(s.courses);
                    return (
                      <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 20, fontSize: 10, color: t.textFaint, textAlign: "right" }}>#{i+1}</div>
                        <div style={{ width: 80, fontSize: 11, color: t.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</div>
                        <div style={{ flex: 1 }}><CGPABar cgpa={cgpa} t={t} height={10} /></div>
                        <div style={{ width: 38, fontSize: 13, fontWeight: 800, color: cgpa >= 8.5 ? t.accentGreen : cgpa >= 6 ? t.accentPrimary : "#ef4444", fontFamily: "'Syne',sans-serif", textAlign: "right" }}>{cgpa.toFixed(1)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── ATTENDANCE PAGE ── */}
          {view === "attendance" && (
            <div style={{ animation: "fadeIn .3s" }}>
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 11, color: t.accentPrimary, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>QR System</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: t.text, fontFamily: "'Syne',sans-serif" }}>Attendance</div>
              </div>

              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
                <StatCard label="Debarred Courses" value={debarredCount} accent="#ef4444" sub="< 75% attendance" t={t} />
                <StatCard label="Good Attendance"  value={students.reduce((a, s) => a + s.courses.filter(c => c.attendance >= 75).length, 0)} accent={t.accentGreen} t={t} />
                <StatCard label="Avg Attendance"   value={`${Math.round(students.flatMap(s => s.courses).reduce((a, c) => a + c.attendance, 0) / Math.max(students.flatMap(s => s.courses).length, 1))}%`} accent={t.accentBlue} t={t} />
              </div>

              <div style={{ fontSize: 13, color: t.textMuted, marginBottom: 16 }}>Select a student to scan or generate their QR code:</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
                {students.map(s => {
                  const bad = s.courses.filter(c => c.attendance < 75).length;
                  return (
                    <div key={s.id} onClick={() => { setSelectedId(s.id); setView("students"); setDetailTab("qr attendance"); }}
                      style={{ background: t.card, border: `1px solid ${bad > 0 ? "#ef444433" : t.border}`, borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", transition: "all .18s" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = `${t.accentPrimary}55`}
                      onMouseLeave={e => e.currentTarget.style.borderColor = bad > 0 ? "#ef444433" : t.border}>
                      <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#00f5c4)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#fff", fontFamily: "'Syne',sans-serif", flexShrink: 0 }}>{s.name[0]}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: t.text, fontFamily: "'Syne',sans-serif", marginBottom: 2 }}>{s.name}</div>
                        <div style={{ display: "flex", gap: 6 }}>
                          {s.courses.map(c => (
                            <div key={c.name} style={{ fontSize: 9, padding: "2px 7px", background: c.attendance < 75 ? "#ef444422" : "#3b82f622", border: `1px solid ${c.attendance < 75 ? "#ef444444" : "#3b82f644"}`, borderRadius: 4, color: c.attendance < 75 ? "#ef4444" : "#3b82f6" }}>
                              {c.attendance}%
                            </div>
                          ))}
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: t.textMuted, fontFamily: "'Space Mono',monospace" }}>Scan QR →</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      <Modal open={addStudentOpen} title="Add New Student" onClose={() => setAddStudentOpen(false)} t={t}>
        <Input label="Student ID" value={newStu.id}   onChange={e => setNewStu(p => ({...p, id: e.target.value}))}   placeholder="e.g. 1042"       error={formErrors.id}   t={t} />
        <Input label="Full Name"  value={newStu.name} onChange={e => setNewStu(p => ({...p, name: e.target.value}))} placeholder="e.g. John Smith" error={formErrors.name} t={t} />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
          <Btn variant="ghost" t={t} onClick={() => setAddStudentOpen(false)}>Cancel</Btn>
          <Btn variant="accent" t={t} onClick={handleAddStudent}>Add Student</Btn>
        </div>
      </Modal>

      <Modal open={addCourseOpen} title="Add Course" onClose={() => setAddCourseOpen(false)} t={t}>
        <Input label="Course Name"  value={newCourse.name}       onChange={e => setNewCourse(p => ({...p, name: e.target.value}))}       placeholder="e.g. Data Structures" error={formErrors.name}       t={t} />
        <Input label="Credits"      value={newCourse.credit}     onChange={e => setNewCourse(p => ({...p, credit: e.target.value}))}     placeholder="e.g. 4"               error={formErrors.credit}     type="number" min="1" t={t} />
        <Input label="Attendance %" value={newCourse.attendance} onChange={e => setNewCourse(p => ({...p, attendance: e.target.value}))} placeholder="e.g. 85.5"            error={formErrors.attendance} type="number" min="0" max="100" step="0.1" t={t} />
        {parseFloat(newCourse.attendance) >= 75 && <Input label="Marks (0–100)" value={newCourse.marks} onChange={e => setNewCourse(p => ({...p, marks: e.target.value}))} placeholder="e.g. 82" error={formErrors.marks} type="number" min="0" max="100" t={t} />}
        {parseFloat(newCourse.attendance) < 75 && newCourse.attendance !== "" && (
          <div style={{ background: "#1a0508", border: "1px solid #ef444433", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#ef4444", marginBottom: 16 }}>⚠ Attendance below 75% — will be debarred. Marks set to 0.</div>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
          <Btn variant="ghost" t={t} onClick={() => setAddCourseOpen(false)}>Cancel</Btn>
          <Btn variant="accent" t={t} onClick={handleAddCourse}>Add Course</Btn>
        </div>
      </Modal>

      <Modal open={editCourseOpen} title={`Edit: ${editCourse?.name}`} onClose={() => setEditCourseOpen(false)} t={t}>
        {editCourse && <>
          <Input label="Credits"      value={editCourse.credit}     onChange={e => setEditCourse(p => ({...p, credit: e.target.value}))}     type="number" min="1"   error={formErrors.credit}     t={t} />
          <Input label="Attendance %" value={editCourse.attendance} onChange={e => setEditCourse(p => ({...p, attendance: e.target.value}))} type="number" min="0" max="100" step="0.1" error={formErrors.attendance} t={t} />
          {parseFloat(editCourse.attendance) >= 75 && <Input label="Marks (0–100)" value={editCourse.marks} onChange={e => setEditCourse(p => ({...p, marks: e.target.value}))} type="number" min="0" max="100" error={formErrors.marks} t={t} />}
          {parseFloat(editCourse.attendance) < 75 && <div style={{ background: "#1a0508", border: "1px solid #ef444433", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#ef4444", marginBottom: 16 }}>⚠ Below 75% — will be debarred.</div>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
            <Btn variant="ghost" t={t} onClick={() => setEditCourseOpen(false)}>Cancel</Btn>
            <Btn variant="primary" t={t} onClick={handleEditCourse}>Save Changes</Btn>
          </div>
        </>}
      </Modal>

      <Modal open={editStudentOpen} title="Edit Student" onClose={() => setEditStudentOpen(false)} t={t}>
        <Input label="Full Name" value={editStuForm.name} onChange={e => setEditStuForm(p => ({...p, name: e.target.value}))} error={formErrors.name} t={t} />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
          <Btn variant="ghost" t={t} onClick={() => setEditStudentOpen(false)}>Cancel</Btn>
          <Btn variant="primary" t={t} onClick={handleEditStudent}>Save</Btn>
        </div>
      </Modal>

      <Modal open={deleteConfirmOpen} title="Delete Student?" onClose={() => setDeleteConfirmOpen(false)} t={t}>
        <div style={{ color: t.textMuted, fontSize: 13, marginBottom: 20 }}>Permanently delete <span style={{ color: t.text, fontWeight: 700 }}>{selectedStudent?.name}</span> and all their data?</div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <Btn variant="ghost" t={t} onClick={() => setDeleteConfirmOpen(false)}>Cancel</Btn>
          <Btn variant="danger" t={t} onClick={handleDeleteStudent}>Delete</Btn>
        </div>
      </Modal>

      <Modal open={deleteCourseConfirmOpen} title="Remove Course?" onClose={() => setDeleteCourseConfirmOpen(false)} t={t}>
        <div style={{ color: t.textMuted, fontSize: 13, marginBottom: 20 }}>Remove <span style={{ color: t.text, fontWeight: 700 }}>{courseToDelete}</span>?</div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <Btn variant="ghost" t={t} onClick={() => setDeleteCourseConfirmOpen(false)}>Cancel</Btn>
          <Btn variant="danger" t={t} onClick={handleDeleteCourse}>Remove</Btn>
        </div>
      </Modal>

      <Toast toasts={toasts} t={t} />
    </>
  );
}
