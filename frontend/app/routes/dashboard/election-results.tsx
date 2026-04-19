import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import AdminElectionResults from "../../features/dashboard/AdminElectionResults.js";

export default function DashboardElectionResultsRoute() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
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

  if (!user || !id) return null;
  return <AdminElectionResults user={user} electionId={id} />;
}
