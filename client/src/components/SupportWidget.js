import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, Send, Loader2, PhoneCall, Bot, X } from "lucide-react";
import { createSupportSession, sendSupportMessage } from "../lib/support";
import "./SupportWidget.css";

function SupportWidget({ open, onToggle }) {
  const [channel, setChannel] = useState("ai");
  const [sessions, setSessions] = useState({});
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [offline, setOffline] = useState(false);
  const scrollRef = useRef(null);

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

  async function bootSession(selectedChannel) {
    if (offline || sessions[selectedChannel]) return;
    try {
      const payload = await createSupportSession({
        channel: selectedChannel,
        topic: selectedChannel === "ai" ? "Hỗ trợ nhanh" : "Hotline trực tiếp",
        initial_message:
          selectedChannel === "hotline" ? "Em cần điều dưỡng tư vấn trực tiếp." : undefined,
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
    if (open) bootSession(channel);
  }, [open, channel]);

  function buildOfflineReply(content) {
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
    return "Trợ lý HealthCare+ đang lắng nghe. Bạn có thể chia sẻ triệu chứng, nhu cầu đặt lịch hoặc thắc mắc về công nghệ điều trị.";
  }

  async function handleSend(e) {
    e?.preventDefault();
    if (!input.trim()) return;
    setPending(true);
    setError(null);
    const messageContent = input.trim();
    setInput("");

    if (offline) {
      const now = new Date();
      const reply = buildOfflineReply(messageContent);
      setSessions((prev) => ({
        ...prev,
        [channel]: {
          session: prev[channel]?.session || {
            session_id: -1,
            channel,
            status: "open",
            created_at: now.toISOString(),
            updated_at: now.toISOString(),
          },
          messages: [
            ...(prev[channel]?.messages || []),
            { author: "patient", content: messageContent, created_at: now.toISOString(), message_id: now.getTime() },
            {
              author: channel === "ai" ? "assistant" : "agent",
              content: reply,
              created_at: new Date(now.getTime() + 1).toISOString(),
              message_id: now.getTime() + 1,
            },
          ],
        },
      }));
      setPending(false);
      return;
    }

    try {
      if (!activeSession) await bootSession(channel);
      const session = sessions[channel];
      const result = await sendSupportMessage({
        session_id: session?.session?.session_id,
        content: messageContent,
      });
      setSessions((prev) => ({
        ...prev,
        [channel]: {
          session: result.session || session.session,
          messages: result.messages || [],
        },
      }));
    } catch (err) {
      console.warn("Unable to send message", err);
      setError("Tin nhắn chưa gửi được. Thử lại hoặc gọi hotline.");
    } finally {
      setPending(false);
    }
  }

  const toggleWidget = () => {
    if (typeof onToggle === "function") onToggle(!open);
  };

  return (
    <>
      {!open && (
        <button className="support-widget__fab" onClick={toggleWidget}>
          <MessageCircle size={18} />
          <span>Trợ lý HealthCare+</span>
        </button>
      )}

      <div className={`support-widget ${open ? "open" : ""}`}>
        <header>
          <div>
            <p>Trợ lý HealthCare+</p>
            <small>{channel === "ai" ? "Chat AI phản hồi tức thì" : "Điều dưỡng trực 24/7"}</small>
          </div>
          <button onClick={toggleWidget} aria-label="Đóng trợ lý">
            <X size={16} />
          </button>
        </header>

        <div className="support-widget__channels">
          <button
            className={channel === "ai" ? "active" : ""}
            onClick={() => {
              setChannel("ai");
              bootSession("ai");
            }}
          >
            <Bot size={16} /> Chat AI
          </button>
          <button
            className={channel === "hotline" ? "active" : ""}
            onClick={() => {
              setChannel("hotline");
              bootSession("hotline");
            }}
          >
            <PhoneCall size={16} /> Điều dưỡng
          </button>
        </div>

        <div className="support-widget__messages" ref={scrollRef}>
          {messages.length === 0 && (
            <p className="support-widget__placeholder">
              Hãy bắt đầu cuộc trò chuyện. Trợ lý sẽ trả lời trong vài giây.
            </p>
          )}
          {messages.map((msg) => (
            <div
              key={msg.message_id}
              className={`support-widget__message ${msg.author === "patient" ? "from-user" : "from-agent"}`}
            >
              <p>{msg.content}</p>
              <span>
                {new Date(msg.created_at).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))}
        </div>

        {error && <div className="support-widget__alert">{error}</div>}
        {offline && <div className="support-widget__alert">Đang ở chế độ ngoại tuyến.</div>}

        <form className="support-widget__input" onSubmit={handleSend}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
          />
          <button type="submit" disabled={pending} aria-label="Gửi tin nhắn">
            {pending ? <Loader2 className="spin" size={18} /> : <Send size={18} />}
          </button>
        </form>
      </div>
    </>
  );
}

export { SupportWidget };
