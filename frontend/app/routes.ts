import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("admin/voters", "routes/admin/voters.tsx"),
  route("admin/elections", "routes/admin/elections.tsx"),
  route("admin/elections/:id/candidates", "routes/admin/election-candidates.tsx"),
  route("admin/parties", "routes/admin/parties.tsx"),
  route("elections", "routes/elections.tsx"),
  route("elections/:id/vote", "routes/election-vote.tsx"),
] satisfies RouteConfig;
