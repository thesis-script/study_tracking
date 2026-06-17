import { useState } from "react";
import { FileText, Check, X, Paperclip } from "lucide-react";
import { store } from "../../store";
import { useStore } from "../../useStore";

export default function AdminJustifications() {
  const state = useStore();
  const [filter, setFilter] = useState("all");

  // Only justifications the teacher has forwarded to admin are relevant here
  const forwarded = state.justifications.filter(j => j.teacherSentToAdmin);

  const filtered = forwarded.filter(j => filter === "all" ? true : j.adminStatus === filter);

  const badge = (status) => {
    if (status === "pending") return <span className="badge badge-warning">معلق</span>;
    if (status === "accepted") return <span className="badge badge-success">مقبول</span>;
    if (status === "rejected") return <span className="badge badge-danger">مرفوض</span>;
  };

  const counts = {
    all: forwarded.length,
    pending: forwarded.filter(j => j.adminStatus === "pending").length,
    accepted: forwarded.filter(j => j.adminStatus === "accepted").length,
    rejected: forwarded.filter(j => j.adminStatus === "rejected").length,
  };

  return (
    <div>
      <div className="page-header">
        <div><h2>إدارة تبريرات الغياب</h2><p>التبريرات المُحالة من الأساتذة لاتخاذ القرار النهائي</p></div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(4,1fr)", marginBottom: 24 }}>
        {[
          { key: "all", label: "الكل", color: "blue" },
          { key: "pending", label: "معلق", color: "orange" },
          { key: "accepted", label: "مقبول", color: "green" },
          { key: "rejected", label: "مرفوض", color: "red" },
        ].map(({ key, label, color }) => (
          <div key={key} className="stat-card" style={{ cursor: "pointer", border: filter === key ? "2px solid var(--primary)" : undefined }} onClick={() => setFilter(key)}>
            <div className={`stat-icon ${color}`}><FileText size={22} /></div>
            <div><div className="stat-value">{counts[key]}</div><div className="stat-label">{label}</div></div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">قائمة التبريرات المُحالة</div>
          <select className="filter-select" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">جميع التبريرات</option>
            <option value="pending">المعلقة</option>
            <option value="accepted">المقبولة</option>
            <option value="rejected">المرفوضة</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state"><FileText size={36}/><h3>لا توجد تبريرات محالة</h3><p>تظهر هنا التبريرات التي قبلها الأستاذ وأرسلها للإدارة</p></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>الطالب</th><th>رقم التسجيل</th><th>المادة</th><th>التاريخ</th><th>السبب</th><th>وثيقة</th><th>قرار الأستاذ</th><th>قرار الإدارة</th><th>الإجراء</th></tr></thead>
              <tbody>
                {filtered.map(j => (
                  <tr key={j.id}>
                    <td style={{ fontWeight: 600 }}>{j.studentName}</td>
                    <td style={{ color: "var(--text-secondary)", fontFamily: "monospace" }}>{j.studentId}</td>
                    <td>{j.module}</td>
                    <td>{j.date}</td>
                    <td style={{ maxWidth: 180, fontSize: 12 }}>{j.reason}</td>
                    <td>{j.fileName ? <span style={{ color: "var(--primary)", display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}><Paperclip size={12}/>{j.fileName}</span> : <span style={{ color: "var(--text-muted)", fontSize: 12 }}>لا يوجد</span>}</td>
                    <td><span className="badge badge-success">مقبول من الأستاذ</span></td>
                    <td>{badge(j.adminStatus)}</td>
                    <td>
                      {j.adminStatus === "pending" && (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn btn-success btn-sm" onClick={() => store.adminDecideJustification(j.id, "accepted")}><Check size={13}/> قبول</button>
                          <button className="btn btn-danger btn-sm" onClick={() => store.adminDecideJustification(j.id, "rejected")}><X size={13}/> رفض</button>
                        </div>
                      )}
                      {j.adminStatus !== "pending" && <span style={{fontSize:11,color:"var(--text-muted)"}}>تم البت</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
