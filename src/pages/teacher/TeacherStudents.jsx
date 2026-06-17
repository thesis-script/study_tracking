import { CheckCircle, XCircle } from "lucide-react";
import { store } from "../../store";
import { useStore } from "../../useStore";

export default function TeacherStudents() {
  const state = useStore();
  const students = store.getAllStudents();
  const scans = state.attendanceRecords;

  return (
    <div>
      <div className="page-header">
        <div><h2>طلابي</h2><p>قائمة الطلاب المسجلين وسجل حضورهم عبر QR</p></div>
        <span className="badge badge-info" style={{fontSize:14,padding:"6px 14px"}}>{students.length} طالب</span>
      </div>
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>الطالب</th><th>المجموعة</th><th>عمليات المسح</th><th>آخر حصة حضرها</th><th>الحالة</th></tr></thead>
            <tbody>
              {students.map(s => {
                const myScans = scans.filter(r => r.studentId === s.studentId);
                const last = myScans[myScans.length - 1];
                return (
                  <tr key={s.studentId}>
                    <td><div style={{fontWeight:600}}>{s.name}</div><div style={{fontSize:11,color:"var(--text-secondary)"}}>{s.studentId}</div></td>
                    <td><span className="badge badge-info">{s.group}</span></td>
                    <td><span style={{fontWeight:700,color:"var(--primary)"}}>{myScans.length}</span></td>
                    <td style={{fontSize:12,color:"var(--text-secondary)"}}>{last ? `${last.module} · ${new Date(last.scannedAt).toLocaleDateString("ar")}` : "—"}</td>
                    <td>{myScans.length > 0 ? <span className="badge badge-success"><CheckCircle size={10} style={{marginLeft:3}}/>نشط</span> : <span className="badge badge-neutral">لم يُسجَّل بعد</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
