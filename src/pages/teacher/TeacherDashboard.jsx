import { useState } from "react";
import { LayoutDashboard, Users, QrCode, FileText, BarChart2, Calendar, Bell } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import TeacherOverview from "./TeacherOverview";
import TeacherAttendance from "./TeacherAttendance";
import TeacherStudents from "./TeacherStudents";
import TeacherJustifications from "./TeacherJustifications";
import TeacherStats from "./TeacherStats";
import TeacherSchedule from "./TeacherSchedule";
import { useStore } from "../../useStore";
import TeacherNotifications from "./TeacherNotifications";


const pageTitles = {
  overview: { title: "لوحة المتابعة", subtitle: "متابعة حضور طلابك" },
  notifications: { title: "الإشعارات", subtitle: "تبريرات ورسائل الطلاب" },
  schedule: { title: "الجدول الزمني", subtitle: "جدول حصصك الأسبوعي" },
  attendance: { title: "تسجيل الحضور", subtitle: "إنشاء رمز QR وتسجيل الحضور" },
  students: { title: "طلابي", subtitle: "قائمة طلابك وإحصائيات حضورهم" },
  stats: { title: "الإحصائيات", subtitle: "تقارير الحضور والغياب" },
  justifications: { title: "تبريرات الغياب", subtitle: "مراجعة تبريرات الطلاب" },
};


export default function TeacherDashboard({ user, onLogout }) {
  const [activeSection, setActiveSection] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const state = useStore();
  const recentScans = state.attendanceRecords || [];

  const navItems = [
    {
      label: "الرئيسية", items: [
        { id: "overview", label: "لوحة المتابعة", icon: LayoutDashboard },
        { id: "notifications", label: "الإشعارات", icon: Bell, badge: state.teacherNotifications.filter(n => !n.read).length || undefined },
        { id: "schedule", label: "الجدول الزمني", icon: Calendar },
      ]
    },
    {
      label: "الحضور", items: [
        { id: "attendance", label: "تسجيل الحضور (QR)", icon: QrCode },
        { id: "students", label: "الطلاب", icon: Users },
        { id: "stats", label: "الإحصائيات", icon: BarChart2 },
      ]
    },
    {
      label: "الغياب", items: [
        { id: "justifications", label: "تبريرات الغياب", icon: FileText, badge: 2 },
      ]
    },
  ];

  const renderPage = () => {
    switch (activeSection) {
      case "overview": return <TeacherOverview recentScans={recentScans} onNavigate={setActiveSection} />;
      case "notifications": return <TeacherNotifications onNavigate={setActiveSection} />;
      case "schedule": return <TeacherSchedule />;
      case "attendance": return <TeacherAttendance user={user} />;
      case "students": return <TeacherStudents />;
      case "stats": return <TeacherStats />;
      case "justifications": return <TeacherJustifications />;
      default: return <TeacherOverview recentScans={recentScans} onNavigate={setActiveSection} />;
    }
  };

  const current = pageTitles[activeSection] || pageTitles.overview;

  return (
    <div className="app-layout">
      <Sidebar
        navItems={navItems}
        activeSection={activeSection}
        onNavigate={setActiveSection}
        onLogout={onLogout}
        user={{ name: user.email.split("@")[0], role: "أستاذ" }}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />
      <div className="main-content">
        <Topbar title={current.title} subtitle={current.subtitle} notifCount={recentScans.length}
          onNotifClick={() => setActiveSection("notifications")}
          onMenuClick={() => setMobileMenuOpen(true)} />
        <div className="page-content">{renderPage()}</div>
      </div>
    </div>
  );
}