import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Event as CalEvent } from "../backend";
import { EventType } from "../backend";
import { Skeleton } from "../components/ui/skeleton";
import { useActor } from "../hooks/useActor";

const SKELETON_CAL_KEYS = Array.from({ length: 35 }, (_, i) => `cal-sk-${i}`);
const LEGEND = [
  { label: "Exam", cls: "bg-red-500" },
  { label: "Assignment", cls: "bg-cyan-500" },
  { label: "Event", cls: "bg-green-500" },
];

export default function CalendarPage() {
  const { actor } = useActor();
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(new Date());
  const [selected, setSelected] = useState<CalEvent[] | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = current.getFullYear();
  const month = current.getMonth();

  useEffect(() => {
    if (!actor) return;
    setLoading(true);
    actor
      .getEvents(BigInt(month + 1), BigInt(year))
      .then(setEvents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [actor, month, year]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const getEventsForDay = (day: number) =>
    events.filter((e) => {
      const d = new Date(Number(e.date / 1_000_000n));
      return (
        d.getDate() === day &&
        d.getMonth() === month &&
        d.getFullYear() === year
      );
    });

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const prev = () =>
    setCurrent((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const next = () =>
    setCurrent((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const eventColor = (type: EventType) => {
    switch (type) {
      case EventType.exam:
        return "bg-red-500";
      case EventType.assignment:
        return "bg-cyan-500";
      default:
        return "bg-green-500";
    }
  };

  const emptyKeys = Array.from({ length: firstDay }, (_, i) => `empty-${i}`);
  const dayKeys = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-white">Calendar</h1>

      <div className="glass rounded-2xl p-5 border border-white/10">
        <div className="flex items-center justify-between mb-5">
          <button
            type="button"
            onClick={prev}
            className="p-2 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-lg font-semibold text-white">
            {monthNames[month]} {year}
          </h2>
          <button
            type="button"
            onClick={next}
            className="p-2 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {dayNames.map((d) => (
            <div
              key={d}
              className="text-center text-xs font-medium text-white/40 py-2"
            >
              {d}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-7 gap-1">
            {SKELETON_CAL_KEYS.map((k) => (
              <Skeleton key={k} className="h-12 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {emptyKeys.map((k) => (
              <div key={k} />
            ))}
            {dayKeys.map((day) => {
              const dayEvents = getEventsForDay(day);
              const isToday =
                today.getDate() === day &&
                today.getMonth() === month &&
                today.getFullYear() === year;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    setSelectedDate(new Date(year, month, day));
                    setSelected(dayEvents);
                  }}
                  className={`relative p-2 rounded-xl text-sm transition-all hover:bg-white/10 ${isToday ? "ring-2 ring-cyan-400 bg-cyan-500/10 text-cyan-400 font-bold" : "text-white/70"} ${dayEvents.length > 0 ? "font-medium" : ""}`}
                >
                  {day}
                  {dayEvents.length > 0 && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                      {dayEvents.slice(0, 3).map((e) => (
                        <div
                          key={e.title}
                          className={`w-1 h-1 rounded-full ${eventColor(e.eventType)}`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
          {LEGEND.map(({ label, cls }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${cls}`} />
              <span className="text-xs text-white/50">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {selected !== null && selectedDate && (
        <div className="glass rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">
              {selectedDate.toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </h3>
            <button
              type="button"
              onClick={() => {
                setSelected(null);
                setSelectedDate(null);
              }}
              className="text-white/50 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
          {selected.length === 0 ? (
            <p className="text-white/30 text-sm">No events on this day.</p>
          ) : (
            <div className="space-y-3">
              {selected.map((e) => (
                <div
                  key={`${e.title}-${String(e.date)}`}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/5"
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${eventColor(e.eventType)}`}
                  />
                  <div>
                    <p className="font-medium text-white">{e.title}</p>
                    <p className="text-xs text-white/50 mt-0.5 capitalize">
                      {e.eventType}
                    </p>
                    {e.description && (
                      <p className="text-xs text-white/40 mt-1">
                        {e.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
