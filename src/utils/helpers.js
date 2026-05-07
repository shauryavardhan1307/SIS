import { GRADE_CONFIG } from "./theme";

export function getGrade(mark) {
  if (mark >= 90) return "S"; if (mark >= 80) return "A"; if (mark >= 70) return "B";
  if (mark >= 60) return "C"; if (mark >= 50) return "D"; if (mark >= 40) return "E";
  return "F";
}

export function calculateCGPA(courses) {
  let tp = 0, tc = 0;
  courses.forEach(c => {
    const g = c.attendance < 75 ? "F" : getGrade(c.marks);
    tp += c.credit * (GRADE_CONFIG[g]?.point ?? 0);
    tc += c.credit;
  });
  return tc === 0 ? 0 : tp / tc;
}

// AI Performance Prediction engine
export function predictPerformance(student) {
  const courses = student.courses;
  if (courses.length === 0) return null;

  const cgpa = calculateCGPA(courses);
  const avgAttendance = courses.reduce((a, c) => a + c.attendance, 0) / courses.length;
  const avgMarks = courses.reduce((a, c) => a + (c.attendance < 75 ? 0 : c.marks), 0) / courses.length;
  const debarredRatio = courses.filter(c => c.attendance < 75).length / courses.length;
  const trend = courses.length > 1
    ? courses.slice(-3).reduce((a, c, i, arr) => i === 0 ? 0 : a + ((c.attendance < 75 ? 0 : c.marks) - (arr[i-1].attendance < 75 ? 0 : arr[i-1].marks)), 0) / Math.max(courses.slice(-3).length - 1, 1)
    : 0;

  // Predicted CGPA next semester
  let predictedCGPA = cgpa;
  if (trend > 0) predictedCGPA = Math.min(10, cgpa + trend * 0.05);
  if (trend < 0) predictedCGPA = Math.max(0, cgpa + trend * 0.05);
  if (avgAttendance < 75) predictedCGPA = Math.max(0, predictedCGPA - 0.5);
  if (avgAttendance > 90) predictedCGPA = Math.min(10, predictedCGPA + 0.2);

  // Risk level
  let risk = "Low";
  let riskColor = "#00f5c4";
  if (debarredRatio > 0.3 || cgpa < 5) { risk = "High"; riskColor = "#ef4444"; }
  else if (debarredRatio > 0.1 || cgpa < 6.5) { risk = "Medium"; riskColor = "#f97316"; }

  // Strengths & weaknesses
  const sorted = [...courses].filter(c => c.attendance >= 75).sort((a, b) => b.marks - a.marks);
  const strengths = sorted.slice(0, 2).map(c => c.name);
  const weaknesses = sorted.slice(-2).reverse().filter(c => c.marks < 70).map(c => c.name);

  // AI suggestions
  const suggestions = [];
  if (avgAttendance < 80) suggestions.push("📅 Improve attendance to unlock better grades");
  if (cgpa < 6) suggestions.push("📚 Consider extra tutoring or study groups");
  if (trend < -5) suggestions.push("📉 Marks are declining — revisit study methods");
  if (trend > 5) suggestions.push("📈 Great upward trend — keep up the momentum!");
  if (debarredRatio > 0) suggestions.push("⚠️ You have debarred courses — prioritize attendance");
  if (avgMarks > 85 && avgAttendance > 90) suggestions.push("🌟 Excellent performance — consider advanced electives");
  if (suggestions.length === 0) suggestions.push("✅ Performance is stable — maintain consistency");

  return {
    predictedCGPA: Math.round(predictedCGPA * 100) / 100,
    currentCGPA: Math.round(cgpa * 100) / 100,
    risk, riskColor, trend,
    avgAttendance: Math.round(avgAttendance * 10) / 10,
    avgMarks: Math.round(avgMarks * 10) / 10,
    strengths, weaknesses, suggestions,
    scoreBreakdown: {
      academic: Math.min(100, Math.round(cgpa * 10)),
      attendance: Math.round(avgAttendance),
      consistency: Math.min(100, Math.max(0, Math.round(50 + trend * 2 - debarredRatio * 30))),
      improvement: trend > 0 ? Math.min(100, Math.round(50 + trend * 3)) : Math.max(0, Math.round(50 + trend * 3)),
    }
  };
}

// Course recommendation engine
export function recommendCourses(student, catalog) {
  const enrolled = new Set(student.courses.map(c => c.name.toLowerCase()));
  const cgpa = calculateCGPA(student.courses);
  const avgMarks = student.courses.length
    ? student.courses.reduce((a, c) => a + (c.attendance < 75 ? 0 : c.marks), 0) / student.courses.length
    : 0;

  // Find best performing category
  const catScores = {};
  student.courses.forEach(c => {
    const cat = catalog.find(x => x.name === c.name)?.category;
    if (cat) {
      if (!catScores[cat]) catScores[cat] = { total: 0, count: 0 };
      catScores[cat].total += c.attendance < 75 ? 0 : c.marks;
      catScores[cat].count++;
    }
  });
  const bestCat = Object.entries(catScores).sort((a, b) => (b[1].total / b[1].count) - (a[1].total / a[1].count))[0]?.[0];

  return catalog
    .filter(c => !enrolled.has(c.name.toLowerCase()))
    .map(c => {
      let score = 50;
      if (c.category === bestCat) score += 25;
      if (c.difficulty === "Easy" && avgMarks < 60) score += 20;
      if (c.difficulty === "Hard" && cgpa > 8) score += 15;
      if (c.difficulty === "Medium" && cgpa > 6) score += 10;
      const reason = c.category === bestCat
        ? `Matches your strength in ${bestCat}`
        : c.difficulty === "Easy" && avgMarks < 60
          ? "Good starting point given current performance"
          : `Popular in ${c.category}`;
      return { ...c, matchScore: Math.min(99, score), reason };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 6);
}

// QR code data generator (base64 encoded SVG QR-like visual)
export function generateQRData(student) {
  return `SIS|ID:${student.id}|NAME:${student.name}|COURSES:${student.courses.length}|CGPA:${calculateCGPA(student.courses).toFixed(2)}`;
}

// Export PDF
export function exportPDF(student) {
  const cgpa = calculateCGPA(student.courses).toFixed(2);
  const prediction = predictPerformance(student);
  const rows = student.courses.map(c => {
    const deb = c.attendance < 75;
    const grade = deb ? "F" : getGrade(c.marks);
    return `<tr><td>${c.name}</td><td>${c.credit}</td><td>${deb ? "0 (debarred)" : c.marks}</td><td>${c.attendance}%</td><td style="color:${GRADE_CONFIG[grade]?.color};font-weight:700">${grade}</td><td>${deb ? '<span style="color:#ef4444">YES</span>' : "No"}</td></tr>`;
  }).join("");
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Report – ${student.name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Space+Mono&display=swap');
    *{margin:0;padding:0;box-sizing:border-box} body{font-family:'Space Mono',monospace;background:#fff;color:#0e0e24;padding:40px}
    h1{font-family:'Syne',sans-serif;font-size:28px;font-weight:800;color:#7c3aed;margin-bottom:4px}
    h2{font-family:'Syne',sans-serif;font-size:16px;font-weight:800;color:#0e0e24;margin:28px 0 12px}
    .sub{font-size:12px;color:#888;margin-bottom:28px}
    .meta{display:flex;gap:20px;margin-bottom:28px;flex-wrap:wrap}
    .meta-item{background:#f4f0ff;border-radius:10px;padding:14px 20px;flex:1;min-width:100px}
    .meta-label{font-size:10px;color:#888;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px}
    .meta-val{font-size:20px;font-weight:800;font-family:'Syne',sans-serif;color:#7c3aed}
    table{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:20px}
    th{background:#7c3aed;color:#fff;padding:10px 12px;text-align:left;font-size:10px;letter-spacing:1px;text-transform:uppercase}
    td{padding:10px 12px;border-bottom:1px solid #eee} tr:nth-child(even) td{background:#fafafa}
    .ai-box{background:#f4f0ff;border-left:4px solid #7c3aed;border-radius:8px;padding:16px;margin-bottom:12px}
    .ai-title{font-size:11px;color:#7c3aed;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px}
    .suggestion{font-size:12px;color:#555;margin-bottom:4px}
    .risk{display:inline-block;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700}
    .footer{margin-top:32px;font-size:10px;color:#bbb;text-align:center;border-top:1px solid #eee;padding-top:12px}
  </style></head><body>
  <h1>Student Academic Report</h1>
  <div class="sub">Generated on ${new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"})} · Student Information System</div>
  <div class="meta">
    <div class="meta-item"><div class="meta-label">Name</div><div class="meta-val" style="font-size:16px;color:#0e0e24">${student.name}</div></div>
    <div class="meta-item"><div class="meta-label">ID</div><div class="meta-val" style="font-size:16px">${student.id}</div></div>
    <div class="meta-item"><div class="meta-label">CGPA</div><div class="meta-val">${cgpa}</div></div>
    <div class="meta-item"><div class="meta-label">Courses</div><div class="meta-val" style="color:#3b82f6">${student.courses.length}</div></div>
    <div class="meta-item"><div class="meta-label">Risk Level</div><div class="meta-val" style="color:${prediction?.riskColor}">${prediction?.risk ?? "N/A"}</div></div>
  </div>
  <h2>Course Details</h2>
  <table><thead><tr><th>Course</th><th>Credits</th><th>Marks</th><th>Attendance</th><th>Grade</th><th>Debarred</th></tr></thead><tbody>${rows}</tbody></table>
  ${prediction ? `<h2>AI Performance Analysis</h2>
  <div class="ai-box">
    <div class="ai-title">Predicted Next Semester CGPA</div>
    <div style="font-size:24px;font-weight:800;font-family:'Syne',sans-serif;color:#7c3aed">${prediction.predictedCGPA.toFixed(2)}</div>
  </div>
  <div class="ai-box">
    <div class="ai-title">AI Recommendations</div>
    ${prediction.suggestions.map(s => `<div class="suggestion">${s}</div>`).join("")}
  </div>` : ""}
  <div class="footer">Student Information System · AI-Powered Academic Report · Auto-generated</div>
  <script>window.onload=()=>{window.print();}<\/script>
  </body></html>`;
  const win = window.open("", "_blank");
  win.document.write(html); win.document.close();
}
