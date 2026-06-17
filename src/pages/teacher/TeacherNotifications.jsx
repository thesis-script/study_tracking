import { Bell, BellOff, CheckCheck, FileText, Info } from "lucide-react";
import { store } from "../../store";
import { useStore } from "../../useStore";

const typeCfg = {
    justification: { Icon: FileText, color: "var(--warning)", bg: "#FFF7ED", label: "تبرير غياب" },
    info: { Icon: Info, color: "var(--primary)", bg: "var(--primary-light)", label: "معلومة" },
};

function ago(ts) {
    const s = (Date.now() - ts) / 1000;
    if (s < 60) return "الآن";
    if (s < 3600) return `منذ ${Math.floor(s / 60)} دقيقة`;
    if (s < 86400) return `منذ ${Math.floor(s / 3600)} ساعة`;
    return `منذ ${Math.floor(s / 86400)} يوم`;
}

export default function TeacherNotifications({ onNavigate }) {
    const state = useStore();
    const notifs = state.teacherNotifications;
    const unread = notifs.filter(n => !n.read).length;

    return (
        <div>
            <div className="page-header">
                <div><h2>الإشعارات</h2><p>رسائل وتبريرات واردة من الطلاب</p></div>
                {unread > 0 && (
                    <button className="btn btn-secondary" onClick={() => notifs.forEach(n => store.markTeacherNotifRead(n.id))}
                        style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <CheckCheck size={14} /> تحديد الكل كمقروء
                    </button>
                )}
            </div>

            {unread > 0 && (
                <div style={{ background: "var(--primary-light)", border: "1px solid var(--primary)", borderRadius: "var(--radius)", padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                    <Bell size={16} color="var(--primary)" />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)" }}>{unread} إشعار غير مقروء</span>
                </div>
            )}

            <div className="card">
                <div className="card-header"><div className="card-title">سجل الإشعارات</div></div>
                {notifs.length === 0 ? (
                    <div className="empty-state"><BellOff size={40} /><h3>لا توجد إشعارات</h3><p>ستظهر هنا تبريرات الطلاب الجديدة</p></div>
                ) : notifs.map((n, i) => {
                    const cfg = typeCfg[n.type] || typeCfg.info;
                    const Icon = cfg.Icon;
                    return (
                        <div key={n.id}
                            onClick={() => { store.markTeacherNotifRead(n.id); onNavigate?.("justifications"); }}
                            style={{
                                display: "flex", gap: 14, padding: "16px 0",
                                borderBottom: i < notifs.length - 1 ? "1px solid var(--border)" : "none",
                                cursor: "pointer", opacity: n.read ? 0.65 : 1, transition: "opacity 0.2s",
                            }}>
                            <div style={{ width: 40, height: 40, borderRadius: "50%", background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <Icon size={18} color={cfg.color} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 4 }}>
                                    <div style={{ fontWeight: n.read ? 500 : 700, fontSize: 14 }}>{n.title}</div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{ago(n.createdAt)}</span>
                                        {!n.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--primary)" }} />}
                                    </div>
                                </div>
                                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 6 }}>{n.body}</div>
                                <span style={{ fontSize: 11, color: cfg.color, background: cfg.bg, padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>{cfg.label}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}