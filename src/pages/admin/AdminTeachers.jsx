import { Users2, BookOpen } from "lucide-react";
import { USERS, MODULES, SCHEDULE } from "../../store";

export default function AdminTeachers() {
  const teachers = USERS.teacher;
  const totalModulesAssigned = teachers.reduce((a, t) => a + (t.modules?.length || 0), 0);
  const totalSessions = SCHEDULE.length;

  return (
    <div>
      <div className="page-header"><div><h2>إدارة الأساتذة</h2><p>{teachers.length} أستاذ في الفصل الحالي</p></div></div>

      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 24 }}>
        <div className="stat-card"><div className="stat-icon blue"><Users2 size={22}/></div><div><div className="stat-value">{teachers.length}</div><div className="stat-label">إجمالي الأساتذة</div></div></div>
        <div className="stat-card"><div className="stat-icon green"><BookOpen size={22}/></div><div><div className="stat-value">{totalModulesAssigned}</div><div className="stat-label">إجمالي المواد</div></div></div>
        <div className="stat-card"><div className="stat-icon purple"><BookOpen size={22}/></div><div><div className="stat-value">{totalSessions}</div><div className="stat-label">إجمالي الحصص الأسبوعية</div></div></div>
      </div>

      <div className="card">
        <div className="card-header"><div className="card-title">قائمة الأساتذة</div></div>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>الأستاذ</th><th>البريد</th><th>المواد</th><th>المجموعات</th></tr></thead>
            <tbody>
              {teachers.map((t,i) => (
                <tr key={i}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, var(--primary), var(--secondary))", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>{t.name.charAt(2)}</div>
                      <span style={{ fontWeight: 600 }}>{t.name}</span>
                    </div>
                  </td>
                  <td style={{ color: "var(--text-secondary)", fontSize: 12 }}>{t.email}</td>
                  <td><div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>{(t.modules||[]).map(m => <span key={m} className="badge badge-info">{m}</span>)}</div></td>
                  <td><div style={{ display: "flex", gap: 4 }}>{(t.groups||[]).map(g => <span key={g} className="badge badge-neutral">{g}</span>)}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
