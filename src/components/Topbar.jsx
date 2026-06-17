import { Bell, Menu } from "lucide-react";
import { useStore } from "../useStore";

export default function Topbar({ title, subtitle, onNotifClick, onMenuClick }) {
  const state = useStore();
  const unread = (state.adminNotifications || []).filter(n => !n.read).length;

  return (
    <div className="topbar">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button className="hamburger-btn" onClick={onMenuClick} title="القائمة">
          <Menu size={20} />
        </button>
        <div className="topbar-title">
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      <div className="topbar-actions">
        <button className="icon-btn" onClick={onNotifClick} title="الإشعارات" style={{ position: "relative" }}>
          <Bell size={16} />
          {unread > 0 && (
            <span style={{
              position: "absolute", top: -4, right: -4,
              background: "var(--danger)", color: "white",
              fontSize: 10, fontWeight: 700, borderRadius: "50%",
              width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center",
            }}>{unread > 9 ? "9+" : unread}</span>
          )}
        </button>
      </div>
    </div>
  );
}