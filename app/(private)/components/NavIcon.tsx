export default function NavIcon({ kind }: { kind: "home" | "planner" | "routes" | "vendor" | "desk" | "help" | "status" | "user" }) {
  const paths = {
    home: <><path d="m3 10 9-7 9 7M5 9v12h5v-7h4v7h5V9" /></>,
    planner: <><rect x="3" y="4" width="18" height="16" rx="1" /><path d="M8 4v16M13 4v16M18 4v16" /></>,
    routes: <><path d="M6 6h11a3 3 0 0 1 0 6H7a3 3 0 0 0 0 6h11" /><circle cx="5" cy="6" r="2" /><circle cx="19" cy="18" r="2" /></>,
    vendor: <><rect x="3" y="8" width="18" height="12" rx="1.5" /><path d="M8 8V6a4 4 0 0 1 8 0v2" /></>,
    desk: <><path d="M5 4h14v17l-3-2-4 2-4-2-3 2V4Z" /><path d="M8 3v3m4-3v3m4-3v3M8 10h8M8 14h6" /></>,
    help: <><circle cx="12" cy="12" r="9" /><path d="M9 9a3 3 0 1 1 4 3v2m-1 3h.01" /></>,
    status: <><rect x="4" y="3" width="16" height="7" rx="1" /><rect x="4" y="14" width="16" height="7" rx="1" /><path d="M7 6h1m-1 11h1" /></>,
    user: <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="9" r="3" /><path d="M5 19c1-6 13-6 14 0" /></>,
  };
  return <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[kind]}</svg>;
}
