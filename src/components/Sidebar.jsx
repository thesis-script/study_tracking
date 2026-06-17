import { LogOut, X } from "lucide-react";

export default function Sidebar({ navItems, activeSection, onNavigate, onLogout, user, mobileOpen, onCloseMobile }) {
  const handleNavigate = (id) => {
    onNavigate(id);
    onCloseMobile?.();
  };

  return (
    <>
      {mobileOpen && <div className="sidebar-backdrop" onClick={onCloseMobile} />}
      <div className={`sidebar ${mobileOpen ? "sidebar-mobile-open" : ""}`}
        style={{color: 'white', background: 'linear-gradient(135deg, #1A1D2E 0%, #2D2F4A 50%, #1A1D2E 100%)'}}>

        <button className="sidebar-mobile-close" onClick={onCloseMobile}>
          <X size={20} />
        </button>

        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <img src="/logo-full.png" alt="Logo" style={{ width: 50, height: 50, borderRadius: '20%' }} />
          </div>
          <div style={{textAlign: 'center', marginTop: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <h2>Students Attendance Tracking</h2>
            <p>QR Attendance</p>
          </div>
        </div>

        <nav className="sidebar-nav" style={{color: 'white', background: 'linear-gradient(135deg, #1A1D2E 0%, #2D2F4A 50%, #1A1D2E 100%)'}}>
          {navItems.map((section, si) => (
            <div key={si}>
              {section.label && (
                <div className="nav-section-label">{section.label}</div>
              )}
              {section.items.map((item) => (
                <button
                  key={item.id}
                  className={`nav-item ${activeSection === item.id ? "active" : ""}`}
                  onClick={() => handleNavigate(item.id)}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                  {item.badge ? <span className="nav-item-badge">{item.badge}</span> : null}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="user-avatar">
            {user.name.charAt(0)}
          </div>
          <div className="user-info">
            <strong>{user.name}</strong>
            <span>{user.role}</span>
          </div>
          <button className="logout-btn" onClick={onLogout} title="تسجيل الخروج">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </>
  );
}