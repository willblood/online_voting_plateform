import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import VoterBallot from "../features/dashboard/VoterBallot.js";

interface VotiUser {
  email: string;
  role: "ADMIN" | "VOTER" | "OBSERVER";
  first_name?: string;
  last_name?: string;
}

export default function ElectionVoteRoute() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
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

  if (!user || !id) return null;
  return <VoterBallot electionId={id} user={user} />;
}
