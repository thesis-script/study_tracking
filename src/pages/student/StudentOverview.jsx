import { CheckCircle, XCircle, Clock, BookOpen, Bell } from "lucide-react";
import { MODULES } from "../../store";

export default function StudentOverview({ myScans = [], student, notifications = [] }) {
  const totalScans = myScans.length;

  // Group scans by module to show a simple per-module breakdown
  const byModule = {};
  myScans.forEach(r => {
    if (!byModule[r.module]) byModule[r.module] = 0;
    byModule[r.module]++;
  });

  return (
    <div style={{ paddingBottom: 80 }}>
      <div className="student-hero-card">
        <div className="student-hero-content">
          <div className="student-hero-icon"><CheckCircle size={26} /></div>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800, marginBottom: 4 }}>مرحباً، {student?.name || "الطالب"} 👋</h2>
            <p style={{ fontSize: 12, opacity: 0.85 }}>رقم الطالب: {student?.studentId} · {student?.group}</p>
          </div>
        </div>
        <div className="student-hero-rate">
          <div className="student-hero-circle">
            <span style={{ fontSize: 24, fontWeight: 800 }}>{totalScans}</span>
            <span style={{ fontSize: 10, opacity: 0.8 }}>حصة حضرتها</span>
          </div>
        </div>
      </div>

      <div className="student-stats-grid">
        <div className="student-stat-card green"><div className="student-stat-icon"><CheckCircle size={20}/></div><div><div className="stat-value">{totalScans}</div><div className="stat-label">حضور (QR)</div></div></div>
        <div className="student-stat-card blue"><div className="student-stat-icon"><BookOpen size={20}/></div><div><div className="stat-value">{Object.keys(byModule).length}</div><div className="stat-label">مواد حضرتها</div></div></div>
      </div>

      {myScans.length > 0 ? (
        <div className="student-card" style={{ marginBottom: 16 }}>
          <div className="card-header"><div className="card-title">🔍 آخر عمليات مسح QR</div></div>
          {myScans.slice(-5).reverse().map((r, i) => (
            <div key={i} className="student-attendance-row" style={{ borderRight: "3px solid var(--accent)" }}>
              <div className="student-attendance-icon" style={{ background: "var(--accent-light)", color: "var(--accent)" }}><CheckCircle size={14} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{r.module}</div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{r.group} · {r.time}</div>
              </div>
              <span className="badge badge-success">✓ حاضر</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="student-card" style={{ textAlign: "center", padding: 28, color: "var(--text-muted)" }}>
          <Clock size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
          <div>لم تسجل أي حضور بعد</div>
          <div style={{fontSize:12,marginTop:4}}>انتقل إلى تبويب "مسح QR" عند بدء الحصة</div>
        </div>
      )}

      <div className="student-card">
        <div className="card-header"><div className="card-title">الوحدات الدراسية</div></div>
        {MODULES.map(mod => {
          const count = byModule[mod.name] || 0;
          return (
            <div key={mod.id} className="student-module-row">
              <div className="student-module-code">{mod.id}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{mod.name}</div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{mod.teacher}</div>
              </div>
              <span className="badge badge-success">{count} حضور</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
