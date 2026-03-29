import { Camera, Edit2, Loader2, Save, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { StudentProfile } from "../backend";
import { ExternalBlob } from "../backend";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

let pendingAvatar: ExternalBlob | undefined;

export default function ProfilePage() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    course: "",
    year: "1",
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!actor) return;
    actor
      .getCallerProfile()
      .then((p) => {
        setProfile(p);
        if (p) {
          setForm({
            name: p.name,
            email: p.email,
            phone: p.phone,
            address: p.address,
            course: p.course,
            year: String(p.year),
          });
          if (p.avatar) setAvatarUrl(p.avatar.getDirectURL());
        }
      })
      .finally(() => setLoading(false));
  }, [actor]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !actor) return;
    const bytes = new Uint8Array(await file.arrayBuffer());
    pendingAvatar = ExternalBlob.fromBytes(bytes);
    setAvatarUrl(URL.createObjectURL(file));
    toast.info("Avatar will be saved when you save your profile.");
  };

  const handleSave = async () => {
    if (!actor) return;
    setSaving(true);
    try {
      const updatedProfile: StudentProfile = {
        id: profile?.id ?? BigInt(0),
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        course: form.course,
        year: BigInt(Number.parseInt(form.year)),
        avatar: pendingAvatar ?? profile?.avatar,
      };
      await actor.saveCallerUserProfile(updatedProfile);
      setProfile(updatedProfile);
      setEditing(false);
      pendingAvatar = undefined;
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const principal = identity?.getPrincipal().toString() || "";

  if (loading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );

  const initials = (form.name || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const fieldKeys: [keyof typeof form, string, string?][] = [
    ["name", "Full Name"],
    ["email", "Email", "email"],
    ["phone", "Phone"],
    ["address", "Address"],
  ];

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        {!editing ? (
          <Button
            onClick={() => setEditing(true)}
            variant="outline"
            className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 rounded-xl"
          >
            <Edit2 size={14} className="mr-2" /> Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={() => setEditing(false)}
              variant="ghost"
              className="text-white/60 rounded-xl"
            >
              <X size={14} className="mr-1" /> Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl"
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin mr-2" />
              ) : (
                <Save size={14} className="mr-2" />
              )}
              Save
            </Button>
          </div>
        )}
      </div>

      <div className="glass rounded-2xl p-6 border border-white/10 flex items-center gap-5">
        <div className="relative">
          <Avatar className="w-20 h-20">
            {avatarUrl && <AvatarImage src={avatarUrl} />}
            <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-600 text-white text-2xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {editing && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-cyan-500 rounded-full flex items-center justify-center hover:bg-cyan-400 transition-colors"
            >
              <Camera size={13} className="text-white" />
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">
            {form.name || "Student"}
          </h2>
          <p className="text-white/50 text-sm">
            {form.course} — Year {form.year}
          </p>
          <p className="text-xs text-white/30 mt-1 font-mono">
            {principal.slice(0, 20)}...
          </p>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 border border-white/10 space-y-4">
        <h3 className="font-semibold text-white mb-2">Personal Information</h3>

        {fieldKeys.map(([key, label, type = "text"]) => (
          <div key={key}>
            <label
              htmlFor={`profile-${key}`}
              className="block text-xs font-medium text-white/50 mb-1"
            >
              {label}
            </label>
            {editing ? (
              <input
                id={`profile-${key}`}
                type={type}
                value={form[key]}
                onChange={(e) =>
                  setForm((f) => ({ ...f, [key]: e.target.value }))
                }
                className="w-full px-4 py-2.5 rounded-xl glass text-white placeholder-white/30 outline-none focus:border-cyan-500/50 border border-white/10 transition-colors"
              />
            ) : (
              <p className="text-white py-2">
                {(form[key] as string) || (
                  <span className="text-white/30">Not set</span>
                )}
              </p>
            )}
          </div>
        ))}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="profile-course"
              className="block text-xs font-medium text-white/50 mb-1"
            >
              Course
            </label>
            {editing ? (
              <select
                id="profile-course"
                value={form.course}
                onChange={(e) =>
                  setForm((f) => ({ ...f, course: e.target.value }))
                }
                className="w-full px-4 py-2.5 rounded-xl glass text-white outline-none border border-white/10 bg-transparent"
              >
                {["B.Sc", "B.Com", "B.A", "B.Tech", "BCA", "BBA"].map((c) => (
                  <option key={c} value={c} className="bg-gray-900">
                    {c}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-white py-2">{form.course}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="profile-year"
              className="block text-xs font-medium text-white/50 mb-1"
            >
              Year
            </label>
            {editing ? (
              <select
                id="profile-year"
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
            ) : (
              <p className="text-white py-2">Year {form.year}</p>
            )}
          </div>
        </div>

        <div>
          <p className="block text-xs font-medium text-white/50 mb-1">
            Student ID
          </p>
          <p className="text-white/70 py-2 font-mono text-sm">
            {profile ? `GCG-${String(profile.id).padStart(5, "0")}` : "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
}
