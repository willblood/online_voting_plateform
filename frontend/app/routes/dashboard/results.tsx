import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import AdminResultsOverview from "../../features/dashboard/AdminResultsOverview.js";

export default function DashboardResultsRoute() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("voti_user");
    if (!raw) { navigate("/login"); return; }
    try {
      const parsed = JSON.parse(raw) as { email: string; role: string };
      if (parsed.role !== "ADMIN") { navigate("/dashboard"); return; }
      setUser(parsed);
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  if (!user) return null;
  return <AdminResultsOverview user={user} />;
}
