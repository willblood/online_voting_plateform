import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import AdminDashboard from "../features/dashboard/AdminDashboard";
import VoterDashboard from "../features/dashboard/VoterDashboard";

interface VotiUser {
  email: string;
  role: "ADMIN" | "VOTER" | "OBSERVER";
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<VotiUser | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("voti_user") ?? localStorage.getItem("agora_user");
    if (!raw) {
      navigate("/login");
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.email === "string" && typeof parsed.role === "string") {
        setUser(parsed as VotiUser);
      } else {
        localStorage.removeItem("voti_user");
        localStorage.removeItem("agora_user");
        navigate("/login");
      }
    } catch {
      localStorage.removeItem("voti_user");
      localStorage.removeItem("agora_user");
      navigate("/login");
    }
  }, [navigate]);

  if (!user) return null;

  if (user.role === "ADMIN") return <AdminDashboard user={user} />;
  return <VoterDashboard user={user} />;
}
