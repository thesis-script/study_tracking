import { Users, CheckCircle, AlertTriangle, TrendingUp, FileText, QrCode } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { useStore } from "../../useStore";
import { store } from "../../store";

export default function AdminOverview() {
  const state = useStore();
  const students = store.getAllStudents();
  const justifications = state.justifications;
  const scans = state.attendanceRecords;
  const qrSessions = state.qrSessions;

  const pendingCount = justifications.filter(j => j.adminStatus === "pending" && j.teacherSentToAdmin).length;
  const acceptedCount = justifications.filter(j => j.adminStatus === "accepted").length;
  const totalJustif = justifications.length;

  // Group scans by group
  const byGroup = students.reduce((acc, s) => {
    if (!acc[s.group]) acc[s.group] = { group: s.group, students: 0, scans: 0 };
    acc[s.group].students++;
    return acc;
  }, {});
  scans.forEach(r => { if (byGroup[r.group]) byGroup[r.group].scans++; });
  const groupData = Object.values(byGroup);

  const unreadAdmin = state.adminNotifications.filter(n => !n.read).length;

  return (
    <div>
      <div className="page-header">
        <div><h2>لوحة المتابعة</h2><p>نظرة عامة على المنظومة</p></div>
        <div style={{fontSize:13,color:"var(--text-secondary)",background:"var(--surface)",padding:"8px 16px",borderRadius:"var(--radius-sm)",border:"1px solid var(--border)"}}>
          📅 {new Date().toLocaleDateString("ar-DZ",{year:"numeric",month:"long",day:"numeric"})}
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon blue"><Users size={22}/></div><div><div className="stat-value">{students.length}</div><div className="stat-label">إجمالي الطلاب</div></div></div>
        <div className="stat-card"><div className="stat-icon green"><CheckCircle size={22}/></div><div><div className="stat-value">{scans.length}</div><div className="stat-label">عمليات مسح QR</div></div></div>
        <div className="stat-card"><div className="stat-icon orange"><AlertTriangle size={22}/></div><div><div className="stat-value">{pendingCount}</div><div className="stat-label">تبريرات تنتظر قرارك</div></div></div>
        <div className="stat-card"><div className="stat-icon purple"><FileText size={22}/></div><div><div className="stat-value">{unreadAdmin}</div><div className="stat-label">إشعارات غير مقروءة</div></div></div>
      </div>

      <div className="grid-2" style={{marginBottom:20}}>
        <div className="card">
          <div className="card-header"><div className="card-title">مسح QR حسب المجموعة</div></div>
          {groupData.length === 0 ? (
            <div className="empty-state" style={{padding:24}}><QrCode size={32}/><p style={{marginTop:8}}>لا بيانات بعد</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={groupData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                <XAxis dataKey="group" tick={{fontSize:12}}/>
                <YAxis tick={{fontSize:12}}/>
                <Tooltip contentStyle={{borderRadius:8,border:"1px solid var(--border)"}}/>
                <Bar dataKey="scans" fill="var(--primary)" radius={[4,4,0,0]} name="عمليات مسح"/>
                <Bar dataKey="students" fill="var(--accent)" radius={[4,4,0,0]} name="الطلاب"/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">حالة التبريرات</div></div>
          <div style={{display:"flex",flexDirection:"column",gap:16,padding:"8px 0"}}>
            {[
              { label:"إجمالي التبريرات", val:totalJustif, color:"var(--primary)" },
              { label:"مقبولة من الأستاذ", val:justifications.filter(j=>j.status==="accepted").length, color:"var(--accent)" },
              { label:"محالة للإدارة", val:justifications.filter(j=>j.teacherSentToAdmin).length, color:"var(--warning)" },
              { label:"قبلتها الإدارة", val:acceptedCount, color:"#10b981" },
            ].map(({label,val,color})=>(
              <div key={label}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:6}}>
                  <span style={{color:"var(--text-secondary)"}}>{label}</span>
                  <span style={{fontWeight:700,color}}>{val}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width:`${totalJustif>0?Math.round(val/totalJustif*100):0}%`,background:color}}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending justifications from teachers */}
      {pendingCount > 0 && (
        <div className="card">
          <div className="card-header"><div className="card-title">تبريرات تنتظر قرار الإدارة</div>
            <span className="badge badge-warning">{pendingCount}</span></div>
          {justifications.filter(j=>j.teacherSentToAdmin&&j.adminStatus==="pending").map(j=>(
            <div key={j.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:"1px solid var(--border)"}}>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:13}}>{j.studentName} · {j.group}</div>
                <div style={{fontSize:12,color:"var(--text-secondary)",marginTop:2}}>{j.module} · {j.date} · {j.reason}</div>
              </div>
              <div style={{display:"flex",gap:6}}>
                <button className="btn btn-success btn-sm" onClick={()=>store.adminDecideJustification(j.id,"accepted")}>قبول</button>
                <button className="btn btn-danger btn-sm" onClick={()=>store.adminDecideJustification(j.id,"rejected")}>رفض</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent scans */}
      {scans.length > 0 && (
        <div className="card" style={{marginTop:20}}>
          <div className="card-header"><div className="card-title">آخر عمليات مسح QR</div><TrendingUp size={16} color="var(--primary)"/></div>
          {scans.slice(-5).reverse().map((r,i)=>(
            <div key={i} className="session-row">
              <div className="session-info">
                <h4>{r.studentName} <span style={{fontWeight:400,fontSize:12}}>({r.studentId})</span></h4>
                <p>{r.module} · {r.group} · {r.time}</p>
              </div>
              <div style={{textAlign:"left"}}>
                <div style={{fontSize:11,color:"var(--text-muted)"}}>{new Date(r.scannedAt).toLocaleTimeString("ar")}</div>
                <span className="badge badge-success">حاضر</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
