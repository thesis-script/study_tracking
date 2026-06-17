import { BookOpen } from "lucide-react";
import { MODULES } from "../../store";

export default function AdminModules() {
  return (
    <div>
      <div className="page-header"><div><h2>إدارة المواد والحصص</h2><p>{MODULES.length} مادة مسجلة</p></div></div>
      <div className="card">
        <div className="card-header"><div className="card-title">قائمة المواد</div></div>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>المادة</th><th>الرمز</th><th>الرصيد</th><th>الأستاذ المسؤول</th></tr></thead>
            <tbody>
              {MODULES.map(m => (
                <tr key={m.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "var(--radius-sm)", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}><BookOpen size={16}/></div>
                      <span style={{ fontWeight: 600 }}>{m.name}</span>
                    </div>
                  </td>
                  <td><span style={{ fontFamily: "monospace", background: "var(--surface-2)", padding: "3px 8px", borderRadius: 4, fontSize: 12 }}>{m.id}</span></td>
                  <td><span className="badge badge-info">{m.credits} رصيد</span></td>
                  <td style={{ color: "var(--text-secondary)" }}>{m.teacher}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
