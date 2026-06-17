import { CheckCircle, Users, QrCode, FileText, TrendingUp } from "lucide-react";
import { useStore } from "../../useStore";
import { store, SCHEDULE } from "../../store";

export default function TeacherOverview({ onNavigate }) {
  const state = useStore();
  const scans = state.attendanceRecords;
  const justifications = state.justifications;
  const qrSessions = state.qrSessions;
  const pendingJustif = justifications.filter(j => j.status === "pending").length;
  const activeQRs = qrSessions.filter(q => q.active && q.expiresAt > Date.now()).length;
  const students = store.getAllStudents();

  return (
    <div>
      <div className="page-header">
        <div><h2>لوحة المتابعة</h2><p>نظرة عامة على الحضور والنشاط</p></div>
        <div style={{fontSize:13,color:"var(--text-secondary)",background:"var(--surface)",padding:"8px 16px",borderRadius:"var(--radius-sm)",border:"1px solid var(--border)"}}>
          📅 {new Date().toLocaleDateString("ar-DZ",{year:"numeric",month:"long",day:"numeric"})}
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon blue"><Users size={22}/></div><div><div className="stat-value">{students.length}</div><div className="stat-label">إجمالي الطلاب</div></div></div>
        <div className="stat-card"><div className="stat-icon green"><CheckCircle size={22}/></div><div><div className="stat-value">{scans.length}</div><div className="stat-label">مسح QR اليوم</div></div></div>
        <div className="stat-card"><div className="stat-icon orange"><FileText size={22}/></div><div><div className="stat-value">{pendingJustif}</div><div className="stat-label">تبريرات معلقة</div></div></div>
        <div className="stat-card"><div className="stat-icon purple"><QrCode size={22}/></div><div><div className="stat-value">{activeQRs}</div><div className="stat-label">رموز QR نشطة</div></div></div>
      </div>

      <div className="grid-2" style={{marginBottom:20}}>
        <div className="card">
          <div className="card-header"><div className="card-title">آخر عمليات مسح QR</div><TrendingUp size={16} color="var(--primary)"/></div>
          {scans.length === 0 ? (
            <div className="empty-state" style={{padding:24}}><QrCode size={32}/><p style={{marginTop:8}}>لا توجد عمليات مسح بعد</p></div>
          ) : scans.slice(-6).reverse().map((r,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:"1px solid var(--border)"}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:"var(--accent)",flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:13}}>{r.studentName}</div>
                <div style={{fontSize:11,color:"var(--text-secondary)"}}>{r.module} · {r.group}</div>
              </div>
              <span style={{fontSize:10,color:"var(--text-muted)"}}>{new Date(r.scannedAt).toLocaleTimeString("ar")}</span>
              <span className="badge badge-success">حاضر</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">الجدول الأسبوعي</div></div>
          {SCHEDULE.map(s=>(
            <div key={s.id} className="session-row">
              <div className="session-info"><h4>{s.module}</h4><p>{s.group} · {s.day} · {s.time}</p></div>
              <span className={`badge ${s.type==="Cours"?"badge-info":s.type==="TD"?"badge-success":"badge-warning"}`}>{s.type}</span>
            </div>
          ))}
        </div>
      </div>

      {justifications.length > 0 && (
        <div className="card">
          <div className="card-header"><div className="card-title">تبريرات تنتظر مراجعتك</div>
            <span className="badge badge-warning">{pendingJustif}</span></div>
          {justifications.filter(j=>j.status==="pending").slice(0,3).map(j=>(
            <div key={j.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:"1px solid var(--border)"}}>
              <div>
                <div style={{fontWeight:600,fontSize:13}}>{j.studentName} · {j.group}</div>
                <div style={{fontSize:12,color:"var(--text-secondary)",marginTop:2}}>{j.module} · {j.date}</div>
              </div>
              <button className="btn btn-sm btn-primary" onClick={()=>onNavigate?.("justifications")}>مراجعة</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
