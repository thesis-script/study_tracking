import { useState } from "react";
import { LayoutDashboard, QrCode, FileText, Bell, BarChart2, LogOut, GraduationCap, CheckCircle, XCircle, Clock } from "lucide-react";
import StudentOverview from "./StudentOverview";
import StudentScanQR from "./StudentScanQR";
import StudentAttendance from "./StudentAttendance";
import StudentJustifications from "./StudentJustifications";

const navItems = [
  { id: "overview", label: "لوحتي", icon: LayoutDashboard },
  { id: "scan", label: "مسح QR", icon: QrCode, highlight: true },
  { id: "attendance", label: "سجل حضوري", icon: CheckCircle },
  { id: "justifications", label: "تبريرات الغياب", icon: FileText },
];

const pageTitles = {
  overview: { title: "لوحتي", subtitle: "نظرة عامة على حضورك الدراسي" },
  scan: { title: "مسح رمز QR", subtitle: "سجّل حضورك بمسح رمز QR للأستاذ" },
  attendance: { title: "سجل الحضور", subtitle: "تفاصيل حضورك وغيابك" },
  justifications: { title: "تبريرات الغياب", subtitle: "متابعة حالة تبريراتك" },
};

export default function StudentDashboard({ user, onLogout, attendanceStore, onAttendanceScanned }) {
  const [activeSection, setActiveSection] = useState("overview");
  const current = pageTitles[activeSection];

  const renderPage = () => {
    switch (activeSection) {
      case "overview": return <StudentOverview attendanceStore={attendanceStore} />;
      case "scan": return <StudentScanQR user={user} onAttendanceScanned={onAttendanceScanned} />;
      case "attendance": return <StudentAttendance attendanceStore={attendanceStore} />;
      case "justifications": return <StudentJustifications />;
      default: return <StudentOverview attendanceStore={attendanceStore} />;
    }
  };

  const studentName = user.email.split("@")[0];

  return (
    <div className="student-layout">
      {/* Sidebar */}
      <div className="student-sidebar">
        <div className="student-sidebar-logo">
          <div className="student-sidebar-logo-icon">
            <img src="/logo-full.png" alt="Logo" style={{ width: 44, height: 44, borderRadius: "12px" }} />
          </div>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "white" }}>Study Tracking</h2>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>QR Attendance</p>
          </div>
        </div>

        <nav className="student-sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`student-nav-item ${activeSection === item.id ? "active" : ""} ${item.highlight ? "highlight" : ""}`}
              onClick={() => setActiveSection(item.id)}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {item.highlight && activeSection !== item.id && (
                <span className="scan-pulse-dot" />
              )}
            </button>
          ))}
        </nav>

        <div className="student-sidebar-user">
          <div className="student-user-avatar">
            <GraduationCap size={16} />
          </div>
          <div className="user-info">
            <strong style={{ color: "white" }}>{studentName}</strong>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>طالب</span>
          </div>
          <button className="logout-btn" onClick={onLogout} title="تسجيل الخروج">
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="student-main">
        {/* Topbar */}
        <div className="student-topbar">
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700 }}>{current.title}</h1>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{current.subtitle}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="student-topbar-btn">
              <Bell size={18} />
              <span className="notif-dot" />
            </button>
            <div className="student-topbar-avatar">
              {studentName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        <div className="student-page-content">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}
