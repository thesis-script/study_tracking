import { useState } from "react";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import StudentPortal from "./pages/student/StudentPortal";

function getPortalFromURL() {
  const p = window.location.pathname;
  if (p.startsWith("/student") || p === "/scan") return "student";
  return null;
}

export default function App() {
  const [auth, setAuth] = useState(() => {
    try { const s = sessionStorage.getItem("auth"); return s ? JSON.parse(s) : null; }
    catch { return null; }
  });

  const portal = getPortalFromURL();

  const handleLogin = user => {
    setAuth(user);
    sessionStorage.setItem("auth", JSON.stringify(user));
  };

  const handleLogout = () => {
    setAuth(null);
    sessionStorage.removeItem("auth");
  };

  if (portal === "student") {
    if (!auth || auth.role !== "student") return <LoginPage onLogin={handleLogin} forceRole="student"/>;
    return <StudentPortal user={auth} onLogout={handleLogout}/>;
  }

  if (!auth) return <LoginPage onLogin={handleLogin}/>;
  if (auth.role === "admin")   return <AdminDashboard   user={auth} onLogout={handleLogout}/>;
  if (auth.role === "teacher") return <TeacherDashboard user={auth} onLogout={handleLogout}/>;
  if (auth.role === "student") return <StudentPortal    user={auth} onLogout={handleLogout}/>;
  return <LoginPage onLogin={handleLogin}/>;
}
