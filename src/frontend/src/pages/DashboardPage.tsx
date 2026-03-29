import {
  Award,
  Bell,
  BookOpen,
  CheckCircle,
  ChevronRight,
  Clock,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Assignment, Notification, Subject } from "../backend";
import { Skeleton } from "../components/ui/skeleton";
import { useActor } from "../hooks/useActor";

const SKELETON_STAT_KEYS = ["sk-stat-1", "sk-stat-2", "sk-stat-3", "sk-stat-4"];

export default function DashboardPage() {
  const { actor } = useActor();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!actor) return;
    Promise.all([
      actor.getAllSubjects(),
      actor.getAllAssignments(),
      actor.getNotifications(),
    ])
      .then(([s, a, n]) => {
        setSubjects(s);
        setAssignments(a);
        setNotifications(n);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [actor]);

  const avgAttendance = subjects.length
    ? Math.round(
        subjects.reduce((acc, s) => acc + Number(s.attendancePercent), 0) /
          subjects.length,
      )
    : 0;
  const avgMarks = subjects.length
    ? Math.round(
        subjects.reduce(
          (acc, s) =>
            acc + (Number(s.marksObtained) / Number(s.totalMarks)) * 100,
          0,
        ) / subjects.length,
      )
    : 0;
  const pendingAssignments = assignments.filter((a) => !a.isSubmitted).length;
  const unreadNotifs = notifications.filter((n) => !n.isRead).length;

  const perfData = subjects.map((s) => ({
    name: s.name.slice(0, 6),
    attendance: Number(s.attendancePercent),
    marks: Math.round((Number(s.marksObtained) / Number(s.totalMarks)) * 100),
  }));

  const stats = [
    {
      label: "Total Subjects",
      value: subjects.length,
      icon: BookOpen,
      color: "text-cyan-400",
      bg: "from-cyan-500/20 to-cyan-600/10",
    },
    {
      label: "Avg Attendance",
      value: `${avgAttendance}%`,
      icon: TrendingUp,
      color: "text-green-400",
      bg: "from-green-500/20 to-green-600/10",
    },
    {
      label: "Avg Score",
      value: `${avgMarks}%`,
      icon: Award,
      color: "text-amber-400",
      bg: "from-amber-500/20 to-amber-600/10",
    },
    {
      label: "Pending Tasks",
      value: pendingAssignments,
      icon: Clock,
      color: "text-purple-400",
      bg: "from-purple-500/20 to-purple-600/10",
    },
  ];

  if (loading)
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SKELETON_STAT_KEYS.map((k) => (
            <Skeleton key={k} className="h-28 rounded-2xl" />
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-white/50 text-sm mt-0.5">
            Government College Gangapur City
          </p>
        </div>
        {unreadNotifs > 0 && (
          <Link
            to="/notifications"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm hover:bg-cyan-500/20 transition-colors"
          >
            <Bell size={14} />
            {unreadNotifs} new alert{unreadNotifs > 1 ? "s" : ""}
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="glass rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-all hover:-translate-y-1"
          >
            <div
              className={`inline-flex p-2 rounded-xl bg-gradient-to-br ${bg} mb-3`}
            >
              <Icon size={20} className={color} />
            </div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-white/50 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5 border border-white/10">
          <h3 className="text-base font-semibold text-white mb-4">
            Performance Overview
          </h3>
          {perfData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={perfData}>
                <defs>
                  <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(10,20,40,0.9)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                    color: "#fff",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="attendance"
                  stroke="#06b6d4"
                  fill="url(#cyanGrad)"
                  strokeWidth={2}
                  name="Attendance %"
                />
                <Area
                  type="monotone"
                  dataKey="marks"
                  stroke="#3b82f6"
                  fill="url(#blueGrad)"
                  strokeWidth={2}
                  name="Score %"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-white/30 text-sm text-center py-8">
              No data yet
            </p>
          )}
        </div>

        <div className="glass rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Assignments</h3>
            <Link
              to="/subjects"
              className="text-xs text-cyan-400 flex items-center gap-1 hover:text-cyan-300"
            >
              View all <ChevronRight size={12} />
            </Link>
          </div>
          {assignments.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-8">
              No assignments yet
            </p>
          ) : (
            <div className="space-y-2">
              {assignments.slice(0, 5).map((a) => (
                <div
                  key={`${a.title}-${String(a.dueDate)}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/8 transition-colors"
                >
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${a.isSubmitted ? "bg-green-400" : "bg-amber-400"}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {a.title}
                    </p>
                    <p className="text-xs text-white/40">
                      Due:{" "}
                      {new Date(
                        Number(a.dueDate / 1_000_000n),
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  {a.isSubmitted && (
                    <CheckCircle
                      size={14}
                      className="text-green-400 flex-shrink-0"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="glass rounded-2xl p-5 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white">My Subjects</h3>
          <Link
            to="/subjects"
            className="text-xs text-cyan-400 flex items-center gap-1 hover:text-cyan-300"
          >
            View all <ChevronRight size={12} />
          </Link>
        </div>
        {subjects.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-6">
            No subjects yet
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {subjects.slice(0, 6).map((s) => (
              <div
                key={s.name}
                className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-cyan-500/20 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-white truncate">
                    {s.name}
                  </p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${s.isCompleted ? "bg-green-500/20 text-green-400" : "bg-cyan-500/20 text-cyan-400"}`}
                  >
                    {s.isCompleted ? "Done" : "Active"}
                  </span>
                </div>
                <p className="text-xs text-white/40 mb-2">{s.professorName}</p>
                <div className="w-full bg-white/10 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
                    style={{ width: `${Number(s.attendancePercent)}%` }}
                  />
                </div>
                <p className="text-xs text-white/30 mt-1">
                  {Number(s.attendancePercent)}% attendance
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
