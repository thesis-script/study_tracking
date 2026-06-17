import { useState, useRef } from "react";
import { Upload, Send, FileText, CheckCircle, XCircle, Clock, Bell } from "lucide-react";
import { store } from "../../store";
import { useStore } from "../../useStore";

const MODULES = ["محاسبة مالية متقدمة","تدقيق داخلي وخارجي","محاسبة ضريبية","نظم معلومات محاسبية","أخلاقيات مهن المحاسبة"];

const statusCfg = {
  pending:  { label:"قيد مراجعة الأستاذ",    badge:"badge-warning", Icon:Clock },
  accepted: { label:"مقبول من الأستاذ",       badge:"badge-success", Icon:CheckCircle },
  rejected: { label:"مرفوض من الأستاذ",       badge:"badge-danger",  Icon:XCircle },
};

const adminStatusCfg = {
  pending:  { label:"بانتظار الإدارة",        badge:"badge-info" },
  accepted: { label:"مقبول من الإدارة ✅",   badge:"badge-success" },
  rejected: { label:"مرفوض من الإدارة ❌",   badge:"badge-danger" },
};

function formatRange(j) {
  return j.startDate === j.endDate ? j.startDate : `${j.startDate} → ${j.endDate}`;
}

export default function StudentJustifications({ user }) {
  const state = useStore();
  const fileRef = useRef(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ module:"", startDate:"", endDate:"", reason:"" });
  const [file, setFile] = useState(null);
  const [success, setSuccess] = useState(false);

  const student = store.getStudent(user?.studentId);
  const myJustifications = state.justifications.filter(j => j.studentId === user?.studentId);
  const myNotifs = state.studentNotifications.filter(n => n.studentId === user?.studentId && !n.read);

  const handleSubmit = () => {
    if (!form.module || !form.startDate || !form.endDate || !form.reason) return;
    store.submitJustification({
      studentId: user.studentId,
      studentName: student?.name || user.email,
      group: student?.group || "—",
      module: form.module,
      startDate: form.startDate,
      endDate: form.endDate,
      reason: form.reason,
      fileName: file?.name || null,
    });
    setForm({ module:"", startDate:"", endDate:"", reason:"" });
    setFile(null);
    setShowForm(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);
  };

  return (
    <div style={{paddingBottom:80}}>
      {/* Notifications from teacher/admin */}
      {myNotifs.length > 0 && (
        <div style={{background:"var(--primary-light)",border:"1px solid var(--primary)",borderRadius:"var(--radius)",padding:"12px 14px",marginBottom:14}}>
          <div style={{fontWeight:700,fontSize:13,color:"var(--primary)",marginBottom:8,display:"flex",gap:6,alignItems:"center"}}>
            <Bell size={14}/> إشعارات جديدة ({myNotifs.length})
          </div>
          {myNotifs.map(n => (
            <div key={n.id} style={{fontSize:12,marginBottom:4,display:"flex",justifyContent:"space-between"}}>
              <span>{n.body}</span>
              <button style={{fontSize:10,color:"var(--primary)",background:"none",border:"none",cursor:"pointer"}}
                onClick={()=>store.markStudentNotifRead(n.id)}>✓</button>
            </div>
          ))}
        </div>
      )}

      <div className="student-card">
        <div className="card-header">
          <div className="card-title">تبريراتي</div>
          <button className="btn btn-primary btn-sm" onClick={()=>setShowForm(true)}>
            <Send size={13} style={{marginLeft:4}}/> تقديم تبرير
          </button>
        </div>

        {success && (
          <div style={{background:"var(--accent-light)",border:"1px solid var(--accent)",borderRadius:"var(--radius-sm)",padding:"12px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
            <CheckCircle size={16} color="var(--accent)"/>
            <span style={{fontSize:13,fontWeight:600}}>تم إرسال التبرير للأستاذ ✓</span>
          </div>
        )}

        {myJustifications.length === 0 ? (
          <div style={{textAlign:"center",padding:32,color:"var(--text-muted)"}}>
            <FileText size={36} style={{opacity:0.3,marginBottom:8}}/>
            <div>لا توجد تبريرات بعد</div>
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {myJustifications.map(j => {
              const cfg = statusCfg[j.status];
              return (
                <div key={j.id} style={{padding:"12px 14px",borderRadius:"var(--radius-sm)",border:"1px solid var(--border)",background:"var(--surface-2)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",marginBottom:6}}>
                    <div>
                      <div style={{fontWeight:600,fontSize:13}}>{j.module}</div>
                      <div style={{fontSize:11,color:"var(--text-secondary)",marginTop:2}}>{formatRange(j)} · {j.reason}</div>
                      {j.fileName && <div style={{fontSize:10,color:"var(--text-muted)",marginTop:2}}>📎 {j.fileName}</div>}
                    </div>
                    <span className={`badge ${cfg.badge}`}>{cfg.label}</span>
                  </div>
                  {/* Admin status row */}
                  {j.teacherSentToAdmin && j.adminStatus && (
                    <div style={{marginTop:6,paddingTop:6,borderTop:"1px solid var(--border)",display:"flex",justifyContent:"flex-end"}}>
                      <span className={`badge ${adminStatusCfg[j.adminStatus]?.badge}`}>
                        {adminStatusCfg[j.adminStatus]?.label}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={()=>setShowForm(false)}>
          <div className="modal" style={{maxWidth:440}} onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <div><div style={{fontWeight:700,fontSize:16}}>تقديم تبرير غياب</div>
              <div style={{fontSize:12,color:"var(--text-secondary)"}}>سيُرسل مباشرة إلى الأستاذ</div></div>
              <button className="modal-close" onClick={()=>setShowForm(false)}>✕</button>
            </div>
            <div style={{padding:"0 0 20px",display:"flex",flexDirection:"column",gap:14}}>
              <div>
                <label className="form-label">الوحدة الدراسية *</label>
                <select className="form-input" value={form.module} onChange={e=>setForm({...form,module:e.target.value})}>
                  <option value="">اختر الوحدة</option>
                  {MODULES.map(m=><option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">مدة الغياب *</label>
                <div style={{display:"flex",gap:8}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,color:"var(--text-muted)",marginBottom:4}}>من</div>
                    <input type="date" className="form-input" value={form.startDate}
                      onChange={e=>setForm({...form,startDate:e.target.value})}/>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,color:"var(--text-muted)",marginBottom:4}}>إلى</div>
                    <input type="date" className="form-input" value={form.endDate}
                      onChange={e=>setForm({...form,endDate:e.target.value})}/>
                  </div>
                </div>
              </div>
              <div>
                <label className="form-label">سبب الغياب *</label>
                <textarea className="form-input" rows={3} placeholder="اذكر سبب غيابك..." value={form.reason}
                  onChange={e=>setForm({...form,reason:e.target.value})} style={{resize:"none"}}/>
              </div>
              <div>
                <label className="form-label">مستند داعم (اختياري)</label>
                <input ref={fileRef} type="file" accept="image/*,application/pdf" hidden onChange={e=>setFile(e.target.files[0])}/>
                <div onClick={()=>fileRef.current?.click()} style={{border:"2px dashed var(--border)",borderRadius:"var(--radius-sm)",padding:"16px",textAlign:"center",cursor:"pointer",color:"var(--text-secondary)",fontSize:13}}>
                  <Upload size={20} style={{margin:"0 auto 6px",display:"block"}}/>
                  {file ? file.name : "PDF أو صورة"}
                </div>
              </div>
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <button className="btn btn-ghost" onClick={()=>setShowForm(false)}>إلغاء</button>
              <button className="btn btn-primary" onClick={handleSubmit}
                disabled={!form.module||!form.startDate||!form.endDate||!form.reason}>
                <Send size={13} style={{marginLeft:6}}/> إرسال للأستاذ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}