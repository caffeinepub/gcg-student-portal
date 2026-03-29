import {
  Bell,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  Phone,
  User,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "../lib/utils";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/subjects", icon: BookOpen, label: "Subjects" },
  { to: "/calendar", icon: Calendar, label: "Calendar" },
  { to: "/chat", icon: MessageSquare, label: "Chat" },
  { to: "/profile", icon: User, label: "Profile" },
  { to: "/notifications", icon: Bell, label: "Notifications" },
  { to: "/contact", icon: Phone, label: "Contact & About" },
];

export default function Sidebar({
  open,
  onToggle,
}: { open: boolean; onToggle: () => void }) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          role="button"
          tabIndex={0}
          onClick={onToggle}
          onKeyDown={(e) => e.key === "Escape" && onToggle()}
          aria-label="Close sidebar"
        />
      )}

      <aside
        className={cn(
          "fixed md:relative z-30 flex flex-col h-full transition-all duration-300",
          "glass border-r border-white/10",
          open ? "w-60" : "w-0 md:w-16",
          !open && "overflow-hidden",
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10 min-w-[240px]">
          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
            <GraduationCap size={20} className="text-white" />
          </div>
          {open && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white leading-tight">
                Govt. College
              </p>
              <p className="text-[10px] text-cyan-400 truncate">
                Gangapur City
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={onToggle}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            {open ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-2 space-y-1 min-w-[60px]">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                  isActive
                    ? "bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-400 border border-cyan-500/20"
                    : "text-white/60 hover:text-white hover:bg-white/10",
                )
              }
            >
              <Icon size={18} className="flex-shrink-0" />
              {open && <span className="text-sm font-medium">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {open && (
          <div className="px-4 py-4 border-t border-white/10">
            <p className="text-[11px] text-white/30 text-center">
              GCG Portal v1.0
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
