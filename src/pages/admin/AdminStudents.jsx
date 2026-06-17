import { store } from "../../store";
import { useStore } from "../../useStore";

export default function AdminStudents() {
  const state = useStore();
  const students = store.getAllStudents();
  const scans = state.attendanceRecords;

  return (
    <div>
      <div className="page-header">
        <div><h2>الطلاب</h2><p>قائمة الطلاب المسجلين في النظام</p></div>
        <span className="badge badge-info" style={{fontSize:14,padding:"6px 14px"}}>{students.length} طالب</span>
      </div>
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>الطالب</th><th>المجموعة</th><th>البريد</th><th>عمليات المسح</th></tr></thead>
            <tbody>
              {students.map(s => {
                const myScans = scans.filter(r => r.studentId === s.studentId);
                return (
                  <tr key={s.studentId}>
                    <td><div style={{fontWeight:600}}>{s.name}</div><div style={{fontSize:11,color:"var(--text-secondary)"}}>{s.studentId}</div></td>
                    <td><span className="badge badge-info">{s.group}</span></td>
                    <td style={{fontSize:12,color:"var(--text-secondary)"}}>{s.email}</td>
                    <td><span style={{fontWeight:700,color:"var(--primary)"}}>{myScans.length}</span></td>
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
