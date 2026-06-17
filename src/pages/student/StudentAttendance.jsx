import { CheckCircle, Clock } from "lucide-react";

export default function StudentAttendance({ myScans = [] }) {
  const sorted = [...myScans].sort((a, b) => new Date(b.scannedAt) - new Date(a.scannedAt));

  return (
    <div style={{ paddingBottom: 80 }}>
      <div className="student-card">
        <div className="card-header">
          <div className="card-title">سجل الحضور (عبر QR)</div>
          <span className="badge badge-success">{sorted.length} حضور</span>
        </div>

        {sorted.length === 0 ? (
          <div style={{ textAlign: "center", padding: 32, color: "var(--text-muted)" }}>
            <Clock size={36} style={{ opacity: 0.3, marginBottom: 8 }} />
            <div>لا يوجد سجل حضور بعد</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>سيظهر هنا كل حضور تسجله عبر مسح رمز QR</div>
          </div>
        ) : (
          sorted.map((r, i) => (
            <div key={i} className="student-attendance-row">
              <div className="student-attendance-icon" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
                <CheckCircle size={15} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{r.module}</div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
                  {new Date(r.scannedAt).toLocaleDateString("ar-EG")} · {r.time} · {r.room}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span className="badge" style={{ background: "var(--primary-light)", color: "var(--primary)", fontSize: 10 }}>QR</span>
                <span className="badge badge-success">حاضر</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
