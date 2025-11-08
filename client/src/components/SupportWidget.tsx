import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, Send, Loader2, PhoneCall, Bot, X } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  createSupportSession,
  sendSupportMessage,
  SupportMessage,
  SupportSession,
} from "../lib/support";

type Channel = "ai" | "hotline";

interface SupportWidgetProps {
  open: boolean;
  onToggle: (open: boolean) => void;
}

interface SessionState {
  session: SupportSession;
  messages: SupportMessage[];
}

export function SupportWidget({ open, onToggle }: SupportWidgetProps) {
  const [channel, setChannel] = useState<Channel>("ai");
  const [sessions, setSessions] = useState<Partial<Record<Channel, SessionState>>>({});
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const activeSession = sessions[channel];
  const messages = activeSession?.messages ?? [];

  useEffect(() => {
    setError(null);
  }, [channel]);

  useEffect(() => {
    if (!open) return;
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [messages, open]);

  const placeholder = useMemo(() => {
    return channel === "ai"
      ? "Nhập câu hỏi về bệnh, lịch khám..."
      : "Nhắn tin để gặp điều dưỡng trực...";
  }, [channel]);

  async function bootSession(selectedChannel: Channel) {
    if (offline || sessions[selectedChannel]) return;
    try {
      const payload = await createSupportSession({
        channel: selectedChannel,
        topic: selectedChannel === "ai" ? "Hỗ trợ nhanh" : "Hotline trực tiếp",
        initial_message:
          selectedChannel === "hotline"
            ? "Em cần điều dưỡng tư vấn trực tiếp."
            : undefined,
      });
      setSessions((prev) => ({
        ...prev,
        [selectedChannel]: {
          session: payload.session,
          messages: payload.messages || [],
        },
      }));
    } catch (err) {
      console.warn("Unable to connect support API", err);
      setOffline(true);
      setError("Không thể kết nối máy chủ, chuyển sang trợ lý ngoại tuyến.");
    }
  }

  useEffect(() => {
    if (open) {
      bootSession(channel);
    }
  }, [open, channel]);

  function buildOfflineReply(content: string): string {
    const normalized = content.toLowerCase();
    if (normalized.includes("tim") || normalized.includes("huyet ap")) {
      return "Đối với tim mạch, bạn nên đặt lịch tại Khoa Tim mạch (H+) để được siêu âm và theo dõi huyết áp liên tục. Chọn “Bệnh điều trị” → “Tim mạch” để xem phác đồ.";
    }
    if (normalized.includes("lich") || normalized.includes("hen")) {
      return "Bạn có thể vào mục “Đặt lịch khám”, chọn bác sĩ và giờ trống. Sau khi xác nhận, email sẽ được gửi cùng mã lịch hẹn và hướng dẫn chuẩn bị hồ sơ.";
    }
    if (normalized.includes("hotline") || normalized.includes("ho tro")) {
      return "Hotline 1900 633 682 trực 24/7. Gõ “gọi” hoặc dùng nút Gọi hotline để kết nối điều dưỡng trực.";
    }
    return "Trợ lý HealthCare+ đang lắng nghe. Bạn có thể chia sẻ triệu chứng, nhu cầu đặt lịch hoặc thắc mắc về công nghệ điều trị, tôi sẽ gợi ý từng bước.";
  }

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    if (!input.trim()) return;
    setPending(true);
    setError(null);
    const messageContent = input.trim();
    setInput("");

    if (offline) {
      const now = new Date().toISOString();
      const offlineMessages: SupportMessage[] = [
        {
          author: "patient",
          content: messageContent,
          created_at: now,
          message_id: Date.now(),
          session_id: -1,
        },
        {
          author: channel === "ai" ? "assistant" : "agent",
          content: buildOfflineReply(messageContent),
          created_at: new Date(Date.now() + 1).toISOString(),
          message_id: Date.now() + 1,
          session_id: -1,
        },
      ];
      setSessions((prev) => ({
        ...prev,
        [channel]: {
          session:
            prev[channel]?.session || ({
              session_id: -1,
              channel,
              status: "open",
              created_at: now,
              updated_at: now,
            } as SupportSession),
          messages: [...(prev[channel]?.messages || []), ...offlineMessages],
        },
      }));
      setPending(false);
      return;
    }

    try {
      await bootSession(channel);
      const sessionId = sessions[channel]?.session.session_id;
      if (!sessionId) throw new Error("Missing session");
      const payload = await sendSupportMessage(sessionId, messageContent);
      setSessions((prev) => ({
        ...prev,
        [channel]: {
          session: payload.session,
          messages: [...(prev[channel]?.messages || []), ...payload.messages],
        },
      }));
    } catch (err) {
      console.warn(err);
      setError("Không gửi được tin nhắn, vui lòng thử lại.");
    } finally {
      setPending(false);
    }
  }

  const bubble = (msg: SupportMessage) => {
    const isSelf = msg.author === "patient";
    const time = new Date(msg.created_at).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const label =
      msg.author === "assistant"
        ? "AI HealthCare+"
        : msg.author === "agent"
        ? "Điều dưỡng"
        : "Bạn";
    return (
      <div key={msg.message_id} className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}>
        <span className="text-[11px] text-muted-foreground mb-1">{label}</span>
        <div
          className={`rounded-2xl px-3 py-2 text-sm shadow-sm max-w-[230px] ${
            isSelf ? "bg-blue-600 text-white" : "bg-muted text-foreground"
          }`}
        >
          {msg.content}
        </div>
        <span className="text-[11px] text-muted-foreground mt-1">{time}</span>
      </div>
    );
  };

  return (
    <>
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
        {open && (
          <Card className="w-80 shadow-2xl border-slate-800/30 bg-background/95 backdrop-blur">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <p className="text-sm font-semibold flex items-center gap-1">
                  <Bot className="h-4 w-4 text-blue-500" /> Hỗ trợ HealthCare+
                </p>
                <p className="text-xs text-muted-foreground">
                  {channel === "ai" ? "AI trực 24/7" : "Điều dưỡng hotline"}
                </p>
              </div>
              <button
                onClick={() => onToggle(false)}
                className="p-1 rounded-full hover:bg-muted transition"
                aria-label="Đóng hỗ trợ"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex gap-2 px-4 py-2">
              {(["ai", "hotline"] as Channel[]).map((item) => (
                <button
                  key={item}
                  onClick={() => setChannel(item)}
                  className={`flex-1 text-xs font-medium rounded-full border px-3 py-1.5 transition ${
                    channel === item
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-slate-700 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item === "ai" ? "Chat AI" : "Hotline chat"}
                </button>
              ))}
            </div>

            <div
              ref={scrollRef}
              className="px-4 py-3 space-y-3 max-h-64 overflow-y-auto border-y border-slate-800/30"
            >
              {messages.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  {channel === "ai"
                    ? "Đặt câu hỏi về triệu chứng, phác đồ hoặc công nghệ điều trị. Tôi sẽ phản hồi tức thì."
                    : "Đội ngũ điều dưỡng sẽ tiếp nhận trong vài phút. Bạn có thể gõ tình huống cụ thể trước."}
                </p>
              )}
              {messages.map(bubble)}
              {pending && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" /> Đang gửi...
                </div>
              )}
            </div>

            {error && (
              <p className="text-xs text-red-400 px-4 mt-2">{error}</p>
            )}

            <form onSubmit={handleSend} className="flex items-center gap-2 px-4 py-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={placeholder}
                className="h-10 text-sm"
                disabled={pending}
              />
              <Button type="submit" size="icon" disabled={!input.trim() || pending}>
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>

            <div className="flex items-center justify-between px-4 pb-3">
              <button
                className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                onClick={() => window.open("tel:1900633682")}
              >
                <PhoneCall className="h-3 w-3" /> Gọi hotline
              </button>
              <p className="text-[11px] text-muted-foreground">Có mặt 24/7</p>
            </div>
          </Card>
        )}

        <button
          className="h-14 w-14 rounded-full shadow-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center hover:scale-105 transition"
          onClick={() => onToggle(!open)}
          aria-label="Hỗ trợ HealthCare+"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      </div>
    </>
  );
}
