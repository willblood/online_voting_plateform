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
    const raw = localStorage.getItem("voti_user");
    // support legacy key from previous implementation
    const rawLegacy = localStorage.getItem("agora_user");
    const source = raw ?? rawLegacy;
    if (!source) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(source));
  }, [navigate]);

  if (!user) return null;

  if (user.role === "ADMIN") return <AdminDashboard user={user} />;
  return <VoterDashboard user={user} />;
}
