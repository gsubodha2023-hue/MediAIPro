import { Link, useLocation } from "react-router-dom";
import NotificationBell from "./NotificationBell.jsx";
import DarkModeToggle from "./DarkModeToggle.jsx";
import BrandLogo from "./BrandLogo.jsx";
import Icon from "./Icon.jsx";

const links = [
  { to: "/patient/dashboard", label: "Dashboard", icon: "dashboard" },
  { to: "/patient/ai-assistant", label: "AI Assistant", icon: "ai" },
  { to: "/patient/book", label: "Book", icon: "calendar" },
  { to: "/patient/appointments", label: "Appointments", icon: "calendar" },
  { to: "/patient/records", label: "Records", icon: "records" },
  { to: "/patient/care", label: "Health", icon: "heart" },
  { to: "/patient/profile", label: "Profile", icon: "profile" },
];

export default function PatientNav() {
  const { pathname } = useLocation();
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <div className="hidden py-2 sm:block"><BrandLogo to="/patient/dashboard" /></div>
        <nav className="flex min-w-0 flex-1 gap-5 overflow-x-auto sm:justify-center lg:gap-7" aria-label="Patient navigation">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`shrink-0 border-b-2 py-4 text-xs font-semibold transition lg:text-sm ${
                pathname === l.to
                  ? "border-primary-600 text-primary-700 dark:text-primary-500 font-medium"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              <span className="inline-flex items-center gap-1.5"><Icon name={l.icon} className="h-4 w-4" />{l.label}</span>
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <DarkModeToggle />
          <NotificationBell />
          <Link to="/patient/notifications" className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 hover:bg-slate-100" aria-label="Open notification center"><Icon name="records" className="h-4 w-4"/></Link>
        </div>
      </div>
    </header>
  );
}
