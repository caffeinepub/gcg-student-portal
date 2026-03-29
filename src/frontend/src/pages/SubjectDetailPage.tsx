import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import type { Assignment, Record_, Subject } from "../backend";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { useActor } from "../hooks/useActor";

export default function SubjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { actor } = useActor();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [attendance, setAttendance] = useState<Record_[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<bigint | null>(null);

  useEffect(() => {
    if (!actor || !id) return;
    const subjectId = BigInt(id);
    Promise.all([
      actor.getSubject(subjectId),
      actor.getAssignmentsForSubject(subjectId),
      actor.getAttendanceHistory(subjectId),
    ])
      .then(([s, a, r]) => {
        setSubject(s);
        setAssignments(a);
        setAttendance(r);
      })
      .finally(() => setLoading(false));
  }, [actor, id]);

  const handleSubmit = async (assignmentId: bigint) => {
    if (!actor) return;
    setSubmitting(assignmentId);
    try {
      await actor.submitAssignment(assignmentId);
      setAssignments((prev) =>
        prev.map((a, i) =>
          BigInt(i) === assignmentId ? { ...a, isSubmitted: true } : a,
        ),
      );
      toast.success("Assignment submitted!");
    } catch {
      toast.error("Submission failed.");
    } finally {
      setSubmitting(null);
    }
  };

  if (loading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );

  if (!subject)
    return (
      <div className="text-center py-16">
        <p className="text-white/50">Subject not found.</p>
        <Link
          to="/subjects"
          className="text-cyan-400 hover:underline mt-2 inline-block"
        >
          Back to Subjects
        </Link>
      </div>
    );

  const chartData = [
    {
      name: "Attendance",
      value: Number(subject.attendancePercent),
      fill: "#06b6d4",
    },
    {
      name: "Score",
      value: Math.round(
        (Number(subject.marksObtained) / Number(subject.totalMarks)) * 100,
      ),
      fill: "#3b82f6",
    },
  ];

  return (
    <div className="space-y-5">
      <Link
        to="/subjects"
        className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors"
      >
        <ArrowLeft size={16} /> Back to Subjects
      </Link>

      <div className="glass rounded-2xl p-6 border border-white/10">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{subject.name}</h1>
            <p className="text-white/50 mt-1">Prof. {subject.professorName}</p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm ${subject.isCompleted ? "bg-green-500/20 text-green-400" : "bg-cyan-500/20 text-cyan-400"}`}
          >
            {subject.isCompleted ? "Completed" : "In Progress"}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          {[
            ["Course", subject.course],
            ["Year", String(subject.year)],
            [
              "Marks",
              `${Number(subject.marksObtained)}/${Number(subject.totalMarks)}`,
            ],
            ["Attendance", `${Number(subject.attendancePercent)}%`],
          ].map(([l, v]) => (
            <div key={l} className="bg-white/5 rounded-xl p-3">
              <p className="text-xs text-white/40">{l}</p>
              <p className="text-base font-semibold text-white mt-0.5">{v}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
          <div className="bg-white/5 rounded-xl p-3">
            <p className="text-xs text-white/40">Exam Date</p>
            <p className="text-white mt-0.5">
              {new Date(
                Number(subject.examDate / 1_000_000n),
              ).toLocaleDateString()}
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-3">
            <p className="text-xs text-white/40">Practical Date</p>
            <p className="text-white mt-0.5">
              {new Date(
                Number(subject.practicalDate / 1_000_000n),
              ).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="glass rounded-2xl p-5 border border-white/10">
          <h3 className="text-base font-semibold text-white mb-4">
            Performance
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} barSize={40}>
              <XAxis
                dataKey="name"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#94a3b8", fontSize: 12 }}
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
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-2xl p-5 border border-white/10">
          <h3 className="text-base font-semibold text-white mb-3">
            Attendance History
          </h3>
          {attendance.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-8">
              No attendance records
            </p>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {attendance.map((r) => (
                <div
                  key={String(r.date)}
                  className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                >
                  <span className="text-sm text-white/70">
                    {new Date(Number(r.date / 1_000_000n)).toLocaleDateString()}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${r.isPresent ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
                  >
                    {r.isPresent ? "Present" : "Absent"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="glass rounded-2xl p-5 border border-white/10">
        <h3 className="text-base font-semibold text-white mb-4">Assignments</h3>
        {assignments.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-6">
            No assignments for this subject
          </p>
        ) : (
          <div className="space-y-3">
            {assignments.map((a, i) => (
              <div
                key={`${a.title}-${String(a.dueDate)}`}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/8 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white">{a.title}</p>
                  <p className="text-xs text-white/50 mt-0.5">
                    {a.description}
                  </p>
                  <p className="text-xs text-white/30 mt-1">
                    Due:{" "}
                    {new Date(
                      Number(a.dueDate / 1_000_000n),
                    ).toLocaleDateString()}
                  </p>
                </div>
                {a.isSubmitted ? (
                  <span className="flex items-center gap-1 text-xs text-green-400">
                    <CheckCircle size={14} /> Submitted
                  </span>
                ) : (
                  <Button
                    onClick={() => handleSubmit(BigInt(i))}
                    disabled={submitting === BigInt(i)}
                    className="text-xs bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl px-3 py-1.5 hover:opacity-90"
                  >
                    {submitting === BigInt(i) ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      "Submit"
                    )}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
