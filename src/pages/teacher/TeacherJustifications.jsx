import { useState } from "react";
import { Check, X, Send, Eye, FileText } from "lucide-react";
import { store } from "../../store";
import { useStore } from "../../useStore";

function formatRange(j) {
  return j.startDate === j.endDate ? j.startDate : `${j.startDate} → ${j.endDate}`;
}

export default function TeacherJustifications() {
  const state = useStore();
  const [selected, setSelected] = useState(null);

  // All justifications visible to teacher (all statuses)
  const justifications = state.justifications;
  const pending = justifications.filter(j => j.status === "pending").length;
  const accepted = justifications.filter(j => j.status === "accepted").length;
  const rejected = justifications.filter(j => j.status === "rejected").length;

  const badge = s => {
    if (s === "pending")  return <span className="badge badge-warning">معلق</span>;
    if (s === "accepted") return <span className="badge badge-success">مقبول</span>;
    if (s === "rejected") return <span className="badge badge-danger">مرفوض</span>;
  };

  const adminBadge = j => {
    if (!j.teacherSentToAdmin) return <span className="badge badge-neutral">لم يُرسل</span>;
    if (j.adminStatus === "accepted") return <span className="badge badge-success">قبلته الإدارة ✓</span>;
    if (j.adminStatus === "rejected") return <span className="badge badge-danger">رفضته الإدارة</span>;
    return <span className="badge badge-info">بانتظار الإدارة</span>;
  };

  return (
    <div>
      <div className="page-header">
        <div><h2>تبريرات الغياب</h2><p>مراجعة تبريرات الطلاب وإحالتها للإدارة</p></div>
        {pending > 0 && <span className="badge badge-warning" style={{fontSize:14,padding:"6px 14px"}}>{pending} معلق</span>}
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns:"repeat(3,1fr)", marginBottom:24 }}>
        <div className="stat-card"><div className="stat-icon orange"/><div><div className="stat-value">{pending}</div><div className="stat-label">معلقة</div></div></div>
        <div className="stat-card"><div className="stat-icon green"/><div><div className="stat-value">{accepted}</div><div className="stat-label">مقبولة</div></div></div>
        <div className="stat-card"><div className="stat-icon red"/><div><div className="stat-value">{rejected}</div><div className="stat-label">مرفوضة</div></div></div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">قائمة التبريرات</div>
          <div className="card-subtitle">التبريرات المرسلة من الطلاب</div>
        </div>

        {justifications.length === 0 ? (
          <div className="empty-state">
            <FileText size={40}/>
            <h3>لا توجد تبريرات بعد</h3>
            <p>ستظهر هنا تبريرات الطلاب عند إرسالها</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr>
                <th>الطالب</th><th>الوحدة</th><th>المدة</th><th>السبب</th>
                <th>حالة الأستاذ</th><th>حالة الإدارة</th><th>الإجراء</th>
              </tr></thead>
              <tbody>
                {justifications.map(j => (
                  <tr key={j.id}>
                    <td>
                      <div style={{fontWeight:600}}>{j.studentName}</div>
                      <div style={{fontSize:11,color:"var(--text-secondary)"}}>{j.studentId} · {j.group}</div>
                    </td>
                    <td style={{fontSize:12}}>{j.module}</td>
                    <td style={{color:"var(--text-secondary)",fontSize:12}}>{formatRange(j)}</td>
                    <td style={{fontSize:12,maxWidth:160}}>{j.reason}
                      {j.fileName && <div style={{fontSize:10,color:"var(--text-muted)",marginTop:2}}>📎 {j.fileName}</div>}
                    </td>
                    <td>{badge(j.status)}</td>
                    <td>{adminBadge(j)}</td>
                    <td>
                      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                        <button className="btn btn-ghost btn-sm" onClick={()=>setSelected(j)}><Eye size={12}/> عرض</button>
                        {j.status === "pending" && <>
                          <button className="btn btn-success btn-sm" onClick={()=>store.teacherDecideJustification(j.id,"accepted")}><Check size={12}/> قبول</button>
                          <button className="btn btn-danger btn-sm" onClick={()=>store.teacherDecideJustification(j.id,"rejected")}><X size={12}/> رفض</button>
                        </>}
                        {j.status === "accepted" && !j.teacherSentToAdmin && (
                          <button className="btn btn-primary btn-sm" onClick={()=>store.sendJustificationToAdmin(j.id)}>
                            <Send size={12}/> إرسال للإدارة
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Flow diagram */}
        <div style={{marginTop:24,padding:16,background:"var(--primary-light)",borderRadius:"var(--radius)",border:"1px solid rgba(79,106,240,0.2)"}}>
          <div style={{fontWeight:700,marginBottom:12,color:"var(--primary)",fontSize:14}}>سير عمل التبرير</div>
          <div style={{display:"flex",alignItems:"center",gap:8,fontSize:12}}>
{[
  "👨‍🎓 الطالب\nيقدم التبرير",
  "👨‍🏫 الأستاذ\nيقبل / يرفض",
  "➡️ إرسال\nللإدارة",
  "🏛️ الإدارة\nتراجع وتقرر",
  "👨‍🏫 الأستاذ\nيقرر بعد\nقرار الإدارة",
  "✅ النتيجة\nللطالب"
].map((step, i, arr) => (              <div key={i} style={{display:"flex",alignItems:"center",gap:8,flex:1}}>
                <div style={{textAlign:"center",whiteSpace:"pre-line",lineHeight:1.4}}>{step}</div>
                {i < arr.length-1 && <div style={{width:2,height:30,background:"var(--primary)",opacity:0.3,flexShrink:0}}/>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={()=>setSelected(null)}>
          <div className="modal" style={{maxWidth:480}} onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <div><div style={{fontWeight:700,fontSize:16}}>تفاصيل التبرير</div></div>
              <button className="modal-close" onClick={()=>setSelected(null)}>✕</button>
            </div>
            <div style={{padding:"0 0 20px",display:"flex",flexDirection:"column",gap:12}}>
              {[["الطالب", `${selected.studentName} · ${selected.studentId} · ${selected.group}`],
                ["الوحدة", selected.module],
                ["المدة", formatRange(selected)],
                ["السبب", selected.reason],
                ["الملف", selected.fileName || "لا يوجد"],
                ["حالة الأستاذ", selected.status],
                ["أُرسل للإدارة", selected.teacherSentToAdmin ? "نعم" : "لا"],
                ["قرار الإدارة", selected.adminStatus || "لم يُبت بعد"],
              ].map(([k,v])=>(
                <div key={k}><div style={{fontWeight:600,fontSize:12,color:"var(--text-secondary)"}}>{k}</div><div style={{marginTop:3}}>{v}</div></div>
              ))}
            </div>
            <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
              {selected.status === "pending" && <>
                <button className="btn btn-success" onClick={()=>{store.teacherDecideJustification(selected.id,"accepted");setSelected(null);}}>قبول</button>
                <button className="btn btn-danger" onClick={()=>{store.teacherDecideJustification(selected.id,"rejected");setSelected(null);}}>رفض</button>
              </>}
              {selected.status === "accepted" && !selected.teacherSentToAdmin && (
                <button className="btn btn-primary" onClick={()=>{store.sendJustificationToAdmin(selected.id);setSelected(null);}}>إرسال للإدارة</button>
              )}
              <button className="btn btn-ghost" onClick={()=>setSelected(null)}>إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
