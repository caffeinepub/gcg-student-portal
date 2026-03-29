import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { Notification } from "../backend";
import { NotificationType } from "../backend";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { useActor } from "../hooks/useActor";

const SKELETON_KEYS = ["sk-n1", "sk-n2", "sk-n3", "sk-n4"];

export default function NotificationsPage() {
  const { actor } = useActor();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const load = useCallback(async () => {
    if (!actor) return;
    setLoading(true);
    try {
      setNotifications(await actor.getNotifications());
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkAll = async () => {
    if (!actor) return;
    setMarkingAll(true);
    try {
      await actor.markAllNotificationsRead();
      setNotifications((n) => n.map((x) => ({ ...x, isRead: true })));
    } finally {
      setMarkingAll(false);
    }
  };

  const typeColor = (t: NotificationType) => {
    switch (t) {
      case NotificationType.warning:
        return "border-l-amber-400 bg-amber-500/5";
      case NotificationType.success:
        return "border-l-green-400 bg-green-500/5";
      default:
        return "border-l-cyan-400 bg-cyan-500/5";
    }
  };

  const unread = notifications.filter((n) => !n.isRead).length;

  if (loading)
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-48" />
        {SKELETON_KEYS.map((k) => (
          <Skeleton key={k} className="h-20 rounded-xl" />
        ))}
      </div>
    );

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          {unread > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">
              {unread} unread
            </span>
          )}
        </div>
        {unread > 0 && (
          <Button
            onClick={handleMarkAll}
            disabled={markingAll}
            variant="outline"
            className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 rounded-xl text-sm"
          >
            {markingAll ? (
              <Loader2 size={14} className="animate-spin mr-2" />
            ) : (
              <CheckCheck size={14} className="mr-2" />
            )}
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="glass rounded-2xl p-12 border border-white/10 text-center">
          <Bell size={40} className="mx-auto text-white/20 mb-3" />
          <p className="text-white/40">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={`${n.title}-${String(n.createdAt)}`}
              className={`glass rounded-xl p-4 border-l-4 border border-white/10 transition-all ${typeColor(n.notificationType)} ${!n.isRead ? "opacity-100" : "opacity-60"}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-white">{n.title}</p>
                  <p className="text-sm text-white/60 mt-0.5">{n.message}</p>
                  <p className="text-xs text-white/30 mt-1">
                    {new Date(
                      Number(n.createdAt / 1_000_000n),
                    ).toLocaleString()}
                  </p>
                </div>
                {!n.isRead && (
                  <div className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0 mt-1.5 ml-2" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
