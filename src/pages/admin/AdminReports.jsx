import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import * as XLSX from "xlsx";
import { store, USERS, MODULES, SCHEDULE } from "../../store";
import { useStore } from "../../useStore";

const COLORS = ["#4F6AF0", "#10B981", "#F59E0B", "#EF4444", "#7C3AED", "#06B6D4"];

export default function AdminReports() {
  const state = useStore();
  const students = store.getAllStudents();
  const scans = state.attendanceRecords;
  const justifications = state.justifications;

  // Scans by group
  const byGroup = {};
  students.forEach(s => { if (!byGroup[s.group]) byGroup[s.group] = { group: s.group, students: 0, scans: 0 }; byGroup[s.group].students++; });
  scans.forEach(r => { if (byGroup[r.group]) byGroup[r.group].scans++; });
  const groupArray = Object.values(byGroup);

  // Justification status distribution
  const statusDist = [
    { name: "معلقة", value: justifications.filter(j => j.status === "pending").length },
    { name: "مقبولة من الأستاذ", value: justifications.filter(j => j.status === "accepted").length },
    { name: "مرفوضة من الأستاذ", value: justifications.filter(j => j.status === "rejected").length },
  ].filter(d => d.value > 0);

  // Justifications by module
  const moduleMap = {};
  justifications.forEach(j => { moduleMap[j.module] = (moduleMap[j.module]||0) + 1; });
  const moduleJustifications = Object.entries(moduleMap).map(([name, count]) => ({ name, count }));

  const totalScans = scans.length;
  const totalJustifications = justifications.length;
  const adminAccepted = justifications.filter(j => j.adminStatus === "accepted").length;
  const attendanceRate = students.length > 0 ? Math.round((scans.length / Math.max(1, students.length)) * 10) : 0;

  const handleExport = () => {
    const wb = XLSX.utils.book_new();

    const summaryData = [
      ["المقياس", "القيمة"],
      ["إجمالي عمليات مسح QR", totalScans],
      ["إجمالي التبريرات", totalJustifications],
      ["تبريرات قبلتها الإدارة", adminAccepted],
      ["إجمالي الطلاب", students.length],
      ["عدد المجموعات", [...new Set(students.map(s => s.group))].length],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryData), "ملخص");

    const studentData = [
      ["الاسم", "رقم الطالب", "المجموعة", "البريد", "عمليات المسح"],
      ...students.map(s => [s.name, s.studentId, s.group, s.email, scans.filter(r=>r.studentId===s.studentId).length]),
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(studentData), "الطلاب");

    const teacherData = [
      ["الاسم", "البريد", "المواد", "المجموعات"],
      ...USERS.teacher.map(t => [t.name, t.email, (t.modules||[]).join(", "), (t.groups||[]).join(", ")]),
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(teacherData), "الأساتذة");

    const moduleData = [
      ["الاسم", "الرمز", "الاعتمادات", "الأستاذ"],
      ...MODULES.map(m => [m.name, m.id, m.credits, m.teacher]),
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(moduleData), "المواد");

    const scanData = [
      ["الطالب", "رقم الطالب", "المادة", "المجموعة", "الوقت", "تاريخ المسح"],
      ...scans.map(r => [r.studentName, r.studentId, r.module, r.group, r.time, new Date(r.scannedAt).toLocaleString("ar-EG")]),
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(scanData), "سجل الحضور");

    const justifData = [
      ["الطالب", "رقم الطالب", "المادة", "التاريخ", "السبب", "قرار الأستاذ", "أُرسل للإدارة", "قرار الإدارة"],
      ...justifications.map(j => [j.studentName, j.studentId, j.module, j.date, j.reason, j.status, j.teacherSentToAdmin ? "نعم" : "لا", j.adminStatus || "—"]),
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(justifData), "التبريرات");

    XLSX.writeFile(wb, "تقرير_الحضور_والغياب.xlsx");
  };

  return (
    <div>
      <div className="page-header">
        <div><h2>التقارير والإحصائيات</h2><p>تقارير شاملة مبنية على بيانات الحضور الفعلية</p></div>
        <button className="btn btn-primary" onClick={handleExport}>تصدير التقرير</button>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card"><div className="stat-icon blue"/><div><div className="stat-value">{totalScans}</div><div className="stat-label">عمليات مسح QR</div></div></div>
        <div className="stat-card"><div className="stat-icon green"/><div><div className="stat-value">{adminAccepted}</div><div className="stat-label">تبريرات مقبولة نهائياً</div></div></div>
        <div className="stat-card"><div className="stat-icon red"/><div><div className="stat-value">{totalJustifications}</div><div className="stat-label">إجمالي التبريرات</div></div></div>
        <div className="stat-card"><div className="stat-icon orange"/><div><div className="stat-value">{students.length}</div><div className="stat-label">إجمالي الطلاب</div></div></div>
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-header"><div className="card-title">عمليات مسح QR حسب المجموعة</div></div>
          {groupArray.length === 0 || totalScans === 0 ? (
            <div className="empty-state" style={{padding:24}}><p>لا توجد بيانات بعد</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={groupArray}>
                <XAxis dataKey="group" tick={{ fontFamily: "inherit", fontSize: 13 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false}/>
                <Tooltip contentStyle={{ borderRadius: 8, fontFamily: "inherit" }} />
                <Legend />
                <Bar dataKey="scans" name="عمليات مسح" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="students" name="الطلاب" fill="#4F6AF0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">توزيع حالات التبريرات</div></div>
          {statusDist.length === 0 ? (
            <div className="empty-state" style={{padding:24}}><p>لا توجد تبريرات بعد</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                  {statusDist.map((_, i) => <Cell key={i} fill={["#F59E0B","#10B981","#EF4444"][i % 3]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, fontFamily: "inherit" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header"><div className="card-title">التبريرات حسب المادة</div></div>
        {moduleJustifications.length === 0 ? (
          <div className="empty-state" style={{padding:24}}><p>لا توجد تبريرات بعد</p></div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={moduleJustifications} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false}/>
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fontFamily: "inherit" }} width={150} />
              <Tooltip contentStyle={{ borderRadius: 8, fontFamily: "inherit" }} />
              <Bar dataKey="count" name="عدد التبريرات" radius={[0, 4, 4, 0]}>
                {moduleJustifications.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
