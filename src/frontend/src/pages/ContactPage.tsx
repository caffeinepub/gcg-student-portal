import {
  BookOpen,
  Clock,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Trophy,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill all required fields.");
      return;
    }
    setSending(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Message sent! We'll get back to you soon.");
    setForm({ name: "", email: "", subject: "", message: "" });
    setSending(false);
  };

  const stats = [
    { icon: GraduationCap, label: "Founded", value: "1972" },
    { icon: Users, label: "Students", value: "3000+" },
    { icon: BookOpen, label: "Courses", value: "50+" },
    { icon: Trophy, label: "Rankings", value: "Top 10" },
  ];

  const contactItems = [
    {
      Icon: MapPin,
      label: "Address",
      value: "Gangapur City, Sawai Madhopur, Rajasthan 322201",
    },
    { Icon: Phone, label: "Phone", value: "+91 74730 XXXXX" },
    { Icon: Mail, label: "Email", value: "principal@gcgangapurcity.ac.in" },
    { Icon: Clock, label: "Office Hours", value: "Mon-Sat: 9:00 AM - 5:00 PM" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Contact & About</h1>

      <div className="glass rounded-2xl p-6 border border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
            <GraduationCap size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              Government College Gangapur City
            </h2>
            <p className="text-white/50 text-sm">Rajasthan, India</p>
          </div>
        </div>
        <p className="text-white/60 text-sm leading-relaxed mb-5">
          Government College Gangapur City is a premier educational institution
          dedicated to providing quality higher education to students across
          Rajasthan. Our mission is to foster academic excellence, critical
          thinking, and holistic development in every student.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-white/5 rounded-xl p-3 text-center">
              <Icon size={20} className="mx-auto text-cyan-400 mb-1" />
              <p className="text-lg font-bold text-white">{value}</p>
              <p className="text-xs text-white/40">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="glass rounded-2xl p-6 border border-white/10 space-y-4">
          <h3 className="font-semibold text-white">Get In Touch</h3>
          {contactItems.map(({ Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-cyan-400" />
              </div>
              <div>
                <p className="text-xs text-white/40">{label}</p>
                <p className="text-sm text-white">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-6 border border-white/10">
          <h3 className="font-semibold text-white mb-4">Send a Message</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label
                htmlFor="contact-name"
                className="block text-sm font-medium text-white/60 mb-1.5"
              >
                Your Name *
              </label>
              <input
                id="contact-name"
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                className="w-full px-4 py-2.5 rounded-xl glass text-white placeholder-white/30 outline-none focus:border-cyan-500/50 border border-white/10 transition-colors"
                required
              />
            </div>
            <div>
              <label
                htmlFor="contact-email"
                className="block text-sm font-medium text-white/60 mb-1.5"
              >
                Email Address *
              </label>
              <input
                id="contact-email"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                className="w-full px-4 py-2.5 rounded-xl glass text-white placeholder-white/30 outline-none focus:border-cyan-500/50 border border-white/10 transition-colors"
                required
              />
            </div>
            <div>
              <label
                htmlFor="contact-subject"
                className="block text-sm font-medium text-white/60 mb-1.5"
              >
                Subject
              </label>
              <input
                id="contact-subject"
                type="text"
                value={form.subject}
                onChange={(e) =>
                  setForm((f) => ({ ...f, subject: e.target.value }))
                }
                className="w-full px-4 py-2.5 rounded-xl glass text-white placeholder-white/30 outline-none focus:border-cyan-500/50 border border-white/10 transition-colors"
              />
            </div>
            <div>
              <label
                htmlFor="contact-message"
                className="block text-sm font-medium text-white/60 mb-1.5"
              >
                Message *
              </label>
              <textarea
                id="contact-message"
                value={form.message}
                onChange={(e) =>
                  setForm((f) => ({ ...f, message: e.target.value }))
                }
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl glass text-white placeholder-white/30 outline-none focus:border-cyan-500/50 border border-white/10 transition-colors resize-none"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={sending}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:opacity-90"
            >
              {sending ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
