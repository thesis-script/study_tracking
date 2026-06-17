import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { store } from "../../store";
import { useStore } from "../../useStore";

export default function TeacherStats() {
  const state = useStore();
  const students = store.getAllStudents();
  const scans = state.attendanceRecords;
  const justifications = state.justifications;

  // Attendance % per student based on real scan records
  const attendanceData = students.map(s => {
    const count = scans.filter(r => r.studentId === s.studentId).length;
    return { name: s.name.split(" ")[0], scans: count };
  });

  // Absences by module derived from justifications
  const moduleMap = {};
  justifications.forEach(j => {
    if (!moduleMap[j.module]) moduleMap[j.module] = { module: j.module, justified: 0, total: 0 };
    moduleMap[j.module].total++;
    if (j.status === "accepted") moduleMap[j.module].justified++;
  });
  const moduleData = Object.values(moduleMap);

  const totalScans = scans.length;
  const totalStudents = students.length;
  const studentsWithNoScan = students.filter(s => !scans.some(r => r.studentId === s.studentId)).length;

  return (
    <div>
      <div className="page-header"><div><h2>إحصائيات الحضور</h2><p>تقارير حضور طلابي المعتمدة على مسح QR الفعلي</p></div></div>

      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(4,1fr)", marginBottom: 24 }}>
        <div className="stat-card"><div className="stat-icon blue"/><div><div className="stat-value">{totalScans}</div><div className="stat-label">إجمالي عمليات المسح</div></div></div>
        <div className="stat-card"><div className="stat-icon green"/><div><div className="stat-value">{totalStudents}</div><div className="stat-label">إجمالي الطلاب</div></div></div>
        <div className="stat-card"><div className="stat-icon orange"/><div><div className="stat-value">{justifications.length}</div><div className="stat-label">تبريرات</div></div></div>
        <div className="stat-card"><div className="stat-icon red"/><div><div className="stat-value">{studentsWithNoScan}</div><div className="stat-label">لم يسجلوا حضور بعد</div></div></div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><div className="card-title">عمليات المسح حسب الطالب</div></div>
        {attendanceData.every(d=>d.scans===0) ? (
          <div className="empty-state" style={{padding:24}}><p>لا توجد بيانات مسح بعد</p></div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={attendanceData} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: "inherit" }} angle={-30} textAnchor="end" />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false}/>
              <Tooltip contentStyle={{ borderRadius: 8, fontFamily: "inherit" }} />
              <Bar dataKey="scans" name="عمليات المسح" radius={[4, 4, 0, 0]} fill="var(--primary)" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="card">
        <div className="card-header"><div className="card-title">التبريرات حسب المادة</div></div>
        {moduleData.length === 0 ? (
          <div className="empty-state" style={{padding:24}}><p>لا توجد تبريرات بعد</p></div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={moduleData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="module" tick={{ fontSize: 12, fontFamily: "inherit" }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false}/>
              <Tooltip contentStyle={{ borderRadius: 8, fontFamily: "inherit" }} />
              <Bar dataKey="justified" name="مقبولة" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="total" name="الإجمالي" fill="var(--danger)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
