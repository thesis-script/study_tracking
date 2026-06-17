import { Bell, BellOff, CheckCheck, FileText, AlertTriangle, Info, QrCode } from "lucide-react";
import { store } from "../../store";
import { useStore } from "../../useStore";

const typeCfg = {
  justification: { Icon:FileText,     color:"var(--warning)", bg:"#FFF7ED", label:"تبرير غياب" },
  report:        { Icon:AlertTriangle, color:"var(--danger)",  bg:"#FEF2F2", label:"تقرير" },
  info:          { Icon:Info,          color:"var(--primary)", bg:"var(--primary-light)", label:"معلومة" },
  qr_share:      { Icon:QrCode,        color:"var(--accent)",  bg:"var(--accent-light)", label:"مشاركة QR" },
};

function ago(ts) {
  const s = (Date.now()-ts)/1000;
  if(s<60) return "الآن";
  if(s<3600) return `منذ ${Math.floor(s/60)} دقيقة`;
  if(s<86400) return `منذ ${Math.floor(s/3600)} ساعة`;
  return `منذ ${Math.floor(s/86400)} يوم`;
}

export default function AdminNotifications() {
  const state = useStore();
  const notifs = state.adminNotifications;
  const unread = notifs.filter(n=>!n.read).length;

  // Justifications that have been sent to admin for final decision
  const pendingJustifications = state.justifications.filter(j => j.teacherSentToAdmin && j.adminStatus === "pending");

  return (
    <div>
      <div className="page-header">
        <div><h2>إشعارات الأساتذة</h2><p>رسائل وتبريرات محالة من الأساتذة</p></div>
        {unread > 0 && (
          <button className="btn btn-secondary" onClick={()=>store.markAllAdminNotifsRead()} style={{display:"flex",alignItems:"center",gap:6}}>
            <CheckCheck size={14}/> تحديد الكل كمقروء
          </button>
        )}
      </div>

      {unread > 0 && (
        <div style={{background:"var(--primary-light)",border:"1px solid var(--primary)",borderRadius:"var(--radius)",padding:"12px 16px",marginBottom:20,display:"flex",alignItems:"center",gap:10}}>
          <Bell size={16} color="var(--primary)"/>
          <span style={{fontSize:13,fontWeight:600,color:"var(--primary)"}}>{unread} إشعار غير مقروء</span>
        </div>
      )}

      {/* Justifications awaiting admin decision */}
      {pendingJustifications.length > 0 && (
        <div className="card" style={{marginBottom:20}}>
          <div className="card-header">
            <div className="card-title">تبريرات تنتظر قرار الإدارة</div>
            <span className="badge badge-warning">{pendingJustifications.length}</span>
          </div>
          {pendingJustifications.map(j => (
            <div key={j.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:"1px solid var(--border)"}}>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:13}}>{j.studentName} · {j.group}</div>
                <div style={{fontSize:12,color:"var(--text-secondary)",marginTop:2}}>{j.module} · {j.date}</div>
                <div style={{fontSize:12,marginTop:2}}>{j.reason}</div>
              </div>
              <div style={{display:"flex",gap:6}}>
                <button className="btn btn-success btn-sm" onClick={()=>store.adminDecideJustification(j.id,"accepted")}>قبول</button>
                <button className="btn btn-danger btn-sm" onClick={()=>store.adminDecideJustification(j.id,"rejected")}>رفض</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <div className="card-header"><div className="card-title">سجل الإشعارات</div></div>
        {notifs.length === 0 ? (
          <div className="empty-state"><BellOff size={40}/><h3>لا توجد إشعارات</h3><p>ستظهر هنا إشعارات الأساتذة</p></div>
        ) : notifs.map((n,i)=>{
          const cfg = typeCfg[n.type] || typeCfg.info;
          const Icon = cfg.Icon;
          return (
            <div key={n.id} onClick={()=>store.markAdminNotifRead(n.id)}
              style={{display:"flex",gap:14,padding:"16px 0",borderBottom:i<notifs.length-1?"1px solid var(--border)":"none",
                cursor:"pointer",opacity:n.read?0.65:1,transition:"opacity 0.2s"}}>
              <div style={{width:40,height:40,borderRadius:"50%",background:cfg.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <Icon size={18} color={cfg.color}/>
              </div>
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",marginBottom:4}}>
                  <div style={{fontWeight:n.read?500:700,fontSize:14}}>{n.title}</div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:11,color:"var(--text-muted)"}}>{ago(n.createdAt)}</span>
                    {!n.read && <div style={{width:8,height:8,borderRadius:"50%",background:"var(--primary)"}}/>}
                  </div>
                </div>
                <div style={{fontSize:12,color:"var(--text-secondary)",marginBottom:6}}>{n.body}</div>
                <div style={{display:"flex",gap:8}}>
                  <span style={{fontSize:11,color:cfg.color,background:cfg.bg,padding:"2px 8px",borderRadius:20,fontWeight:600}}>{cfg.label}</span>
                  {n.from && <span style={{fontSize:11,color:"var(--text-muted)"}}>من: {n.from}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
