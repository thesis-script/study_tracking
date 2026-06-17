import { useState } from "react";
import { LayoutDashboard, Users, FileText, BookOpen, BarChart2, Users2, Bell } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import AdminOverview from "./AdminOverview";
import AdminStudents from "./AdminStudents";
import AdminTeachers from "./AdminTeachers";
import AdminJustifications from "./AdminJustifications";
import AdminReports from "./AdminReports";
import AdminModules from "./AdminModules";
import AdminNotifications from "./AdminNotifications";
import { useStore } from "../../useStore";

export default function AdminDashboard({ user, onLogout }) {
  const [activeSection, setActiveSection] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const state = useStore();
  const unread = (state.adminNotifications || []).filter(n => !n.read).length;

  const navItems = [
    {
      label: "الرئيسية", items: [
        { id: "overview", label: "لوحة المتابعة", icon: LayoutDashboard },
        { id: "notifications", label: "إشعارات الأساتذة", icon: Bell, badge: unread || undefined },
      ]
    },
    {
      label: "الإدارة", items: [
        { id: "students", label: "الطلاب", icon: Users },
        { id: "teachers", label: "الأساتذة", icon: Users2 },
        { id: "modules", label: "المواد والحصص", icon: BookOpen },
      ]
    },
    {
      label: "الغياب", items: [
        { id: "justifications", label: "تبريرات الغياب", icon: FileText, badge: 2 },
        { id: "reports", label: "التقارير", icon: BarChart2 },
      ]
    },
  ];

  const pageTitles = {
    overview: { title: "لوحة المتابعة", subtitle: "نظرة عامة على الحضور والغياب" },
    notifications: { title: "إشعارات الأساتذة", subtitle: "الرسائل والإشعارات الواردة من الأساتذة" },
    students: { title: "إدارة الطلاب", subtitle: "متابعة حضور وغياب الطلاب" },
    teachers: { title: "إدارة الأساتذة", subtitle: "قائمة الأساتذة والمواد" },
    modules: { title: "المواد والحصص", subtitle: "إدارة المواد الدراسية" },
    justifications: { title: "تبريرات الغياب", subtitle: "مراجعة وإدارة التبريرات" },
    reports: { title: "التقارير", subtitle: "إحصائيات وتقارير الحضور" },
  };

  const renderPage = () => {
    switch (activeSection) {
      case "overview": return <AdminOverview />;
      case "notifications": return <AdminNotifications />;
      case "students": return <AdminStudents />;
      case "teachers": return <AdminTeachers />;
      case "modules": return <AdminModules />;
      case "justifications": return <AdminJustifications />;
      case "reports": return <AdminReports />;
      default: return <AdminOverview />;
    }
  };

  const current = pageTitles[activeSection] || pageTitles.overview;

  return (
    <div className="app-layout">
      <Sidebar navItems={navItems} activeSection={activeSection} onNavigate={setActiveSection}
        onLogout={onLogout} user={{ name: user.email.split("@")[0], role: "الإدارة" }}
        mobileOpen={mobileMenuOpen} onCloseMobile={() => setMobileMenuOpen(false)} />
      <div className="main-content">
        <Topbar title={current.title} subtitle={current.subtitle} notifCount={unread}
          onNotifClick={() => setActiveSection("notifications")}
          onMenuClick={() => setMobileMenuOpen(true)} />
        <div className="page-content">{renderPage()}</div>
      </div>
    </div>
  );
}
