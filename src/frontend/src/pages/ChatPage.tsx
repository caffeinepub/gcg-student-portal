import { Principal } from "@icp-sdk/core/principal";
import { MessageSquare, Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Message } from "../backend";
import { Button } from "../components/ui/button";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const DEMO_CONTACTS = [
  { name: "Admin", principalStr: "2vxsx-fae" },
  { name: "Notice Board", principalStr: "aaaaa-aa" },
];

export default function ChatPage() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const [conversations, setConversations] = useState<string[]>([]);
  const [activeContact, setActiveContact] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const myPrincipal = identity?.getPrincipal().toString() || "";

  const loadMessages = useCallback(
    async (contactPrincipal: string) => {
      if (!actor) return;
      try {
        const p = Principal.fromText(contactPrincipal);
        const msgs = await actor.getMessagesWithUser(p);
        setMessages(msgs);
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      } catch {}
    },
    [actor],
  );

  useEffect(() => {
    if (!actor) return;
    actor
      .getConversations()
      .then((principals) => {
        const strs = principals.map((p) => p.toString());
        const all = [
          ...new Set([...strs, ...DEMO_CONTACTS.map((c) => c.principalStr)]),
        ];
        setConversations(all);
        if (all.length > 0) setActiveContact(all[0]);
      })
      .catch(() => {
        setConversations(DEMO_CONTACTS.map((c) => c.principalStr));
        setActiveContact(DEMO_CONTACTS[0].principalStr);
      });
  }, [actor]);

  useEffect(() => {
    if (!activeContact) return;
    loadMessages(activeContact);
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => loadMessages(activeContact), 2000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [activeContact, loadMessages]);

  const handleSend = async () => {
    if (!input.trim() || !actor || !activeContact) return;
    setSending(true);
    try {
      const p = Principal.fromText(activeContact);
      await actor.sendMessage(p, input.trim());
      setInput("");
      await loadMessages(activeContact);
    } catch {
    } finally {
      setSending(false);
    }
  };

  const getContactName = (principalStr: string) => {
    const demo = DEMO_CONTACTS.find((c) => c.principalStr === principalStr);
    return demo ? demo.name : `${principalStr.slice(0, 12)}...`;
  };

  const getInitials = (name: string) => name.slice(0, 2).toUpperCase();

  const getMsgKey = (msg: Message, idx: number) =>
    `${msg.fromUserId.toString()}-${String(msg.timestamp)}-${idx}`;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white">Chat</h1>

      <div
        className="glass rounded-2xl border border-white/10 overflow-hidden"
        style={{ height: "calc(100vh - 200px)", minHeight: 400 }}
      >
        <div className="flex h-full">
          <div className="w-64 flex-shrink-0 border-r border-white/10 flex flex-col">
            <div className="p-3 border-b border-white/10">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wide">
                Conversations
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setActiveContact(p)}
                  className={`w-full flex items-center gap-3 px-3 py-3 hover:bg-white/5 transition-colors ${activeContact === p ? "bg-cyan-500/10 border-r-2 border-cyan-400" : ""}`}
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {getInitials(getContactName(p))}
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {getContactName(p)}
                    </p>
                    <p className="text-xs text-white/30">Click to chat</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col min-w-0">
            {activeContact ? (
              <>
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    {getInitials(getContactName(activeContact))}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {getContactName(activeContact)}
                    </p>
                    <p className="text-xs text-green-400">● Online</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare
                        size={32}
                        className="mx-auto text-white/20 mb-2"
                      />
                      <p className="text-white/30 text-sm">
                        No messages yet. Say hello!
                      </p>
                    </div>
                  ) : (
                    messages.map((msg, i) => {
                      const isMe = msg.fromUserId.toString() === myPrincipal;
                      const time = new Date(
                        Number(msg.timestamp / 1_000_000n),
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                      return (
                        <div
                          key={getMsgKey(msg, i)}
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${isMe ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-tr-sm" : "glass text-white rounded-tl-sm"}`}
                          >
                            <p className="text-sm">{msg.message}</p>
                            <p
                              className={`text-[10px] mt-1 ${isMe ? "text-white/60 text-right" : "text-white/40"}`}
                            >
                              {time}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="px-4 py-3 border-t border-white/10 flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && !e.shiftKey && handleSend()
                    }
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 rounded-xl glass text-white placeholder-white/30 outline-none focus:border-cyan-500/50 border border-white/10 transition-colors"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={sending || !input.trim()}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl px-4 hover:opacity-90 disabled:opacity-50"
                  >
                    <Send size={16} />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare
                    size={40}
                    className="mx-auto text-white/20 mb-3"
                  />
                  <p className="text-white/40">Select a conversation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
