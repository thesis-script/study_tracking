import { SCHEDULE } from "../../store";

const DAYS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس"];

export default function TeacherSchedule() {
  const sessionsByDay = DAYS.map(day => ({ day, sessions: SCHEDULE.filter(s => s.day === day) }));

  const getTypeBg = (type) => {
    if (type === "Cours") return { background: "var(--primary-light)", border: "var(--primary)" };
    if (type === "TD") return { background: "var(--accent-light)", border: "var(--accent)" };
    return { background: "#EDE9FE", border: "var(--secondary)" };
  };

  return (
    <div>
      <div className="page-header"><div><h2>جدول حصصي</h2><p>توزيع الحصص الأسبوعية</p></div></div>

      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        {[
          { type: "Cours", label: "محاضرة", color: "var(--primary)" },
          { type: "TD", label: "أعمال موجهة", color: "var(--accent)" },
          { type: "TP", label: "أعمال تطبيقية", color: "var(--secondary)" },
        ].map(l => (
          <div key={l.type} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: l.color }} />
            <span style={{ color: "var(--text-secondary)" }}>{l.type} — {l.label}</span>
          </div>
        ))}
      </div>

      <div className="card">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
          {sessionsByDay.map(({ day, sessions }) => (
            <div key={day}>
              <div style={{ textAlign: "center", padding: "10px 8px", background: "var(--surface-2)", borderRadius: "var(--radius-sm)", fontWeight: 700, fontSize: 13, marginBottom: 10 }}>{day}</div>
              {sessions.length === 0 ? (
                <div style={{ textAlign: "center", padding: 20, fontSize: 12, color: "var(--text-muted)", border: "1.5px dashed var(--border)", borderRadius: "var(--radius-sm)" }}>لا توجد حصص</div>
              ) : sessions.map(s => {
                const style = getTypeBg(s.type);
                return (
                  <div key={s.id} style={{ background: style.background, borderRight: `3px solid ${style.border}`, borderRadius: "var(--radius-sm)", padding: "12px 10px", marginBottom: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{s.module}</div>
                    <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 2 }}>{s.group} · {s.room}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.time}</div>
                    <span className={`badge ${s.type === "Cours" ? "badge-info" : s.type === "TD" ? "badge-success" : "badge-warning"}`} style={{ marginTop: 6 }}>{s.type}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header"><div className="card-title">ملخص الحصص</div></div>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>اليوم</th><th>المادة</th><th>المجموعة</th><th>الوقت</th><th>القاعة</th><th>النوع</th></tr></thead>
            <tbody>
              {SCHEDULE.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.day}</td>
                  <td>{s.module}</td>
                  <td><span className="badge badge-info">{s.group}</span></td>
                  <td style={{ color: "var(--text-secondary)", fontSize: 12 }}>{s.time}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{s.room}</td>
                  <td><span className={`badge ${s.type === "Cours" ? "badge-info" : s.type === "TD" ? "badge-success" : "badge-warning"}`}>{s.type}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
