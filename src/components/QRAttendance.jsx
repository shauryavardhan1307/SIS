import { useState, useEffect, useRef } from "react";
import { generateQRData } from "../utils/helpers";

// Mini QR-like visual generator (pixel art pattern based on data hash)
function QRVisual({ data, size = 160 }) {
  const cells = 21;
  const cellSize = size / cells;

  // Deterministic pattern from string
  let hash = 0;
  for (let i = 0; i < data.length; i++) hash = (hash * 31 + data.charCodeAt(i)) >>> 0;

  const grid = Array.from({ length: cells }, (_, r) =>
    Array.from({ length: cells }, (_, c) => {
      // Fixed finder patterns (corners)
      if ((r < 7 && c < 7) || (r < 7 && c >= cells - 7) || (r >= cells - 7 && c < 7)) {
        const fr = r % 7, fc = (r < 7 && c >= cells - 7) ? c - (cells - 7) : (r >= cells - 7 ? c : c);
        const fc2 = (r < 7 && c >= cells - 7) ? c - (cells - 7) : c;
        const fc3 = r >= cells - 7 ? c : fc2;
        if (fr === 0 || fr === 6 || fc3 === 0 || fc3 === 6) return true;
        if (fr >= 2 && fr <= 4 && fc3 >= 2 && fc3 <= 4) return true;
        return false;
      }
      // Data cells
      const bit = (hash >> ((r * cells + c) % 32)) & 1;
      return bit === 1;
    })
  );

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      <rect width={size} height={size} fill="white" />
      {grid.map((row, r) => row.map((filled, c) => filled ? (
        <rect key={`${r}-${c}`} x={c * cellSize} y={r * cellSize} width={cellSize} height={cellSize} fill="#0e0e24" />
      ) : null))}
    </svg>
  );
}

export default function QRAttendance({ student, t, onMarkAttendance }) {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [attendanceLog, setAttendanceLog] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(student.courses[0]?.name ?? "");
  const timerRef = useRef(null);

  const qrData = generateQRData(student);

  function simulateScan() {
    setScanning(true);
    setScanResult(null);
    timerRef.current = setTimeout(() => {
      setScanning(false);
      if (!selectedCourse) { setScanResult({ success: false, msg: "No course selected" }); return; }
      const now = new Date();
      const entry = {
        course: selectedCourse,
        time: now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        date: now.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
        studentId: student.id,
        studentName: student.name,
      };
      setAttendanceLog(p => [entry, ...p.slice(0, 9)]);
      setScanResult({ success: true, msg: `Attendance marked for ${selectedCourse}` });
    }, 1800);
  }

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      {/* QR Code Display */}
      <div style={{ flex: 1, minWidth: 220, background: t.card, border: `1px solid ${t.border}`, borderRadius: 16, padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: 2, textTransform: "uppercase" }}>Student QR Code</div>
        <div style={{ padding: 12, background: "#fff", borderRadius: 12, boxShadow: "0 4px 20px #0002" }}>
          <QRVisual data={qrData} size={160} />
        </div>
        <div style={{ fontSize: 11, color: t.textFaint, fontFamily: "'Space Mono',monospace", textAlign: "center", maxWidth: 180, wordBreak: "break-all" }}>{qrData.slice(0, 40)}…</div>
        <div style={{ fontSize: 12, fontWeight: 700, color: t.accentPrimary, fontFamily: "'Syne',sans-serif" }}>ID: {student.id} · {student.name}</div>
      </div>

      {/* Scanner Simulator */}
      <div style={{ flex: 1, minWidth: 220, background: t.card, border: `1px solid ${t.border}`, borderRadius: 16, padding: "20px" }}>
        <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>Mark Attendance</div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, color: t.textMuted, display: "block", marginBottom: 6, letterSpacing: 1 }}>SELECT COURSE</label>
          <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}
            style={{ width: "100%", background: t.input, border: `1px solid ${t.inputBorder}`, borderRadius: 8, padding: "9px 12px", color: t.text, fontSize: 12, fontFamily: "'Space Mono',monospace", outline: "none" }}>
            {student.courses.length === 0 && <option value="">No courses</option>}
            {student.courses.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
        </div>

        {/* Scan animation */}
        <div onClick={simulateScan} style={{ width: "100%", height: 100, border: `2px dashed ${scanning ? t.accentGreen : t.border}`, borderRadius: 12, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", marginBottom: 14, position: "relative", overflow: "hidden", transition: "border-color .3s", background: scanning ? `${t.accentGreen}08` : "transparent" }}>
          {scanning ? (
            <>
              <div style={{ fontSize: 28, animation: "pulse 1s infinite" }}>📷</div>
              <div style={{ fontSize: 11, color: t.accentGreen, marginTop: 6, fontFamily: "'Space Mono',monospace" }}>Scanning…</div>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,transparent,${t.accentGreen},transparent)`, animation: "scan 1.8s linear" }} />
            </>
          ) : (
            <>
              <div style={{ fontSize: 28 }}>📲</div>
              <div style={{ fontSize: 11, color: t.textDim, marginTop: 6, fontFamily: "'Space Mono',monospace" }}>Tap to scan QR</div>
            </>
          )}
        </div>

        {scanResult && (
          <div style={{ background: scanResult.success ? "#00f5c411" : "#ef444411", border: `1px solid ${scanResult.success ? "#00f5c444" : "#ef444444"}`, borderRadius: 8, padding: "10px 14px", fontSize: 12, color: scanResult.success ? t.accentGreen : "#ef4444", fontFamily: "'Space Mono',monospace", marginBottom: 12 }}>
            {scanResult.success ? "✓ " : "✗ "}{scanResult.msg}
          </div>
        )}

        {/* Attendance log */}
        {attendanceLog.length > 0 && (
          <div>
            <div style={{ fontSize: 10, color: t.textFaint, letterSpacing: 1, marginBottom: 8 }}>RECENT LOG</div>
            {attendanceLog.slice(0, 4).map((l, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: t.textDim, padding: "5px 0", borderBottom: `1px solid ${t.border}` }}>
                <span style={{ color: t.accentGreen }}>✓</span>
                <span>{l.course}</span>
                <span>{l.time} · {l.date}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
