import { useMemo } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Calendar as CalendarIcon,
  CheckCircle,
  Clock,
  Download,
  Mail,
  MapPin,
  Phone,
  Printer,
  RefreshCcw
} from "lucide-react";
import { message } from "antd";
const STATUS_THEME = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  confirmed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 border border-rose-200",
  completed: "bg-blue-50 text-blue-700 border border-blue-200"
};
function readBookingDetails() {
  try {
    const raw = sessionStorage.getItem("hc.lastBooking");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function BookingSuccess({ onNavigate }) {
  const details = useMemo(() => readBookingDetails(), []);
  if (!details) {
    return <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4 text-center">
        <CheckCircle className="h-16 w-16 text-emerald-500" />
        <div>
          <h2 className="text-3xl font-semibold mb-2">Không tìm thấy thông tin lịch hẹn</h2>
          <p className="text-muted-foreground max-w-xl">
            Vui lòng đặt lịch mới để nhận mã xác nhận và trạng thái cập nhật theo thời gian thực.
          </p>
        </div>
        <Button onClick={() => onNavigate("booking")}>Đặt lịch ngay</Button>
      </div>;
  }
  const appointmentDate = new Date(details.scheduledAt);
  const statusTheme = STATUS_THEME[details.status] || STATUS_THEME.pending;
  const handleDownload = () => {
    message.info("Phiếu xác nhận sẽ sớm khả dụng ở bản phát hành kế tiếp.");
  };
  return <div className="min-h-screen bg-muted/30 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <Badge variant="outline" className="uppercase tracking-wide">
            Lịch hẹn của bạn
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-semibold">Đặt lịch thành công</h1>
          <p className="text-muted-foreground">
            Chúng tôi đã gửi email xác nhận tới <strong>{details.email}</strong>. Mã đặt lịch của bạn là{" "}
            <span className="font-semibold">{details.bookingCode}</span>.
          </p>
        </div>

        <Card className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm uppercase text-muted-foreground mb-1">Trạng thái</p>
              <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1 text-sm font-medium ${statusTheme}`}>
                <span className="h-2 w-2 rounded-full bg-current" />
                {details.status === "pending" && "Chờ xác nhận"}
                {details.status === "confirmed" && "Đã xác nhận"}
                {details.status === "cancelled" && "Đã huỷ"}
                {details.status === "completed" && "Đã hoàn thành"}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Mã lịch hẹn: <span className="font-semibold text-foreground">{details.bookingCode}</span>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Thông tin khám</h2>
              <div className="flex items-start gap-3">
                <CalendarIcon className="h-5 w-5 mt-1 text-primary" />
                <div>
                  <p className="font-medium">
                    {appointmentDate.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  })}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {appointmentDate.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-1 text-primary" />
                <div>
                  <p className="font-medium">{details.hospital}</p>
                  <p className="text-sm text-muted-foreground">Kênh tiếp nhận: {details.channel}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Bác sĩ phụ trách</h2>
              <div className="rounded-xl border bg-muted/30 p-4 space-y-1">
                <p className="font-medium">{details.doctorName}</p>
                <p className="text-sm text-muted-foreground">{details.specialty}</p>
                <p className="text-sm text-muted-foreground">{details.hospital}</p>
              </div>
              <div className="rounded-xl border p-4 space-y-2">
                <p className="text-sm text-muted-foreground">Ghi chú</p>
                <p className="text-sm">{details.notes || "Không có ghi chú bổ sung"}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border p-4 space-y-1">
              <p className="text-sm text-muted-foreground uppercase">Bệnh nhân</p>
              <p className="font-medium">{details.patientName}</p>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {details.phone}
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {details.email}
              </div>
            </div>
            <div className="rounded-xl border p-4 space-y-4">
              <p className="text-sm text-muted-foreground uppercase">Hành động nhanh</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Tải PDF
                </Button>
                <Button variant="outline" onClick={() => window.print()}>
                  <Printer className="h-4 w-4 mr-2" />
                  In
                </Button>
                <Button variant="ghost" onClick={() => onNavigate("booking")}>
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Đặt lịch mới
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>;
}
export {
  BookingSuccess
};
