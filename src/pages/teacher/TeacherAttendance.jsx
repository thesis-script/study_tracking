import { useState, useEffect } from "react";
import { X, QrCode, CheckCircle, Power, PowerOff, Share2, Clock, Wifi } from "lucide-react";
import { store, SCHEDULE } from "../../store";
import { useStore } from "../../useStore";

function generateQRMatrix(seed) {
  const size = 21, matrix = Array.from({length:size},()=>Array(size).fill(0));
  const drawFinder = (r,c) => { for(let i=0;i<7;i++) for(let j=0;j<7;j++){const o=i===0||i===6||j===0||j===6,ic=i>=2&&i<=4&&j>=2&&j<=4;if(r+i<size&&c+j<size)matrix[r+i][c+j]=(o||ic)?1:0;}};
  drawFinder(0,0);drawFinder(0,size-7);drawFinder(size-7,0);
  for(let i=8;i<size-8;i++){matrix[6][i]=i%2===0?1:0;matrix[i][6]=i%2===0?1:0;}
  for(let i=-2;i<=2;i++)for(let j=-2;j<=2;j++){const o=Math.abs(i)===2||Math.abs(j)===2,ic=i===0&&j===0;if(14+i>=0&&14+j>=0&&14+i<size&&14+j<size)matrix[14+i][14+j]=(o||ic)?1:0;}
  let s=seed;
  for(let r=0;r<size;r++)for(let c=0;c<size;c++){const inTL=r<8&&c<8,inTR=r<8&&c>=size-8,inBL=r>=size-8&&c<8,isTim=r===6||c===6,isAl=r>=12&&r<=16&&c>=12&&c<=16;if(!inTL&&!inTR&&!inBL&&!isTim&&!isAl){s=(s*1664525+1013904223)&0xffffffff;matrix[r][c]=(s>>>0)%3===0?1:0;}}
  return matrix;
}
function QRSvg({data,size=200}){const seed=data.split("").reduce((a,c)=>a+c.charCodeAt(0),0);const m=generateQRMatrix(seed);const cell=size/m.length;return(<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg" style={{display:"block",borderRadius:8}}><rect width={size} height={size} fill="white"/>{m.map((row,r)=>row.map((v,c)=>v?<rect key={`${r}-${c}`} x={c*cell} y={r*cell} width={cell} height={cell} fill="#0A2E6D"/>:null))}</svg>);}

function QRModal({ qr, onClose }) {
  const state = useStore();
  const scans = state.attendanceRecords.filter(r => r.qrId === qr.id);
  const [timeLeft, setTimeLeft] = useState(Math.max(0, Math.floor((qr.expiresAt - Date.now())/1000)));
  const isActive = qr.active && qr.expiresAt > Date.now();

  useEffect(() => {
    const t = setInterval(() => {
      const r = Math.max(0, Math.floor((qr.expiresAt - Date.now())/1000));
      setTimeLeft(r);
      if (r === 0) store.expireQR(qr.id);
    }, 1000);
    return () => clearInterval(t);
  }, [qr.id, qr.expiresAt]);

  const mm = String(Math.floor(timeLeft/60)).padStart(2,"0");
  const ss = String(timeLeft%60).padStart(2,"0");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{maxWidth:460}} onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div style={{fontWeight:700,fontSize:16}}>رمز QR — {qr.module}</div>
            <div style={{fontSize:12,color:"var(--text-secondary)",marginTop:2}}>{qr.group} · {qr.time} · {qr.room}</div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <button className={`btn btn-sm ${isActive?"btn-danger":"btn-primary"}`} onClick={()=>store.toggleQR(qr.id)}>
              {isActive?<><PowerOff size={12}/> إيقاف</>:<><Power size={12}/> تفعيل</>}
            </button>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
        </div>

        <div style={{padding:"0 0 20px",display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>
          <div style={{background:"var(--surface-2)",borderRadius:"var(--radius)",padding:24,display:"flex",flexDirection:"column",alignItems:"center",gap:10,width:"100%",position:"relative"}}>
            {!isActive && (
              <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.6)",borderRadius:"var(--radius)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,zIndex:10}}>
                <PowerOff size={32} color="white"/><span style={{color:"white",fontWeight:700}}>الرمز موقوف</span>
              </div>
            )}
            <div className="no-screenshot"><QRSvg data={qr.id} size={200}/></div>
            <div style={{display:"flex",alignItems:"center",gap:6,fontSize:14,fontWeight:700,color:timeLeft<30?"var(--danger)":"var(--primary)"}}>
              <Clock size={14}/> {mm}:{ss}
            </div>
            {!qr.shared && isActive && (
              <div style={{fontSize:11,color:"var(--warning)",fontWeight:600}}>⚠️ لم تتم المشاركة بعد — الطلاب لا يرون هذا الرمز</div>
            )}
            {qr.shared && <div style={{fontSize:11,color:"var(--accent)",fontWeight:600}}>✓ تمت المشاركة مع الطلاب المسجلين</div>}
          </div>

          {/* Share button — only registered students will see it */}
          {!qr.shared ? (
            <button className="btn btn-primary btn-full" onClick={()=>store.shareQR(qr.id)} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              <Share2 size={14}/> مشاركة مع الطلاب المسجلين فقط
            </button>
          ) : (
            <div style={{textAlign:"center",fontSize:13,color:"var(--accent)",fontWeight:600}}>✅ الرمز مشارك — الطلاب يمكنهم مسحه الآن</div>
          )}

          {/* Live attendance feed */}
          <div style={{width:"100%"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,fontSize:13,fontWeight:700}}>
              <Wifi size={14} color="var(--accent)"/>
              <span>الحضور المُسجَّل ({scans.length})</span>
              <div style={{width:8,height:8,borderRadius:"50%",background:"var(--accent)",animation:"pulse 1.5s infinite",marginRight:"auto"}}/>
            </div>
            {scans.length === 0 ? (
              <div style={{textAlign:"center",padding:16,color:"var(--text-muted)",fontSize:13,background:"var(--surface-2)",borderRadius:"var(--radius-sm)"}}>
                {qr.shared ? "في انتظار مسح الطلاب..." : "شارك الرمز أولاً"}
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:200,overflowY:"auto"}}>
                {scans.map((r,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:"var(--accent-light)",borderRadius:"var(--radius-sm)",border:"1px solid var(--accent)"}}>
                    <CheckCircle size={14} color="var(--accent)"/>
                    <span style={{fontSize:13,fontWeight:600,flex:1}}>{r.studentName}</span>
                    <span style={{fontSize:11,color:"var(--text-secondary)"}}>{r.studentId}</span>
                    <span style={{fontSize:10,color:"var(--text-muted)"}}>{new Date(r.scannedAt).toLocaleTimeString("ar")}</span>
                    <span className="badge badge-success">✓</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <button className="btn btn-primary btn-full" onClick={onClose}>إنهاء</button>
      </div>
    </div>
  );
}

function CreateQRDialog({ onClose, onCreated, teacherName }) {
  const [sel, setSel] = useState(SCHEDULE[0]?.id ?? "");
  const [duration, setDuration] = useState(2);
  const session = SCHEDULE.find(s => s.id === Number(sel)) || SCHEDULE[0];

  const handle = () => {
    const qr = store.createQRSession({
      module: session.module, group: session.group,
      time: session.time, room: session.room,
      teacher: teacherName, durationMinutes: duration,
    });
    onCreated(qr);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{maxWidth:460}} onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div><div style={{fontWeight:700,fontSize:16}}>إنشاء رمز QR</div>
          <div style={{fontSize:12,color:"var(--text-secondary)"}}>الرمز لا يظهر للطلاب حتى تضغط «مشاركة»</div></div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div style={{padding:"16px 20px",display:"flex",flexDirection:"column",gap:14}}>
          <div>
            <label style={{fontSize:12,color:"var(--text-secondary)",display:"block",marginBottom:5}}>الحصة</label>
            <select value={sel} onChange={e=>setSel(e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:"var(--radius-sm)",border:"1px solid var(--border)",background:"var(--surface-2)",fontSize:13}}>
              {SCHEDULE.map(s=><option key={s.id} value={s.id}>{s.module} — {s.group} ({s.day} · {s.time})</option>)}
            </select>
          </div>
          <div>
            <label style={{fontSize:12,color:"var(--text-secondary)",display:"block",marginBottom:5}}>المدة (دقيقة)</label>
            <input type="number" min={1} max={10} value={duration} onChange={e=>setDuration(Number(e.target.value))}
              style={{width:"100%",padding:"8px 10px",borderRadius:"var(--radius-sm)",border:"1px solid var(--border)",background:"var(--surface-2)",fontSize:13}}/>
          </div>
          {session && (
            <div style={{background:"var(--surface-2)",borderRadius:"var(--radius)",padding:16,display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
              <QRSvg data={`PREVIEW_${session.id}_${duration}`} size={130}/>
              <div style={{textAlign:"center"}}>
                <div style={{fontWeight:600,fontSize:13}}>{session.module} · {session.group}</div>
                <div style={{fontSize:11,color:"var(--text-secondary)",marginTop:2}}>{session.time} · {session.room}</div>
              </div>
              <div style={{fontSize:12,background:"var(--primary-light)",color:"var(--primary)",padding:"4px 12px",borderRadius:20}}>⏱ صالح لـ {duration} دقيقة</div>
            </div>
          )}
        </div>
        <div style={{padding:"12px 20px",borderTop:"1px solid var(--border)",display:"flex",gap:8,justifyContent:"flex-end"}}>
          <button className="btn btn-secondary" onClick={onClose}>إلغاء</button>
          <button className="btn btn-primary" onClick={handle}><QrCode size={14} style={{marginLeft:6}}/> توليد الرمز</button>
        </div>
      </div>
    </div>
  );
}

export default function TeacherAttendance({ user }) {
  const state = useStore();
  const [selectedSession, setSelectedSession] = useState(null);
  const [showQR, setShowQR] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const qrSessions = state.qrSessions;
  const allRecords = state.attendanceRecords;
  const teacherName = user?.name || "الأستاذ";

  const currentScans = selectedSession
    ? allRecords.filter(r => r.module === selectedSession.module && r.group === selectedSession.group)
    : [];

  return (
    <div>
      <div className="page-header">
        <div><h2>تسجيل الحضور</h2><p>أنشئ رمز QR ثم شاركه — الطلاب يمسحونه لتسجيل حضورهم</p></div>
        <button className="btn btn-primary" onClick={()=>setShowCreate(true)}>
          <QrCode size={15} style={{marginLeft:6}}/> إنشاء رمز QR
        </button>
      </div>

      {/* Active QR sessions */}
      {qrSessions.length > 0 && (
        <div className="card" style={{marginBottom:20}}>
          <div className="card-header"><div className="card-title">الرموز المُنشأة</div></div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {qrSessions.map(qr => {
              const alive = qr.active && qr.expiresAt > Date.now();
              const scans = allRecords.filter(r=>r.qrId===qr.id).length;
              const tl = Math.max(0,Math.floor((qr.expiresAt-Date.now())/1000));
              return (
                <div key={qr.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:"var(--radius-sm)",border:`1px solid ${alive?"var(--accent)":"var(--border)"}`,background:alive?"var(--accent-light)":"var(--surface-2)"}}>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,fontSize:13}}>{qr.module} · {qr.group}</div>
                    <div style={{fontSize:11,color:"var(--text-secondary)",marginTop:2}}>{qr.time} · {qr.room}</div>
                  </div>
                  <span className="badge badge-success">{scans} حضور</span>
                  {alive && <span style={{fontSize:11,color:"var(--danger)",fontWeight:700}}>{Math.floor(tl/60)}:{String(tl%60).padStart(2,"0")}</span>}
                  {qr.shared ? <span className="badge badge-success">مشارك ✓</span> : <span className="badge badge-warning">غير مشارك</span>}
                  <span className={`badge ${alive?"badge-success":"badge-neutral"}`}>{alive?"نشط":"منتهي"}</span>
                  <button className="btn btn-sm btn-secondary" onClick={()=>setShowQR(qr)}>عرض</button>
                  <button className={`btn btn-sm ${alive?"btn-danger":"btn-primary"}`} onClick={()=>store.toggleQR(qr.id)}>
                    {alive?<PowerOff size={12}/>:<Power size={12}/>}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Session selector */}
      <div className="card" style={{marginBottom:20}}>
        <div className="card-header"><div className="card-title">اختر الحصة لعرض الحضور</div></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
          {SCHEDULE.map(s=>(
            <div key={s.id} onClick={()=>setSelectedSession(s)}
              style={{padding:16,borderRadius:"var(--radius)",cursor:"pointer",
                border:`2px solid ${selectedSession?.id===s.id?"var(--primary)":"var(--border)"}`,
                background:selectedSession?.id===s.id?"var(--primary-light)":"var(--surface-2)"}}>
              <div style={{fontWeight:700,marginBottom:4}}>{s.module}</div>
              <div style={{fontSize:12,color:"var(--text-secondary)"}}>{s.group} · {s.day}</div>
              <div style={{fontSize:12,color:"var(--text-muted)",marginTop:2}}>{s.time} · {s.room}</div>
              <span className={`badge ${s.type==="Cours"?"badge-info":s.type==="TD"?"badge-success":"badge-warning"}`} style={{marginTop:8}}>{s.type}</span>
            </div>
          ))}
        </div>
      </div>

      {selectedSession && (
        <div className="card">
          <div className="card-header">
            <div><div className="card-title">حضور — {selectedSession.module} · {selectedSession.group}</div>
            <div className="card-subtitle">{selectedSession.time}</div></div>
            <span className="badge badge-success">{currentScans.length} حضور</span>
          </div>
          {currentScans.length === 0 ? (
            <div style={{textAlign:"center",padding:32,color:"var(--text-muted)"}}>
              <div style={{fontSize:32,marginBottom:8}}>👆</div>
              أنشئ رمز QR وشاركه مع الطلاب لتسجيل حضورهم
            </div>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {currentScans.map((r,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:"var(--accent-light)",borderRadius:"var(--radius-sm)",border:"1px solid var(--accent)"}}>
                  <CheckCircle size={14} color="var(--accent)"/>
                  <span style={{fontSize:13,fontWeight:600,flex:1}}>{r.studentName}</span>
                  <span style={{fontSize:11,color:"var(--text-secondary)"}}>{r.studentId} · {r.group}</span>
                  <span style={{fontSize:10,color:"var(--text-muted)"}}>{new Date(r.scannedAt).toLocaleTimeString("ar")}</span>
                  <span className="badge badge-success">QR ✓</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showQR && <QRModal qr={state.qrSessions.find(q=>q.id===showQR.id)||showQR} onClose={()=>setShowQR(null)}/>}
      {showCreate && <CreateQRDialog onClose={()=>setShowCreate(false)} onCreated={qr=>setShowQR(qr)} teacherName={teacherName}/>}
    </div>
  );
}
