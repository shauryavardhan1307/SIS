# 🎓 Student Information System

> A modern, feature-rich React application for managing student academic records — built with Vite, Recharts, and a sleek dark/light UI.

---

## ✨ Features

### 📋Student Management
- Add, edit, and delete student profiles
- Search by name or student ID
- Sort by CGPA, name, or ID

### 📚 Course Tracking
- Enroll students in courses with credit hours
- Track marks and attendance per course
- Auto-debarring for attendance below 75%
- CGPA calculation using weighted credits

### 📊 Analytics & Insights
- Grade distribution charts (S/A/B/C/D/E/F scale)
- CGPA distribution across all students
- Top 5 students leaderboard
- At-risk student alerts

### 🤖 AI Features
- AI-powered academic performance prediction
- Smart course recommendations based on performance

### 📅 Attendance System
- QR code-based attendance tracking
- Debarment alerts for low attendance

### 🎨 UI/UX
- Dark & Light theme toggle
- Responsive design with mobile preview
- Export data as JSON
- Import data from JSON
- PDF export per student

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ — [Download here](https://nodejs.org)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/shauryavardhan1307/Java-Project.git
cd Java-Project

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Then open your browser at: **http://localhost:5173**

---

## 🛠️ Available Commands

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production (outputs to `/dist`) |
| `npm run preview` | Preview the production build locally |

---

## 🗂️ Project Structure

```
sis-app/
├── src/
│   ├── components/
│   │   ├── AIPrediction.jsx       # AI performance prediction
│   │   ├── CourseRecommendations.jsx  # Smart course suggestions
│   │   ├── DataViz.jsx            # Charts and data visualization
│   │   ├── MobilePreview.jsx      # Mobile UI preview
│   │   ├── QRAttendance.jsx       # QR-based attendance system
│   │   └── UI.jsx                 # Reusable UI components
│   ├── utils/
│   │   ├── helpers.js             # CGPA, grading, PDF export logic
│   │   └── theme.js               # Dark/light theme definitions
│   ├── App.jsx                    # Main application component
│   └── main.jsx                   # Entry point
├── index.html
├── package.json
├── vite.config.js
└── .gitignore
```

---

## 📸 Tech Stack

| Technology | Purpose |
|---|---|
| React 18 | UI Framework |
| Vite | Build tool & dev server |
| Recharts | Charts & data visualization |
| Space Mono / Syne | Typography |

---

## 📐 Grading System

| Grade | Marks Range | Points |
|---|---|---|
| S | 90–100 | 10 |
| A | 80–89 | 9 |
| B | 70–79 | 8 |
| C | 60–69 | 7 |
| D | 50–59 | 6 |
| E | 40–49 | 5 |
| F | Below 40 or < 75% attendance | 0 |

> Students with attendance below 75% are automatically **debarred** and receive grade F.

---

## 👨‍💻 Author

**Shaurya Vardhan**
- GitHub: [@shauryavardhan1307](https://github.com/shauryavardhan1307)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
