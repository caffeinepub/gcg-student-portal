import { CheckCircle, Filter, Loader2, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import type { Subject } from "../backend";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { useActor } from "../hooks/useActor";

type SubjectWithId = Subject & { _id: bigint };

export default function SubjectsPage() {
  const { actor } = useActor();
  const [subjects, setSubjects] = useState<SubjectWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [completing, setCompleting] = useState<bigint | null>(null);

  const load = useCallback(async () => {
    if (!actor) return;
    setLoading(true);
    try {
      const subs = await actor.getAllSubjects();
      setSubjects(subs.map((s, i) => ({ ...s, _id: BigInt(i) })));
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    load();
  }, [load]);

  const handleComplete = async (id: bigint) => {
    if (!actor) return;
    setCompleting(id);
    try {
      await actor.markSubjectComplete(id);
      setSubjects((prev) =>
        prev.map((s) => (s._id === id ? { ...s, isCompleted: true } : s)),
      );
      toast.success("Subject marked as complete!");
    } catch {
      toast.error("Failed to update. Please try again.");
    } finally {
      setCompleting(null);
    }
  };

  const filtered = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.professorName.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      </div>
    );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Subjects</h1>
        <span className="text-sm text-white/40">
          {filtered.length} subject{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by subject or professor..."
          className="w-full pl-10 pr-4 py-3 rounded-xl glass text-white placeholder-white/30 outline-none focus:border-cyan-500/50 border border-white/10 transition-colors"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-white/30">
          <Filter size={32} className="mx-auto mb-3 opacity-50" />
          <p>No subjects found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => {
            const examDate = new Date(Number(s.examDate / 1_000_000n));
            return (
              <div
                key={String(s._id)}
                className="glass rounded-2xl p-5 border border-white/10 hover:border-cyan-500/20 transition-all hover:-translate-y-1 flex flex-col"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white">{s.name}</h3>
                    <p className="text-xs text-white/50 mt-0.5">
                      {s.professorName}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ml-2 ${s.isCompleted ? "bg-green-500/20 text-green-400" : "bg-cyan-500/20 text-cyan-400"}`}
                  >
                    {s.isCompleted ? "Completed" : "Active"}
                  </span>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-xs text-white/50 mb-1">
                    <span>Attendance</span>
                    <span
                      className={
                        Number(s.attendancePercent) < 75
                          ? "text-red-400"
                          : "text-green-400"
                      }
                    >
                      {Number(s.attendancePercent)}%
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        Number(s.attendancePercent) < 75
                          ? "bg-gradient-to-r from-red-500 to-orange-500"
                          : "bg-gradient-to-r from-cyan-500 to-blue-500"
                      }`}
                      style={{ width: `${Number(s.attendancePercent)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-white/50 text-xs">Score</span>
                  <span className="font-semibold text-white">
                    {Number(s.marksObtained)}/{Number(s.totalMarks)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-white/40 mb-4">
                  <span>Exam: {examDate.toLocaleDateString()}</span>
                </div>

                <div className="flex gap-2 mt-auto">
                  <Link to={`/subjects/${s._id}`} className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full text-xs border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 rounded-xl"
                    >
                      View Details
                    </Button>
                  </Link>
                  {!s.isCompleted && (
                    <Button
                      onClick={() => handleComplete(s._id)}
                      disabled={completing === s._id}
                      className="flex-1 text-xs bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:opacity-90"
                    >
                      {completing === s._id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <>
                          <CheckCircle size={12} className="mr-1" />
                          Complete
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
