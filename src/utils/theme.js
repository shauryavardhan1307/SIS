export const THEMES = {
  dark: {
    bg: "#07071a", sidebar: "#0e0e24", sidebarBorder: "#181838",
    card: "#0e0e24", cardAlt: "#0a0a1e", border: "#1c1c3c",
    text: "#f0f0ff", textMuted: "#7a7aaa", textDim: "#44446a", textFaint: "#252545",
    input: "#0a0a1e", inputBorder: "#252545",
    modalBg: "linear-gradient(135deg,#0e0e28 80%,#160d35 100%)",
    toastSuccess: "#051a12", toastError: "#1a0508",
    overlay: "rgba(0,0,5,0.8)",
    accentPrimary: "#7c3aed", accentGreen: "#00f5c4", accentBlue: "#3b82f6",
    accentOrange: "#f97316", accentPink: "#ec4899",
    isDark: true,
  },
  light: {
    bg: "#f4f4fc", sidebar: "#ffffff", sidebarBorder: "#e4e4f0",
    card: "#ffffff", cardAlt: "#f9f9ff", border: "#e4e4f0",
    text: "#0e0e24", textMuted: "#555577", textDim: "#8888aa", textFaint: "#ccccdd",
    input: "#f4f4fc", inputBorder: "#d4d4e8",
    modalBg: "linear-gradient(135deg,#ffffff 80%,#f0e8ff 100%)",
    toastSuccess: "#e8fff5", toastError: "#fff0f2",
    overlay: "rgba(0,0,0,0.4)",
    accentPrimary: "#7c3aed", accentGreen: "#059669", accentBlue: "#3b82f6",
    accentOrange: "#ea580c", accentPink: "#db2777",
    isDark: false,
  }
};

export const GRADE_CONFIG = {
  S: { min: 90, point: 10.0, color: "#00f5c4", label: "Outstanding", emoji: "🏆" },
  A: { min: 80, point: 9.0,  color: "#7c3aed", label: "Excellent",   emoji: "⭐" },
  B: { min: 70, point: 8.0,  color: "#3b82f6", label: "Very Good",   emoji: "👍" },
  C: { min: 60, point: 7.0,  color: "#f59e0b", label: "Good",        emoji: "✅" },
  D: { min: 50, point: 6.0,  color: "#f97316", label: "Average",     emoji: "📘" },
  E: { min: 40, point: 5.0,  color: "#ef4444", label: "Pass",        emoji: "⚠️" },
  F: { min: 0,  point: 0.0,  color: "#6b7280", label: "Fail",        emoji: "❌" },
};

export const COURSE_CATALOG = [
  { name: "Data Structures", category: "Core CS", difficulty: "Medium" },
  { name: "Algorithms",      category: "Core CS", difficulty: "Hard"   },
  { name: "Operating Systems", category: "Core CS", difficulty: "Hard" },
  { name: "DBMS",            category: "Core CS", difficulty: "Medium" },
  { name: "Computer Networks", category: "Core CS", difficulty: "Medium" },
  { name: "Machine Learning", category: "AI/ML",  difficulty: "Hard"   },
  { name: "Deep Learning",   category: "AI/ML",   difficulty: "Hard"   },
  { name: "Data Science",    category: "AI/ML",   difficulty: "Medium" },
  { name: "Cloud Computing", category: "Systems", difficulty: "Medium" },
  { name: "Cryptography",    category: "Security",difficulty: "Hard"   },
  { name: "Web Development", category: "Dev",     difficulty: "Easy"   },
  { name: "Mobile Dev",      category: "Dev",     difficulty: "Medium" },
  { name: "Software Engineering", category: "Dev", difficulty: "Medium"},
  { name: "Computer Vision", category: "AI/ML",   difficulty: "Hard"   },
  { name: "NLP",             category: "AI/ML",   difficulty: "Hard"   },
  { name: "Discrete Math",   category: "Math",    difficulty: "Medium" },
  { name: "Linear Algebra",  category: "Math",    difficulty: "Medium" },
  { name: "Statistics",      category: "Math",    difficulty: "Easy"   },
  { name: "Compiler Design", category: "Core CS", difficulty: "Hard"   },
  { name: "Theory of Computation", category: "Core CS", difficulty: "Hard" },
];
