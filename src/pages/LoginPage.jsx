import { useState } from "react";
import { GraduationCap, ShieldCheck, BookOpen, Check, ArrowRight, ArrowLeft, Smartphone } from "lucide-react";
import { store, USERS } from "../store";

export default function LoginPage({ onLogin, forceRole }) {
  const [step, setStep] = useState(forceRole ? 2 : 1);
  const [selectedRole, setSelectedRole] = useState(forceRole || null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRoleSelect = r => { setSelectedRole(r); setError(""); };

  const handleNext = () => {
    if (!selectedRole) { setError("يرجى اختيار دور"); return; }
    setError(""); setStep(2);
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!email || !password) { setError("يرجى ملء جميع الحقول"); return; }
    const user = store.login(email, password);
    if (!user) { setError("البريد أو كلمة المرور غير صحيحة"); return; }
    if (user.role !== selectedRole) { setError(`هذا الحساب مخصص لـ ${user.role === "admin" ? "الإدارة" : user.role === "teacher" ? "الأستاذ" : "الطالب"}`); return; }
    onLogin(user);
  };

  const hints = {
    admin:   { email: "admin@univ.dz",            pass: "admin" },
    teacher: { email: "teacher@univ.dz",           pass: "1234" },
    student: { email: "2024001@student.univ.dz",   pass: "1234" },
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon"><img src="/logo-full.png" alt="Logo" style={{ width:50, height:50 }} /></div>
          <div><h1>Students Attendance Tracking</h1><p>QR Code Attendance System</p></div>
        </div>
        <h2 className="auth-title">مرحباً بك</h2>
        <p className="auth-subtitle">سجّل دخولك للوصول إلى لوحة التحكم</p>

        {step === 1 ? (
          <div>
            <div className="form-group" style={{ marginBottom:24 }}>
              <label className="form-label">اختر دورك</label>
              <div className="role-selector">
                {[
                  { id:"admin",   Icon:ShieldCheck,   label:"الإدارة",  desc:"إدارة الطلاب، الأساتذة والتقارير" },
                  { id:"teacher", Icon:BookOpen,       label:"الأستاذ",  desc:"تسجيل الحضور وإدارة الغياب" },
                ].map(({ id, Icon, label, desc }) => (
                  <div key={id} className={`role-option ${selectedRole===id?"selected":""}`} onClick={()=>handleRoleSelect(id)}>
                    <div className={`role-icon ${id}`}><Icon size={20}/></div>
                    <div className="role-text"><strong>{label}</strong><span>{desc}</span></div>
                    <div className="role-check">{selectedRole===id && <Check size={12} color="white"/>}</div>
                  </div>
                ))}
              </div>
            </div>
            {error && <div style={{color:"var(--danger)",fontSize:13,marginBottom:16,padding:"10px 14px",background:"var(--danger-light)",borderRadius:"var(--radius-sm)"}}>{error}</div>}
            <button className="btn btn-primary btn-full" style={{padding:14}} onClick={handleNext}>
              متابعة <ArrowRight size={16} style={{marginRight:8}}/>
            </button>
            
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {!forceRole && (
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
                <button type="button" className="btn btn-ghost" onClick={()=>setStep(1)} style={{display:"flex",alignItems:"center",gap:6}}>
                  <ArrowLeft size={16}/> رجوع
                </button>
                <div style={{fontSize:13,color:"var(--text-secondary)"}}>
                  الدور: <strong>{selectedRole==="admin"?"الإدارة":selectedRole==="teacher"?"الأستاذ":"الطالب"}</strong>
                </div>
              </div>
            )}
            {forceRole === "student" && (
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:"var(--primary-light)",borderRadius:"var(--radius-sm)",marginBottom:20}}>
                <Smartphone size={16} color="var(--primary)"/>
                <span style={{fontSize:13,color:"var(--primary)",fontWeight:600}}>بوابة الطلاب — مسح QR والحضور</span>
              </div>
            )}
            <div className="form-group">
              <label className="form-label">البريد الإلكتروني</label>
              <input className="form-input" type="email" value={email}
                placeholder={hints[selectedRole]?.email}
                onChange={e=>{setEmail(e.target.value);setError("");}}/>
            </div>
            <div className="form-group">
              <label className="form-label">كلمة المرور</label>
              <input className="form-input" type="password" value={password}
                onChange={e=>{setPassword(e.target.value);setError("");}}/>
            </div>
            {/* {selectedRole && (
              <div style={{fontSize:12,color:"var(--text-secondary)",marginBottom:12,padding:"8px 12px",background:"var(--surface-2)",borderRadius:"var(--radius-sm)"}}>
                💡 تجربة: <strong>{hints[selectedRole]?.email}</strong> · كلمة المرور: <strong>{hints[selectedRole]?.pass}</strong>
              </div>
            )} */}
            {error && <div style={{color:"var(--danger)",fontSize:13,marginBottom:16,padding:"10px 14px",background:"var(--danger-light)",borderRadius:"var(--radius-sm)"}}>{error}</div>}
            <button type="submit" className="btn btn-primary btn-full" style={{padding:14}}>تسجيل الدخول</button>
          </form>
        )}
        <p style={{textAlign:"center",fontSize:12,color:"var(--text-muted)",marginTop:24}}>نظام تتبع حضور الطلبة عبر QR Code</p>
      </div>
    </div>
  );
}
