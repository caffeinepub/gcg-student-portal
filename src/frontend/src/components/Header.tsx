import { Bell, LogOut, Menu, Moon, Search, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Notification } from "../backend";
import { useTheme } from "../context/ThemeContext";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { theme, toggleTheme } = useTheme();
  const { clear, identity } = useInternetIdentity();
  const { actor } = useActor();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [search, setSearch] = useState("");

  const unread = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    if (!actor || !identity) return;
    actor
      .getNotifications()
      .then(setNotifications)
      .catch(() => {});
  }, [actor, identity]);

  const principal = identity?.getPrincipal().toString() || "";
  const shortId = principal ? `${principal.slice(0, 8)}...` : "User";

  return (
    <header className="glass border-b border-white/10 px-4 py-3 flex items-center gap-3 z-10">
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        className="text-white/70 hover:text-white"
      >
        <Menu size={20} />
      </Button>

      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subjects, assignments..."
            className="w-full pl-9 pr-4 py-2 rounded-xl glass text-sm text-white placeholder-white/30 outline-none focus:border-cyan-500/50 border border-transparent transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-white/70 hover:text-white"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </Button>

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="text-white/70 hover:text-white relative"
            onClick={() => setShowNotifs((v) => !v)}
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Button>

          {showNotifs && (
            <div className="absolute right-0 top-full mt-2 w-80 glass rounded-xl border border-white/10 shadow-xl z-50 max-h-80 overflow-y-auto">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <span className="text-sm font-semibold text-white">
                  Notifications
                </span>
                {unread > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      actor?.markAllNotificationsRead();
                      setNotifications((n) =>
                        n.map((x) => ({ ...x, isRead: true })),
                      );
                    }}
                    className="text-xs text-cyan-400 hover:text-cyan-300"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              {notifications.length === 0 ? (
                <p className="text-sm text-white/40 text-center py-6">
                  No notifications
                </p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={`${n.title}-${String(n.createdAt)}`}
                    className={`px-4 py-3 border-b border-white/5 last:border-0 ${!n.isRead ? "bg-cyan-500/5" : ""}`}
                  >
                    <p className="text-sm font-medium text-white">{n.title}</p>
                    <p className="text-xs text-white/50 mt-0.5">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* User */}
        <Link
          to="/profile"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-600 text-white text-xs font-bold">
              {shortId.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="hidden md:block text-sm text-white/80">
            {shortId}
          </span>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          onClick={clear}
          className="text-white/50 hover:text-red-400"
        >
          <LogOut size={16} />
        </Button>
      </div>
    </header>
  );
}
