import { useState } from "react";
import { Home, Scan, CheckCircle, FileText, LogOut } from "lucide-react";
import { store } from "../../store";
import { useStore } from "../../useStore";
import StudentOverview from "./StudentOverview";
import StudentScanQR from "./StudentScanQR";
import StudentAttendance from "./StudentAttendance";
import StudentJustifications from "./StudentJustifications";

const navItems = [
  { id:"overview",       label:"لوحتي",    icon:Home },
  { id:"scan",           label:"مسح QR",   icon:Scan,          highlight:true },
  { id:"attendance",     label:"الحضور",   icon:CheckCircle },
  { id:"justifications", label:"تبريراتي", icon:FileText },
];

export default function StudentPortal({ user, onLogout }) {
  const [active, setActive] = useState("scan");
  const state = useStore();
  const student = store.getStudent(user.studentId);
  const myScans = state.attendanceRecords.filter(r => r.studentId === user.studentId);
  const myNotifCount = state.studentNotifications.filter(n => n.studentId === user.studentId && !n.read).length;

  const renderPage = () => {
    switch(active) {
      case "overview":       return <StudentOverview myScans={myScans} student={student}/>;
      case "scan":           return <StudentScanQR user={user} student={student}/>;
      case "attendance":     return <StudentAttendance myScans={myScans}/>;
      case "justifications": return <StudentJustifications user={user}/>;
      default:               return <StudentScanQR user={user} student={student}/>;
    }
  };

  return (
    <div className="student-portal-layout">
      <header className="student-portal-header">
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <img src="/logo-full.png" alt="Logo" style={{width:32,height:32,borderRadius:8}}/>
          <div>
            <div style={{fontWeight:700,fontSize:14,color:"white"}}>بوابة الطلاب</div>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.6)"}}>Students Attendance Tracking</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{textAlign:"left"}}>
            <div style={{fontSize:12,fontWeight:600,color:"white"}}>{student?.name || user.email}</div>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.6)"}}>{student?.studentId} · {student?.group}</div>
          </div>
          <button onClick={onLogout} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:8,padding:"6px 10px",color:"white",cursor:"pointer"}}>
            <LogOut size={14}/>
          </button>
        </div>
      </header>

      <main className="student-portal-main">{renderPage()}</main>

      <nav className="student-portal-nav">
        {navItems.map(item => (
          <button key={item.id} onClick={()=>setActive(item.id)}
            className={`student-portal-nav-btn ${active===item.id?"active":""} ${item.highlight?"highlight":""}`}
            style={{position:"relative"}}>
            <item.icon size={20}/>
            <span>{item.label}</span>
            {item.id === "justifications" && myNotifCount > 0 && (
              <span style={{position:"absolute",top:4,right:"calc(50% - 14px)",background:"var(--danger)",color:"white",fontSize:9,fontWeight:700,borderRadius:"50%",width:14,height:14,display:"flex",alignItems:"center",justifyContent:"center"}}>{myNotifCount}</span>
            )}
            {item.highlight && active !== item.id && (
              <span style={{position:"absolute",top:6,right:"calc(50% - 16px)",width:8,height:8,borderRadius:"50%",background:"var(--accent)",border:"2px solid var(--surface)"}}/>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
