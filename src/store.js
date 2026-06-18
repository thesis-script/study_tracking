/**
 * UNIFIED STORE — single source of truth for all portals
 * Persisted to localStorage for 24h. No backend, no mock data.
 * All real-time communication between student ↔ teacher ↔ admin
 * happens through this shared JS module (same browser tab session).
 */

const LS_KEY = "qr_attendance_v3";
const TTL = 24 * 60 * 60 * 1000;

// ─── Registered users (static, replaces mockData) ───────────────────────────
export const USERS = {
  admin: [
    { email: "admin@univ.dz", password: "admin", name: "مدير القسم", role: "admin" },
  ],
  teacher: [
    {
      email: "teacher@univ.dz", password: "1234", name: "الاستاذ نور الدين مزياني", role: "teacher",
      modules: ["محاسبة مالية متقدمة", "تدقيق داخلي وخارجي"], groups: ["G1", "G2"]
    },
  ],
  student: [
    { email: "2024001@student.univ.dz", password: "1234", studentId: "2024001", name: "رمضان سبين شمس الأصيل", group: "G1", role: "student" },
    { email: "2024002@student.univ.dz", password: "1234", studentId: "2024002", name: "بوعيطة فاطمة الزهراء", group: "G1", role: "student" },
    { email: "2024003@student.univ.dz", password: "1234", studentId: "2024003", name: "ضابي سلسبيل نور", group: "G1", role: "student" },
    { email: "2024004@student.univ.dz", password: "1234", studentId: "2024004", name: "جودي شيماء آيت", group: "G1", role: "student" },
    { email: "2024005@student.univ.dz", password: "1234", studentId: "2024005", name: "يوسف كريمي أمين", group: "G2", role: "student" },
    { email: "2024006@student.univ.dz", password: "1234", studentId: "2024006", name: "نور الإيمان الحجام", group: "G2", role: "student" },
    { email: "2024007@student.univ.dz", password: "1234", studentId: "2024007", name: "زينب عماري فؤاد", group: "G2", role: "student" },
    { email: "2024008@student.univ.dz", password: "1234", studentId: "2024008", name: "مريم بن ياسين", group: "G2", role: "student" },
    { email: "2024009@student.univ.dz", password: "1234", studentId: "2024009", name: "خديجة الشاوي", group: "G3", role: "student" },
    { email: "2024010@student.univ.dz", password: "1234", studentId: "2024010", name: "أمين بوشوشة", group: "G3", role: "student" },
  ],
};

export const MODULES = [
  { id: "AUD401", name: "محاسبة مالية متقدمة", teacher: "الاستاذ نور الدين مزياني", credits: 4 },
  { id: "AUD402", name: "تدقيق داخلي وخارجي", teacher: "الاستاذ نور الدين مزياني", credits: 4 },
  { id: "ACC403", name: "محاسبة ضريبية", teacher: "الاستاذة نورة بن زيدان", credits: 3 },
  { id: "MIS404", name: "نظم معلومات محاسبية", teacher: "الاستاذة سمية بلقاسم", credits: 3 },
  { id: "AUD405", name: "أخلاقيات مهن المحاسبة", teacher: "الاستاذ اياد فالح", credits: 3 },
];

export const SCHEDULE = [
  { id: 1, day: "الأحد", module: "محاسبة مالية متقدمة", group: "G1", time: "08:00 - 09:30", room: "Q101", type: "Cours" },
  { id: 2, day: "الأحد", module: "تدقيق داخلي وخارجي", group: "G2", time: "10:00 - 11:30", room: "Q102", type: "TD" },
  { id: 3, day: "الإثنين", module: "محاسبة مالية متقدمة", group: "G1", time: "10:00 - 11:30", room: "Q101", type: "TP" },
  { id: 4, day: "الثلاثاء", module: "تدقيق داخلي وخارجي", group: "G2", time: "13:00 - 14:30", room: "Q102", type: "TP" },
  { id: 5, day: "الأربعاء", module: "محاسبة مالية متقدمة", group: "G1", time: "08:00 - 09:30", room: "Q105", type: "Cours" },
  { id: 6, day: "الخميس", module: "تدقيق داخلي وخارجي", group: "G2", time: "10:00 - 11:30", room: "Labo2", type: "TD" },
];

// ─── Persistence ─────────────────────────────────────────────────────────────
function persist(data) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ data, ts: Date.now() }));
  } catch (_) { }
}

function hydrate() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > TTL) { localStorage.removeItem(LS_KEY); return null; }
    return data;
  } catch (_) { return null; }
}

// ─── Default empty state ──────────────────────────────────────────────────────
const EMPTY = {
  /**
   * QR sessions created by teacher
   * { id, module, group, time, room, teacher, createdAt, expiresAt, active, sharedAt }
   */
  qrSessions: [],

  /**
   * Attendance records when student scans QR
   * { id, qrId, studentId, studentName, group, module, time, room, teacher, scannedAt }
   */
  attendanceRecords: [],

  /**
   * Justifications flow: student → teacher → admin
   * { id, studentId, studentName, group, module, date, reason, fileName,
   *   status: "pending"|"accepted"|"rejected",
   *   teacherSentToAdmin: bool,
   *   adminStatus: "pending"|"accepted"|"rejected"|null,
   *   createdAt, updatedAt }
   */
  justifications: [],

  /**
   * Admin notifications (from teacher actions)
   * { id, type, from, title, body, createdAt, read }
   */
  adminNotifications: [],

  /**
   * Teacher notifications (from student actions)
   * { id, type, from, title, body, createdAt, read }
   */
  teacherNotifications: [],

  /**
   * Student notifications (from teacher decisions)
   * { id, studentId, type, title, body, createdAt, read }
   */
  studentNotifications: [],
};

const saved = hydrate();
let state = { ...EMPTY, ...(saved || {}) };
for (const key of Object.keys(EMPTY)) {
  if (!Array.isArray(state[key]) && Array.isArray(EMPTY[key])) {
    state[key] = EMPTY[key];
  }
}

const listeners = new Set();
function notify() {
  persist(state);
  listeners.forEach(fn => fn({ ...state }));
}

// ─── Store API ────────────────────────────────────────────────────────────────
export const store = {
  getState: () => ({ ...state }),

  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  // ── Auth ──────────────────────────────────────────────────────────────────
  login(email, password) {
    for (const role of ["admin", "teacher", "student"]) {
      const u = USERS[role].find(u => u.email === email && u.password === password);
      if (u) return { ...u };
    }
    return null;
  },

  getStudent(studentId) {
    return USERS.student.find(s => s.studentId === studentId) || null;
  },

  isRegisteredStudent(studentId) {
    return USERS.student.some(s => s.studentId === studentId);
  },

  getAllStudents() { return USERS.student; },
  getModules() { return MODULES; },
  getSchedule() { return SCHEDULE; },

  // ── QR Sessions ───────────────────────────────────────────────────────────
  createQRSession({ module, group, time, room, teacher, durationMinutes = 2 }) {
    const qr = {
      id: `QR_${Date.now()}`,
      module, group, time,
      room: room || "—",
      teacher: teacher || "الأستاذ",
      createdAt: Date.now(),
      expiresAt: Date.now() + durationMinutes * 60 * 1000,
      active: true,
      shared: false,
    };
    state = { ...state, qrSessions: [qr, ...state.qrSessions] };
    notify();
    return qr;
  },

  toggleQR(qrId) {
    state = {
      ...state,
      qrSessions: state.qrSessions.map(q =>
        q.id === qrId ? { ...q, active: !q.active } : q
      ),
    };
    notify();
  },

  expireQR(qrId) {
    state = {
      ...state,
      qrSessions: state.qrSessions.map(q =>
        q.id === qrId ? { ...q, active: false, expiresAt: 0 } : q
      ),
    };
    notify();
  },

  shareQR(qrId) {
    state = {
      ...state,
      qrSessions: state.qrSessions.map(q =>
        q.id === qrId ? { ...q, shared: true } : q
      ),
    };
    notify();
  },

  /** Returns QR sessions visible to a student: active, not expired, shared */
  getQRForStudent(studentId) {
    if (!this.isRegisteredStudent(studentId)) return [];
    return state.qrSessions.filter(q => q.shared && q.active && q.expiresAt > Date.now());
  },

  // ── Attendance ─────────────────────────────────────────────────────────────
  recordScan(qrId, student) {
    const qr = state.qrSessions.find(q => q.id === qrId);
    if (!qr) return { error: "QR غير موجود" };
    if (!qr.active || qr.expiresAt <= Date.now()) return { error: "انتهت صلاحية الرمز" };
    if (!this.isRegisteredStudent(student.studentId)) return { error: "الطالب غير مسجل" };
    const dup = state.attendanceRecords.some(r => r.qrId === qrId && r.studentId === student.studentId);
    if (dup) return { error: "duplicate" };

    const record = {
      id: `ATT_${Date.now()}`,
      qrId,
      studentId: student.studentId,
      studentName: student.name,
      group: student.group,
      module: qr.module,
      group: qr.group,
      time: qr.time,
      room: qr.room,
      teacher: qr.teacher,
      scannedAt: new Date().toISOString(),
    };
    state = { ...state, attendanceRecords: [...state.attendanceRecords, record] };
    notify();
    return { record };
  },

  getAttendanceForQR(qrId) {
    return state.attendanceRecords.filter(r => r.qrId === qrId);
  },

  getAttendanceForStudent(studentId) {
    return state.attendanceRecords.filter(r => r.studentId === studentId);
  },

  // ── Justifications ────────────────────────────────────────────────────────
  /** Student submits a new justification → appears in teacher panel */
 submitJustification({ studentId, studentName, group, module, startDate, endDate, reason, fileName }) {
  const j = {
    id: `JUS_${Date.now()}`,
    studentId, studentName, group,
    module, startDate, endDate: endDate || startDate, reason,
    fileName: fileName || null,
    status: "pending",
    teacherSentToAdmin: false,
    adminStatus: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  state = { ...state, justifications: [j, ...state.justifications] };

  // Notify teacher
  const rangeLabel = j.startDate === j.endDate ? j.startDate : `${j.startDate} → ${j.endDate}`;
  state = {
    ...state,
    teacherNotifications: [{
      id: `TN_${Date.now()}`,
      type: "justification",
      from: studentName,
      studentId,
      justificationId: j.id,
      title: "تبرير غياب جديد",
      body: `${studentName} · ${module} · ${rangeLabel}`,
      createdAt: Date.now(),
      read: false,
    }, ...state.teacherNotifications],
  };
  notify();
  return j;
},

  /** Teacher accepts or rejects → student gets notified */
  teacherDecideJustification(id, decision) {
    const j = state.justifications.find(j => j.id === id);
    if (!j) return;
    state = {
      ...state,
      justifications: state.justifications.map(jj =>
        jj.id === id ? { ...jj, status: decision, updatedAt: Date.now() } : jj
      ),
    };
    // Notify student
    const label = decision === "accepted" ? "مقبول ✅" : "مرفوض ❌";
    state = {
      ...state,
      studentNotifications: [{
        id: `SN_${Date.now()}`,
        studentId: j.studentId,
        type: decision,
        justificationId: id,
        title: `تبرير غيابك ${label}`,
        body: `${j.module} · ${j.date} — قرار الأستاذ: ${label}`,
        createdAt: Date.now(),
        read: false,
      }, ...state.studentNotifications],
    };
    notify();
  },

  /** Teacher sends accepted justification to admin */
  sendJustificationToAdmin(id) {
    const j = state.justifications.find(j => j.id === id);
    if (!j || j.status !== "accepted") return;
    state = {
      ...state,
      justifications: state.justifications.map(jj =>
        jj.id === id ? { ...jj, teacherSentToAdmin: true, adminStatus: "pending", updatedAt: Date.now() } : jj
      ),
    };
    // Notify admin
    state = {
      ...state,
      adminNotifications: [{
        id: `AN_${Date.now()}`,
        type: "justification",
        from: j.studentName,
        justificationId: id,
        title: "تبرير غياب مُحال من الأستاذ",
        body: `${j.studentName} · ${j.module} · ${j.date}`,
        createdAt: Date.now(),
        read: false,
      }, ...state.adminNotifications],
    };
    notify();
  },

  /** Admin final decision on justification */
  adminDecideJustification(id, decision) {
    const j = state.justifications.find(j => j.id === id);
    if (!j) return;
    state = {
      ...state,
      justifications: state.justifications.map(jj =>
        jj.id === id ? { ...jj, adminStatus: decision, updatedAt: Date.now() } : jj
      ),
    };
    // Notify student of final result
    const label = decision === "accepted" ? "مقبول نهائياً ✅" : "مرفوض من الإدارة ❌";
    state = {
      ...state,
      studentNotifications: [{
        id: `SN_${Date.now()}`,
        studentId: j.studentId,
        type: "admin_" + decision,
        justificationId: id,
        title: `قرار الإدارة: ${label}`,
        body: `${j.module} · ${j.date}`,
        createdAt: Date.now(),
        read: false,
      }, ...state.studentNotifications],
    };
    notify();
  },

  // ── Notifications ─────────────────────────────────────────────────────────
  getAdminNotifications() { return state.adminNotifications; },
  getTeacherNotifications() { return state.teacherNotifications; },
  getStudentNotifications(studentId) {
    return state.studentNotifications.filter(n => n.studentId === studentId);
  },

  markAdminNotifRead(id) {
    state = { ...state, adminNotifications: state.adminNotifications.map(n => n.id === id ? { ...n, read: true } : n) };
    notify();
  },
  markAllAdminNotifsRead() {
    state = { ...state, adminNotifications: state.adminNotifications.map(n => ({ ...n, read: true })) };
    notify();
  },
  markTeacherNotifRead(id) {
    state = { ...state, teacherNotifications: state.teacherNotifications.map(n => n.id === id ? { ...n, read: true } : n) };
    notify();
  },
  markStudentNotifRead(id) {
    state = { ...state, studentNotifications: state.studentNotifications.map(n => n.id === id ? { ...n, read: true } : n) };
    notify();
  },

  // ── Utilities ─────────────────────────────────────────────────────────────
  clearAll() {
    state = { ...EMPTY };
    localStorage.removeItem(LS_KEY);
    notify();
  },
};
