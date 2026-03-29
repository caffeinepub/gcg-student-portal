import { GraduationCap, Loader2 } from "lucide-react";
import { useState } from "react";
import type { StudentProfile } from "../backend";
import { Button } from "../components/ui/button";
import { useActor } from "../hooks/useActor";

interface Props {
  onComplete: () => void;
}

export default function SetupProfilePage({ onComplete }: Props) {
  const { actor } = useActor();
  const [form, setForm] = useState({
    name: "",
    email: "",
    course: "B.Sc",
    year: "1",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const courses = ["B.Sc", "B.Com", "B.A", "B.Tech", "BCA", "BBA"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setError("Name and email are required.");
      return;
    }
    if (!actor) return;
    setLoading(true);
    setError("");
    try {
      const profile: StudentProfile = {
        id: BigInt(0),
        name: form.name.trim(),
        email: form.email.trim(),
        course: form.course,
        year: BigInt(Number.parseInt(form.year)),
        phone: form.phone.trim(),
        address: form.address.trim(),
      };
      await actor.registerOrUpdateProfile(profile);
      onComplete();
    } catch {
      setError("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg glass rounded-2xl p-8 border border-white/10 animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
            <GraduationCap size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              Complete Your Profile
            </h2>
            <p className="text-sm text-white/50">
              Set up your student profile to continue
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="setup-name"
              className="block text-sm font-medium text-white/70 mb-1"
            >
              Full Name *
            </label>
            <input
              id="setup-name"
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl glass text-white placeholder-white/30 outline-none focus:border-cyan-500/50 border border-white/10 transition-colors"
              required
            />
          </div>
          <div>
            <label
              htmlFor="setup-email"
              className="block text-sm font-medium text-white/70 mb-1"
            >
              Email Address *
            </label>
            <input
              id="setup-email"
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              className="w-full px-4 py-2.5 rounded-xl glass text-white placeholder-white/30 outline-none focus:border-cyan-500/50 border border-white/10 transition-colors"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="setup-course"
                className="block text-sm font-medium text-white/70 mb-1"
              >
                Course *
              </label>
              <select
                id="setup-course"
                value={form.course}
                onChange={(e) =>
                  setForm((f) => ({ ...f, course: e.target.value }))
                }
                className="w-full px-4 py-2.5 rounded-xl glass text-white outline-none border border-white/10 bg-transparent"
              >
                {courses.map((c) => (
                  <option key={c} value={c} className="bg-gray-900">
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="setup-year"
                className="block text-sm font-medium text-white/70 mb-1"
              >
                Year *
              </label>
              <select
                id="setup-year"
                value={form.year}
                onChange={(e) =>
                  setForm((f) => ({ ...f, year: e.target.value }))
                }
                className="w-full px-4 py-2.5 rounded-xl glass text-white outline-none border border-white/10 bg-transparent"
              >
                {["1", "2", "3"].map((y) => (
                  <option key={y} value={y} className="bg-gray-900">
                    Year {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label
              htmlFor="setup-phone"
              className="block text-sm font-medium text-white/70 mb-1"
            >
              Phone Number
            </label>
            <input
              id="setup-phone"
              type="text"
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value }))
              }
              className="w-full px-4 py-2.5 rounded-xl glass text-white placeholder-white/30 outline-none focus:border-cyan-500/50 border border-white/10 transition-colors"
            />
          </div>
          <div>
            <label
              htmlFor="setup-address"
              className="block text-sm font-medium text-white/70 mb-1"
            >
              Address
            </label>
            <input
              id="setup-address"
              type="text"
              value={form.address}
              onChange={(e) =>
                setForm((f) => ({ ...f, address: e.target.value }))
              }
              className="w-full px-4 py-2.5 rounded-xl glass text-white placeholder-white/30 outline-none focus:border-cyan-500/50 border border-white/10 transition-colors"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-3 rounded-xl mt-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Saving...
              </>
            ) : (
              "Save Profile & Continue"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
