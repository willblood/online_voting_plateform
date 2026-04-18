import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import AdminElectionManagement from "../../features/dashboard/AdminElectionManagement.js";

export default function AdminElectionsRoute() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("voti_user");
    if (!raw) { navigate("/login"); return; }
    try {
      const parsed = JSON.parse(raw) as { email: string; role: string };
      if (typeof parsed.email !== "string" || !parsed.email) { navigate("/login"); return; }
      if (parsed.role !== "ADMIN") { navigate("/dashboard"); return; }
      setUser(parsed);
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  if (!user) return null;
  return <AdminElectionManagement user={user} />;
}
