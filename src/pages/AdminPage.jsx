import { useEffect, useState } from "react";
import { notifyError, notifySuccess } from "../utils/notify";

const rawApiUrl = import.meta.env.VITE_API_URL;
const API = rawApiUrl
  ? rawApiUrl.endsWith("/api/v1") ? rawApiUrl : `${rawApiUrl}/api/v1`
  : "http://localhost:1201/api/v1";

const DEFAULT_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || "admin@learnext.local";
const TABS = ["Giao dich", "Giang vien", "Khoa hoc", "Ho tro"];

const statusLabel = {
  PENDING_PAYMENT: { label: "Cho thanh toan", bg: "#fef9c3", color: "#854d0e" },
  PROOF_SUBMITTED: { label: "Da nop bien lai", bg: "#dbeafe", color: "#1d4ed8" },
  PAID:            { label: "Da thanh toan",  bg: "#dcfce7", color: "#166534" },
  REJECTED:        { label: "Tu choi",         bg: "#fee2e2", color: "#991b1b" },
  PENDING:         { label: "Cho duyet",       bg: "#fef9c3", color: "#854d0e" },
  APPROVED:        { label: "Da duyet",        bg: "#dcfce7", color: "#166534" },
  PENDING_APPROVAL:{ label: "Cho duyet",       bg: "#fef9c3", color: "#854d0e" },
  PUBLISHED:       { label: "Da dang",         bg: "#dcfce7", color: "#166534" },
  DRAFT:           { label: "Nhap",            bg: "#f3f4f6", color: "#374151" },
  OPEN:            { label: "Chua xu ly",      bg: "#fef9c3", color: "#854d0e" },
  CLOSED:          { label: "Da xu ly",        bg: "#dcfce7", color: "#166534" },
  ACTIVE:          { label: "Hoat dong",       bg: "#dcfce7", color: "#166534" },
  BLOCKED:         { label: "Da khoa",         bg: "#fee2e2", color: "#991b1b" },
};

const Badge = ({ status }) => {
  const s = statusLabel[status] || { label: status, bg: "#f3f4f6", color: "#374151" };
  return (
    <span style={{ background: s.bg, color: s.color, padding: "2px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600 }}>
      {s.label}
    </span>
  );
};

const Card = ({ children, style }) => (
  <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 16, marginBottom: 10, background: "#fff", ...style }}>
    {children}
  </div>
);

const Btn = ({ children, onClick, color = "#2563eb", disabled, small }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      background: disabled ? "#d1d5db" : color,
      color: "#fff", border: "none", borderRadius: 5,
      padding: small ? "5px 12px" : "8px 16px",
      cursor: disabled ? "not-allowed" : "pointer",
      fontSize: small ? 12 : 13, fontWeight: 600, marginRight: 6,
    }}
  >
    {children}
  </button>
);

const StatCard = ({ label, value, color = "#2563eb" }) => (
  <div style={{ flex: 1, minWidth: 140, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "18px 20px", textAlign: "center" }}>
    <div style={{ fontSize: 26, fontWeight: 800, color }}>{value}</div>
    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>{label}</div>
  </div>
);

const AdminPage = () => {
  const [adminKey, setAdminKey]       = useState(localStorage.getItem("admin-key") || "");
  const [email, setEmail]             = useState(localStorage.getItem("admin-email") || DEFAULT_EMAIL);
  const [password, setPassword]       = useState("");
  const [loggedIn, setLoggedIn]       = useState(!!localStorage.getItem("admin-key"));
  const [tab, setTab]                 = useState(0);
  const [loading, setLoading]         = useState(false);

  // data
  const [stats, setStats]             = useState(null);
  const [applications, setApplications] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [courses, setCourses]         = useState([]);
  const [supportLeads, setSupportLeads] = useState([]);

  const authFetch = async (url, options = {}) => {
    const key = localStorage.getItem("admin-key") || adminKey;
    const res = await fetch(url, {
      ...options,
      headers: { "X-Admin-Key": key, ...(options.headers || {}) },
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || json.error?.message || "Thao tac that bai");
    return json.data;
  };

  const loginAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || json.error?.message || "Sai email hoac mat khau");
      }
      const key = json.data?.adminKey || json.data;
      localStorage.setItem("admin-email", email);
      localStorage.setItem("admin-key", key);
      setAdminKey(key);
      setLoggedIn(true);
      notifySuccess("Dang nhap admin thanh cong.");
      await load(key);
    } catch (err) {
      notifyError(err.message || "Khong the dang nhap admin");
    } finally {
      setLoading(false);
    }
  };

  const load = async (key = adminKey) => {
    const h = { "X-Admin-Key": key };
    setLoading(true);
    try {
      const [statsRes, appsRes, instructorsRes, coursesRes, supportRes] = await Promise.all([
        fetch(`${API}/admin/stats`,          { headers: h }),
        fetch(`${API}/instructor-applications/admin`, { headers: h }),
        fetch(`${API}/admin/instructors`,    { headers: h }),
        fetch(`${API}/admin/courses`,        { headers: h }),
        fetch(`${API}/admin/support/leads`,  { headers: h }),
      ]);

      if (appsRes.status === 400 || appsRes.status === 401 || appsRes.status === 403) {
        const errJson = await appsRes.json().catch(() => ({}));
        notifyError(errJson.message || "Admin key khong hop le. Vui long dang nhap lai.");
        setLoggedIn(false);
        return;
      }

      const safeJson = (res) => res.json().catch(() => ({}));
      const [statsJson, appsJson, instructorsJson, coursesJson, supportJson] = await Promise.all([
        safeJson(statsRes), safeJson(appsRes), safeJson(instructorsRes), safeJson(coursesRes), safeJson(supportRes),
      ]);

      setStats(statsJson.data || null);
      setApplications(appsJson.data || []);
      setInstructors(instructorsJson.data || []);
      setCourses(coursesJson.data || []);
      setSupportLeads(supportJson.data || []);
    } catch {
      notifyError("Khong ket noi duoc toi server admin");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("admin-key");
    localStorage.removeItem("admin-email");
    setAdminKey("");
    setLoggedIn(false);
    setStats(null);
    setApplications([]);
    setInstructors([]);
    setCourses([]);
    setSupportLeads([]);
  };

  useEffect(() => {
    if (adminKey) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const patch = async (url, message) => {
    try {
      await authFetch(url, { method: "PATCH" });
      notifySuccess(message);
      load();
    } catch (err) {
      notifyError(err.message || "Thao tac that bai");
    }
  };

  /* ── Login screen ── */
  if (!loggedIn) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb" }}>
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 36, width: "100%", maxWidth: 400 }}>
          <h2 style={{ margin: "0 0 24px", textAlign: "center" }}>Quan tri LearnNext</h2>
          <form onSubmit={loginAdmin}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: 13 }}>Email admin</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="admin@learnext.local"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 14, boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: 13 }}>Mat khau</label>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 14, boxSizing: "border-box" }} />
            </div>
            <button type="submit" disabled={loading}
              style={{ width: "100%", padding: 11, background: loading ? "#d1d5db" : "#2563eb", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "Dang dang nhap..." : "Dang nhap"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ── Derived counts ── */
  const pendingApps    = applications.filter((a) => a.status === "PENDING");
  const pendingCourses = courses.filter((c) => c.status === "PENDING_APPROVAL");
  const openLeads      = supportLeads.filter((l) => l.status !== "CLOSED");
  const counts         = [0, pendingApps.length, pendingCourses.length, openLeads.length];

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      {/* ── Topbar ── */}
      <div style={{ background: "#1e293b", color: "#fff", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
        <b style={{ fontSize: 17 }}>LearnNext Admin</b>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {loading && <span style={{ fontSize: 13, color: "#94a3b8" }}>Dang tai...</span>}
          <span style={{ fontSize: 13, color: "#94a3b8" }}>{email}</span>
          <button onClick={() => load()} style={{ background: "#334155", color: "#fff", border: "none", borderRadius: 5, padding: "5px 12px", cursor: "pointer", fontSize: 12 }}>Lam moi</button>
          <button onClick={logout} style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: 5, padding: "5px 12px", cursor: "pointer", fontSize: 12 }}>Dang xuat</button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
        {/* ── Tabs ── */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "2px solid #e5e7eb" }}>
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)}
              style={{ padding: "10px 20px", border: "none", borderBottom: tab === i ? "3px solid #2563eb" : "3px solid transparent", background: "none", cursor: "pointer", fontWeight: tab === i ? 700 : 500, color: tab === i ? "#2563eb" : "#6b7280", fontSize: 14, position: "relative", top: 2 }}>
              {t}
              {counts[i] > 0 && (
                <span style={{ marginLeft: 6, background: "#ef4444", color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>
                  {counts[i]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Tab 0: Giao dich ── */}
        {tab === 0 && (
          <div>
            <h2 style={{ marginTop: 0 }}>Thong ke giao dich</h2>

            {/* Stats cards */}
            {stats && (
              <>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
                  <StatCard label="Tong giao dich" value={Object.values(stats.ordersByStatus || {}).reduce((s, v) => s + v, 0)} />
                  <StatCard label="Da thanh toan" value={stats.ordersByStatus?.PAID ?? 0} color="#16a34a" />
                  <StatCard label="Cho thanh toan" value={stats.ordersByStatus?.PENDING_PAYMENT ?? 0} color="#d97706" />
                  <StatCard label="Doanh thu (VND)" value={(Number(stats.totalRevenue || 0)).toLocaleString("vi-VN") + "đ"} color="#7c3aed" />
                </div>
              </>
            )}

            {/* Transaction list */}
            <h3 style={{ marginBottom: 12 }}>Lich su giao dich ({stats?.recentTransactions?.length ?? 0})</h3>
            {(!stats?.recentTransactions || stats.recentTransactions.length === 0) && (
              <p style={{ color: "#888" }}>Chua co giao dich nao.</p>
            )}
            {(stats?.recentTransactions || []).map((order) => (
              <Card key={order.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{order.courseTitle}</div>
                    <div style={{ fontSize: 13, color: "#6b7280" }}>
                      Ma CK: <code style={{ background: "#f0f4ff", padding: "1px 6px", borderRadius: 3 }}>{order.paymentCode}</code>
                      {" · "}
                      <b style={{ color: "#e74c3c" }}>{Number(order.amount || 0).toLocaleString()}đ</b>
                    </div>
                    {order.createdAt && (
                      <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                        {new Date(order.createdAt).toLocaleString("vi-VN")}
                      </div>
                    )}
                  </div>
                  <Badge status={order.status} />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* ── Tab 1: Giang vien ── */}
        {tab === 1 && (
          <div>
            {/* Applications */}
            <h2 style={{ marginTop: 0 }}>Ho so dang ky giang vien ({applications.length})</h2>
            {applications.length === 0 && <p style={{ color: "#888" }}>Chua co ho so nao.</p>}
            {applications.map((app) => (
              <Card key={app.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{app.fullName}</div>
                    <div style={{ color: "#6b7280", fontSize: 13, marginBottom: 4 }}>
                      {app.email}{app.phone && ` · ${app.phone}`}
                    </div>
                    <div style={{ marginBottom: 6 }}><Badge status={app.status} /></div>
                    {app.qualification && <p style={{ margin: "4px 0", fontSize: 13 }}><b>Trinh do:</b> {app.qualification}</p>}
                    {app.bio && <p style={{ margin: "4px 0", fontSize: 13, color: "#374151" }}>{app.bio}</p>}
                    {app.certificateUrl && (
                      <a href={app.certificateUrl} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: "#2563eb" }}>
                        Xem bang cap / chung chi
                      </a>
                    )}
                  </div>
                  {app.status === "PENDING" && (
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <Btn small color="#16a34a" onClick={() => patch(`${API}/instructor-applications/admin/${app.id}/approve`, "Da duyet giang vien")}>Duyet</Btn>
                      <Btn small color="#dc2626" onClick={() => patch(`${API}/instructor-applications/admin/${app.id}/reject`, "Da tu choi ho so")}>Tu choi</Btn>
                    </div>
                  )}
                </div>
              </Card>
            ))}

            {/* Approved instructors */}
            <h2 style={{ marginTop: 28 }}>Danh sach giang vien ({instructors.length})</h2>
            {instructors.length === 0 && <p style={{ color: "#888" }}>Chua co giang vien nao.</p>}
            {instructors.map((inst) => (
              <Card key={inst.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{inst.fullName}</div>
                    <div style={{ color: "#6b7280", fontSize: 13, marginBottom: 6 }}>{inst.email}</div>
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13 }}>
                      <span><b>{inst.courseCount ?? 0}</b> khoa hoc</span>
                      <span><b>{inst.studentCount ?? 0}</b> hoc vien</span>
                      <span style={{ color: "#16a34a" }}><b>{Number(inst.revenue || 0).toLocaleString()}đ</b> doanh thu</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Badge status={inst.status} />
                    <Btn
                      small
                      color={inst.status === "ACTIVE" ? "#dc2626" : "#16a34a"}
                      onClick={() => patch(`${API}/admin/instructors/${inst.id}/toggle-status`,
                        inst.status === "ACTIVE" ? "Da khoa giang vien" : "Da mo khoa giang vien"
                      )}
                    >
                      {inst.status === "ACTIVE" ? "Khoa" : "Mo khoa"}
                    </Btn>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* ── Tab 2: Khoa hoc ── */}
        {tab === 2 && (
          <div>
            <h2 style={{ marginTop: 0 }}>Danh sach khoa hoc ({courses.length})</h2>
            {courses.length === 0 && <p style={{ color: "#888" }}>Chua co khoa hoc nao.</p>}
            {courses.map((course) => (
              <Card key={course.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{course.title}</div>
                    <div style={{ color: "#6b7280", fontSize: 13, marginBottom: 6 }}>
                      Giang vien: {course.instructorName || "N/A"}
                      {course.price !== undefined && (
                        <> · <b style={{ color: "#e74c3c" }}>{Number(course.price || 0).toLocaleString()}đ</b></>
                      )}
                    </div>
                    <div style={{ marginBottom: 6 }}><Badge status={course.status} /></div>
                    {course.description && (
                      <p style={{ margin: "6px 0", fontSize: 13, color: "#374151", maxWidth: 600 }}>
                        {course.description.length > 200 ? course.description.slice(0, 200) + "..." : course.description}
                      </p>
                    )}
                    {course.thumbnailUrl && (
                      <img src={course.thumbnailUrl} alt={course.title}
                        style={{ width: 120, height: 70, objectFit: "cover", borderRadius: 4, marginTop: 6 }} />
                    )}
                  </div>
                  {course.status === "PENDING_APPROVAL" && (
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <Btn small color="#16a34a" onClick={() => patch(`${API}/admin/courses/${course.id}/approve`, "Da duyet khoa hoc")}>Duyet dang</Btn>
                      <Btn small color="#dc2626" onClick={() => patch(`${API}/admin/courses/${course.id}/reject`, "Da tu choi khoa hoc")}>Tu choi</Btn>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* ── Tab 3: Ho tro ── */}
        {tab === 3 && (
          <div>
            <h2 style={{ marginTop: 0 }}>Yeu cau ho tro ({supportLeads.length})</h2>
            {supportLeads.length === 0 && <p style={{ color: "#888" }}>Chua co yeu cau nao.</p>}
            {supportLeads.map((lead) => (
              <Card key={lead.id}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{lead.subject || "Khong co tieu de"}</div>
                  <div style={{ color: "#6b7280", fontSize: 13, marginBottom: 4 }}>
                    {lead.name} · {lead.email}{lead.category && ` · ${lead.category}`}
                  </div>
                  <div style={{ marginBottom: 6 }}><Badge status={lead.status || "OPEN"} /></div>
                  {lead.message && (
                    <p style={{ margin: "6px 0", fontSize: 13, color: "#374151", background: "#f9fafb", padding: 10, borderRadius: 6 }}>
                      {lead.message}
                    </p>
                  )}
                  {lead.createdAt && (
                    <small style={{ color: "#9ca3af" }}>{new Date(lead.createdAt).toLocaleString("vi-VN")}</small>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
