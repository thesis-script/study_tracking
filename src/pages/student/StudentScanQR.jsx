import { useState, useEffect } from "react";
import { QrCode, CheckCircle, XCircle, Scan, RefreshCw, ShieldAlert, Clock } from "lucide-react";
import { store } from "../../store";
import { useStore } from "../../useStore";

function generateQRMatrix(seed) { const size = 21, matrix = Array.from({ length: size }, () => Array(size).fill(0)); const df = (r, c) => { for (let i = 0; i < 7; i++)for (let j = 0; j < 7; j++) { const o = i === 0 || i === 6 || j === 0 || j === 6, ic = i >= 2 && i <= 4 && j >= 2 && j <= 4; if (r + i < size && c + j < size) matrix[r + i][c + j] = (o || ic) ? 1 : 0; } }; df(0, 0); df(0, size - 7); df(size - 7, 0); for (let i = 8; i < size - 8; i++) { matrix[6][i] = i % 2 === 0 ? 1 : 0; matrix[i][6] = i % 2 === 0 ? 1 : 0; } for (let i = -2; i <= 2; i++)for (let j = -2; j <= 2; j++) { const o = Math.abs(i) === 2 || Math.abs(j) === 2, ic = i === 0 && j === 0; if (14 + i >= 0 && 14 + j >= 0 && 14 + i < size && 14 + j < size) matrix[14 + i][14 + j] = (o || ic) ? 1 : 0; } let s = seed; for (let r = 0; r < size; r++)for (let c = 0; c < size; c++) { const inTL = r < 8 && c < 8, inTR = r < 8 && c >= size - 8, inBL = r >= size - 8 && c < 8, isTim = r === 6 || c === 6, isAl = r >= 12 && r <= 16 && c >= 12 && c <= 16; if (!inTL && !inTR && !inBL && !isTim && !isAl) { s = (s * 1664525 + 1013904223) & 0xffffffff; matrix[r][c] = (s >>> 0) % 3 === 0 ? 1 : 0; } } return matrix; }
function QRSvg({ data, size = 190 }) { const seed = data.split("").reduce((a, c) => a + c.charCodeAt(0), 0); const m = generateQRMatrix(seed); const cell = size / m.length; return (<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}><rect width={size} height={size} fill="white" />{m.map((row, r) => row.map((v, c) => v ? <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell} fill="#0A2E6D" /> : null))}</svg>); }

export default function StudentScanQR({ user, student }) {
  const state = useStore();
  const [scanState, setScanState] = useState("idle"); // idle | scanning | success | error
  const [result, setResult] = useState(null);
  const [errMsg, setErrMsg] = useState("");
  const [tick, setTick] = useState(0);

  // Tick every second to update countdown
  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const availableQRs = store.getQRForStudent(user.studentId);
  const myScans = state.attendanceRecords.filter(r => r.studentId === user.studentId);

  const handleScan = (qrId) => {
    if (!store.isRegisteredStudent(user.studentId)) {
      setScanState("error"); setErrMsg("أنت غير مسجل في النظام"); return;
    }
    if (!qrId) {
      setScanState("error"); setErrMsg("لا يوجد رمز QR نشط. انتظر حتى يشارك الأستاذ الرمز."); return;
    }
    setScanState("scanning");
    setTimeout(() => {
      const res = store.recordScan(qrId, student || { studentId: user.studentId, name: user.name || user.email, group: user.group });
      if (res.error === "duplicate") {
        setScanState("error"); setErrMsg("سجّلت حضورك مسبقاً في هذه الحصة."); return;
      }
      if (res.error) {
        setScanState("error"); setErrMsg(res.error); return;
      }
      setResult(res.record);
      setScanState("success");
    }, 1200);
  };
  const reset = () => { setScanState("idle"); setResult(null); setErrMsg(""); };

  const activeQR = availableQRs[0];

  return (
    <div style={{ maxWidth: 440, margin: "0 auto", padding: "0 4px", paddingBottom: 80 }}>
      {/* Security notice */}
      <div style={{ background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: "var(--radius)", padding: "10px 14px", marginBottom: 14, display: "flex", gap: 8, alignItems: "center" }}>
        <ShieldAlert size={14} color="#C2410C" />
        <span style={{ fontSize: 12, color: "#9A3412" }}>الرمز حصري لك — ممنوع المشاركة مع الآخرين</span>
      </div>

      {scanState === "idle" && (
        <div>
          {availableQRs.length > 0 ? (
            <div className="student-scan-card">
              <div style={{ textAlign: "center", marginBottom: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>الحصص المتاحة للمسح</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 3 }}>اختر الحصة لتسجيل حضورك</div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
                {availableQRs.map(qr => {
                  const secsLeft = Math.max(0, Math.floor((qr.expiresAt - Date.now()) / 1000));
                  return (
                    <div key={qr.id} onClick={() => handleScan(qr.id)}
                      style={{
                        cursor: "pointer", borderRadius: "var(--radius)", border: "2px solid var(--primary)",
                        padding: "14px", background: "var(--primary-light)",
                        display: "flex", alignItems: "center", gap: 12,
                      }}>
                      <div className="no-screenshot" style={{ flexShrink: 0 }}>
                        <QRSvg data={qr.id} size={64} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{qr.module}</div>
                        <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{qr.group} · {qr.teacher}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}>
                          <Clock size={12} color="var(--danger)" />
                          <span style={{ fontSize: 11, color: "var(--danger)", fontWeight: 700 }}>{secsLeft} ثانية متبقية</span>
                        </div>
                      </div>
                      <Scan size={22} color="var(--primary)" />
                    </div>
                  );
                })}
              </div>

              <div style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center" }}>
                انقر على الحصة لمحاكاة المسح وتسجيل حضورك فيها
              </div>
            </div>
          ) : (
            <div className="student-scan-card">
              <div className="student-scan-viewfinder">
                <div className="student-scan-corners">
                  <span className="corner tl" /><span className="corner tr" />
                  <span className="corner bl" /><span className="corner br" />
                </div>
                <div className="student-scan-icon-wrapper"><QrCode size={52} color="var(--primary)" style={{ opacity: 0.5 }} /></div>
                <div className="student-scan-label">في انتظار رمز QR من الأستاذ...</div>
              </div>
              <div style={{ marginTop: 10, fontSize: 12, color: "var(--text-secondary)", textAlign: "center" }}>
                سيظهر الرمز هنا تلقائياً بمجرد أن يشاركه الأستاذ
              </div>
            </div>
          )}

          {/* History block stays exactly as before, unchanged */}
          {myScans.length > 0 && (
            <div className="student-card" style={{ marginTop: 14 }}>
              <div className="card-header"><div className="card-title">✅ حضوري المسجَّل</div></div>
              {myScans.slice(-5).reverse().map((r, i) => (
                <div key={i} className="student-attendance-row">
                  <div className="student-attendance-icon" style={{ background: "var(--accent-light)", color: "var(--accent)" }}><CheckCircle size={14} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{r.module}</div>
                    <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{r.group} · {r.time} · {r.room}</div>
                  </div>
                  <span className="badge badge-success">مسجَّل ✓</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {scanState === "scanning" && (
        <div className="student-scan-card">
          <div className="student-scan-viewfinder scanning">
            <div className="scan-line" />
            <div className="student-scan-corners">
              <span className="corner tl active" /><span className="corner tr active" />
              <span className="corner bl active" /><span className="corner br active" />
            </div>
            <div className="student-scan-icon-wrapper"><Scan size={52} color="var(--primary)" style={{ animation: "pulse 1s infinite" }} /></div>
          </div>
          <div style={{ textAlign: "center", marginTop: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: "var(--primary)" }}>جارٍ التحقق...</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 6 }}>التحقق من هويتك وصلاحية الرمز</div>
          </div>
        </div>
      )}

      {scanState === "success" && result && (
        <div className="student-success-card">
          <div className="student-success-icon"><CheckCircle size={48} color="white" /></div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>تم تسجيل حضورك! 🎉</h2>
          <p style={{ fontSize: 13, opacity: 0.85, marginBottom: 20 }}>ظهر حضورك فورياً في لوحة الأستاذ</p>
          <div className="student-success-details">
            {[["الحصة", result.module], ["المجموعة", result.group], ["الوقت", result.time], ["القاعة", result.room], ["الأستاذ", result.teacher]].map(([k, v]) => (
              <div key={k} className="student-success-row"><span>{k}</span><strong>{v}</strong></div>
            ))}
          </div>
          <button className="student-scan-btn outlined" onClick={reset} style={{ marginTop: 20 }}>
            <RefreshCw size={16} /> <span>مسح رمز آخر</span>
          </button>
        </div>
      )}

      {scanState === "error" && (
        <div className="student-error-card">
          <XCircle size={48} color="#EF4444" />
          <h2 style={{ fontSize: 20, fontWeight: 800, marginTop: 14, color: "var(--danger)" }}>تعذّر تسجيل الحضور</h2>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 8, textAlign: "center" }}>{errMsg}</p>
          <button className="student-scan-btn" onClick={reset} style={{ marginTop: 20 }}><RefreshCw size={16} /> <span>حاول مجدداً</span></button>
        </div>
      )}
    </div>
  );
}
