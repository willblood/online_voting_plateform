import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import VoterElections from "../features/dashboard/VoterElections.js";

interface VotiUser {
  email: string;
  role: "ADMIN" | "VOTER" | "OBSERVER";
  first_name?: string;
  last_name?: string;
}

export default function ElectionsRoute() {
  const navigate = useNavigate();
  const [user, setUser] = useState<VotiUser | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("voti_user") ?? localStorage.getItem("agora_user");
    if (!raw) { navigate("/login"); return; }
    try {
      const parsed = JSON.parse(raw) as VotiUser;
      if (typeof parsed?.email !== "string" || !parsed.email) { navigate("/login"); return; }
      if (parsed.role !== "VOTER") { navigate("/dashboard"); return; }
      setUser(parsed);
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  if (!user) return null;
  return <VoterElections user={user} />;
}
