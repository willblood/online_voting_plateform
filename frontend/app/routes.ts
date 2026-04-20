import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("results", "routes/results.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("dashboard/results", "routes/dashboard/results.tsx"),
  route("dashboard/elections", "routes/dashboard/elections.tsx"),
  route("dashboard/elections/:id", "routes/dashboard/election-detail.tsx"),
  route("dashboard/elections/:id/candidates", "routes/dashboard/election-candidates.tsx"),
  route("dashboard/elections/:id/results", "routes/dashboard/election-results.tsx"),
  route("dashboard/users", "routes/dashboard/users.tsx"),
  route("dashboard/parties", "routes/dashboard/parties.tsx"),
  route("admin/voters", "routes/admin/voters.tsx"),
  route("admin/elections", "routes/admin/elections.tsx"),
  route("admin/elections/:id/candidates", "routes/admin/election-candidates.tsx"),
  route("admin/parties", "routes/admin/parties.tsx"),
  route("elections", "routes/elections.tsx"),
  route("elections/:id/vote", "routes/election-vote.tsx"),
] satisfies RouteConfig;
