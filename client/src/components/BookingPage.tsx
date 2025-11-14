import { useEffect, useMemo, useState } from "react";
import { message, Spin } from "antd";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Calendar } from "./ui/calendar";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  MapPin,
  CheckCircle,
  ChevronRight,
  Info,
  Loader2,
} from "lucide-react";
import { SPECIALTIES } from "../constants/specialties";
import { DISTRICTS } from "../constants/districts";
import { DOCTORS, Doctor } from "../constants/doctors";
import { TIME_SLOTS } from "../constants/timeSlots";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

interface BookingPageProps {
  onNavigate: (page: string) => void;
}

interface BookingSnapshot {
  appointmentId: number;
  bookingCode: string;
  status: string;
  patientName: string;
  email: string;
  phone: string;
  doctorName: string;
  specialty: string;
  hospital: string;
  scheduledAt: string;
  channel: string;
  notes?: string;
}

const PHONE_REGEX = /^\d{10}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const STATUS_GUIDE = [
  {
    status: "pending",
    label: "Chờ xác nhận",
    description: "Điều phối viên đang kiểm tra và đối chiếu khung giờ.",
    tone: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  {
    status: "confirmed",
    label: "Đã xác nhận",
    description: "Bạn sẽ nhận email/SMS hướng dẫn chuẩn bị trước khi khám.",
    tone: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  {
    status: "cancelled",
    label: "Đã huỷ",
    description: "Có thể huỷ miễn phí trước 2 giờ để nhường khung giờ cho bệnh nhân khác.",
    tone: "bg-rose-50 text-rose-700 border border-rose-200",
  },
];

function combineDateTime(baseDate: Date, time: string) {
  const [hour, minute] = time.split(":").map(Number);
  const combined = new Date(baseDate);
  combined.setHours(hour, minute, 0, 0);
  return combined;
}

function splitFullName(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return { first_name: "Người", last_name: "Dùng" };
  if (parts.length === 1) return { first_name: parts[0], last_name: "HealthCare+" };
  return { first_name: parts.slice(0, -1).join(" "), last_name: parts[parts.length - 1] };
}

function persistBooking(details: BookingSnapshot) {
  try {
    sessionStorage.setItem("hc.lastBooking", JSON.stringify(details));
  } catch (_) {
    // Ignored – sessionStorage không khả dụng (SSR/test)
  }
}

export function BookingPage({ onNavigate }: BookingPageProps) {
  const [step, setStep] = useState(1);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [district, setDistrict] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [channel, setChannel] = useState<"offline" | "online">("offline");
  const [errors, setErrors] = useState<string[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>(DOCTORS);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchDoctors = async () => {
      setLoadingDoctors(true);
      try {
        const res = await fetch("/api/v1/doctors");
        if (!res.ok) throw new Error("Không thể tải danh sách bác sĩ");
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Dữ liệu bác sĩ không hợp lệ");
        if (!active) return;
        const normalized: Doctor[] = data.map((doc: any) => ({
          id: String(doc.doctor_id ?? doc.id),
          name: `BS. ${[doc.first_name, doc.last_name].filter(Boolean).join(" ") || "Đang cập nhật"}`,
          specialty: doc.specialty || "Đa khoa",
          experience: doc.experience || "Kinh nghiệm đang cập nhật",
          hospital: doc.hospital || "HealthCare+",
          district: doc.district || "Toàn quốc",
          rating: Number(doc.rating ?? 5),
          reviews: Number(doc.reviews ?? 0),
          avatar: "",
          achievements: doc.achievements || [],
          departmentId: String(doc.department_id ?? doc.department?.department_id ?? "general"),
          languages: doc.languages,
          focusAreas: doc.focusAreas,
        }));
        setDoctors(normalized);
      } catch (err) {
        if (active) {
          console.warn("[BOOKING] load doctor failed", err);
          message.warning("Không thể đồng bộ bác sĩ real-time, hiển thị danh sách mẫu.");
          setDoctors(DOCTORS);
        }
      } finally {
        if (active) setLoadingDoctors(false);
      }
    };
    fetchDoctors();
    return () => {
      active = false;
    };
  }, []);

  const filteredDoctors = useMemo(
    () =>
      doctors.filter(
        (doc) => (!specialty || doc.specialty === specialty) && (!district || doc.district === district),
      ),
    [doctors, specialty, district],
  );

  const selectedDoctorData = useMemo(
    () => doctors.find((doc) => doc.id === selectedDoctor),
    [doctors, selectedDoctor],
  );

  const canProceedStep1 = Boolean(selectedDoctor && selectedTime && date);

  const summary = useMemo(
    () => ({
      doctor: selectedDoctorData?.name || "Chưa chọn",
      specialty: selectedDoctorData?.specialty || specialty || "Đa khoa",
      hospital: selectedDoctorData?.hospital || "HealthCare+",
      time: selectedTime || "Chưa chọn",
      date: date?.toLocaleDateString("vi-VN") || "Chưa chọn",
      channel: channel === "offline" ? "Khám tại cơ sở" : "Tư vấn trực tuyến",
    }),
    [selectedDoctorData, selectedTime, date, channel, specialty],
  );

  function validateStepTwo() {
    const newErrors: string[] = [];
    if (!fullName.trim()) newErrors.push("Vui lòng nhập họ tên.");
    if (!PHONE_REGEX.test(phone.trim())) newErrors.push("Số điện thoại phải gồm đúng 10 chữ số.");
    if (!EMAIL_REGEX.test(email.trim())) newErrors.push("Email không hợp lệ.");
    if (!selectedDoctorData) newErrors.push("Vui lòng chọn bác sĩ.");
    if (!selectedTime) newErrors.push("Vui lòng chọn giờ khám.");
    if (!date) newErrors.push("Vui lòng chọn ngày khám.");
    setErrors(newErrors);
    return newErrors.length === 0;
  }

  async function handleConfirmBooking() {
    setErrors([]);
    setApiError(null);
    if (!validateStepTwo() || !date || !selectedDoctorData) return;

    const start = combineDateTime(date, selectedTime);
    const { first_name, last_name } = splitFullName(fullName);

    const payload = {
      patient: {
        first_name,
        last_name,
        contact_no: phone,
        email,
      },
      doctor_id: Number(selectedDoctorData.id),
      start_time: start.toISOString(),
      notes,
    };

    try {
      setSubmitting(true);
      const res = await fetch("/api/v1/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || "Đặt lịch thất bại, vui lòng thử lại.");
      }
      const data = await res.json();
      const appointmentId = Number(data.appointment_id ?? data.id ?? Date.now());
      const bookingCode = `HC-${String(appointmentId).padStart(6, "0")}`;

      persistBooking({
        appointmentId,
        bookingCode,
        status: data.status || "pending",
        patientName: fullName.trim(),
        email,
        phone,
        doctorName: summary.doctor,
        specialty: summary.specialty,
        hospital: summary.hospital,
        scheduledAt: start.toISOString(),
        channel: summary.channel,
        notes,
      });

      message.success("Đặt lịch thành công! HealthCare+ sẽ xác nhận trong ít phút.");
      onNavigate("booking-success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Đặt lịch thất bại";
      setApiError(msg);
      message.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  function handleGoNext() {
    if (!canProceedStep1) {
      message.error("Vui lòng chọn đầy đủ bác sĩ, ngày và giờ khám.");
      return;
    }
    setErrors([]);
    setApiError(null);
    setStep(2);
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <Badge variant="outline" className="tracking-wide uppercase">
            Đặt lịch khám
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-semibold leading-tight">Hoàn tất 3 bước để nhận lịch khám có email xác nhận</h2>
          <p className="text-muted-foreground">Thông tin của bạn được bảo mật và đồng bộ theo tiêu chuẩn HIPAA.</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          {[1, 2].map((idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step > idx ? "bg-blue-600 text-white" : step === idx ? "border-2 border-blue-500 text-blue-500" : "bg-muted text-muted-foreground"
                }`}
              >
                {step > idx ? <CheckCircle className="h-5 w-5" /> : idx}
              </div>
              <span className="text-sm text-muted-foreground">
                {idx === 1 && "Chọn bác sĩ & thời gian"}
                {idx === 2 && "Thông tin người khám"}
              </span>
              {idx < 2 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[3fr,2fr] gap-6">
          <Card className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Chuyên khoa</Label>
                <Select value={specialty} onValueChange={setSpecialty}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Tất cả chuyên khoa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả</SelectItem>
                    {SPECIALTIES.map((item) => (
                      <SelectItem key={item.id} value={item.name}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Khu vực</Label>
                <Select value={district} onValueChange={setDistrict}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Tất cả quận" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả</SelectItem>
                    {DISTRICTS.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="text-lg font-semibold">Bác sĩ đề xuất</h5>
                {loadingDoctors && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Spin size="small" /> Đang cập nhật
                  </div>
                )}
              </div>
              <div className="max-h-[320px] overflow-y-auto pr-1">
                {filteredDoctors.map((doc) => (
                  <label
                    key={doc.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border mb-3 cursor-pointer transition ${
                      selectedDoctor === doc.id ? "border-blue-600 bg-blue-500/5" : "hover:bg-muted"
                    }`}
                  >
                    <Input
                      type="radio"
                      className="w-4 h-4"
                      checked={selectedDoctor === doc.id}
                      onChange={() => setSelectedDoctor(doc.id)}
                    />
                    <Avatar className="w-12 h-12">
                      <AvatarFallback>{doc.name.split(" ").pop()?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium">{doc.name}</div>
                      <div className="text-sm text-muted-foreground">{doc.specialty}</div>
                      <p className="text-xs text-muted-foreground/80">{doc.hospital}</p>
                    </div>
                    <Badge variant="outline">{doc.district}</Badge>
                  </label>
                ))}
                {!loadingDoctors && filteredDoctors.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">Không tìm thấy bác sĩ phù hợp điều kiện lọc.</p>
                )}
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <Card className="p-6">
              <h5 className="mb-4">Chọn ngày/giờ</h5>
              <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
              <div className="grid grid-cols-3 gap-2 mt-4">
                {TIME_SLOTS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`p-2 rounded border text-sm ${
                      selectedTime === t ? "border-blue-600 bg-blue-500/10 text-blue-700" : "hover:bg-muted"
                    }`}
                    onClick={() => setSelectedTime(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h5 className="mb-4">Tóm tắt nhanh</h5>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" /> Bác sĩ: <b>{summary.doctor}</b>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" /> Ngày: <b>{summary.date}</b>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Giờ: <b>{summary.time}</b>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Cơ sở: <b>{summary.hospital}</b>
                </div>
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4" /> Kênh: <b>{summary.channel}</b>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {step === 1 && (
          <div className="mt-6 flex justify-end">
            <Button onClick={handleGoNext} disabled={!canProceedStep1} className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
              Tiếp tục
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="p-6">
              <h5 className="mb-4">Thông tin người đặt</h5>
              <div className="space-y-4">
                <div>
                  <Label>Họ và tên</Label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nguyễn Văn A" />
                </div>
                <div>
                  <Label>Số điện thoại</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="0123456789"
                    maxLength={10}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@domain.com" />
                </div>
                <div>
                  <Label>Kênh khám</Label>
                  <Select value={channel} onValueChange={(val: "offline" | "online") => setChannel(val)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Chọn kênh" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="offline">Khám tại cơ sở</SelectItem>
                      <SelectItem value="online">Tư vấn trực tuyến</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Ghi chú</Label>
                  <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Triệu chứng, yêu cầu đặc biệt..." />
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              <Card className="p-6">
                <h5 className="mb-4">Tóm tắt lịch hẹn</h5>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" /> Bác sĩ: <b>{summary.doctor}</b>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" /> Ngày: <b>{summary.date}</b>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Giờ: <b>{summary.time}</b>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Cơ sở: <b>{summary.hospital}</b>
                  </div>
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4" /> Kênh: <b>{summary.channel}</b>
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  {errors.length > 0 && (
                    <Card className="p-3 border-red-600/40 bg-red-500/5">
                      <p className="text-sm text-red-400">Vui lòng kiểm tra:</p>
                      <ul className="list-disc list-inside text-sm text-red-300">
                        {errors.map((err) => (
                          <li key={err}>{err}</li>
                        ))}
                      </ul>
                    </Card>
                  )}
                  {apiError && (
                    <Card className="p-3 border border-rose-500/40 bg-rose-500/5 text-sm text-rose-400">{apiError}</Card>
                  )}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setStep(1);
                        setErrors([]);
                        setApiError(null);
                      }}
                    >
                      Quay lại
                    </Button>
                    <Button
                      className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                      onClick={handleConfirmBooking}
                      disabled={submitting}
                    >
                      {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Xác nhận & nhận email
                    </Button>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="w-full text-sm">
                        Hướng dẫn chuẩn bị
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Chuẩn bị trước khi khám</DialogTitle>
                        <DialogDescription>Danh sách giấy tờ và lưu ý</DialogDescription>
                      </DialogHeader>
                      <ul className="list-disc list-inside text-sm space-y-2">
                        <li>CMND/CCCD và thẻ bảo hiểm (nếu có).</li>
                        <li>Kết quả xét nghiệm, đơn thuốc gần nhất.</li>
                        <li>Nhịn ăn 6h nếu làm xét nghiệm máu tổng quát.</li>
                      </ul>
                    </DialogContent>
                  </Dialog>
                </div>
              </Card>

              <Card className="p-6 space-y-4">
                <h5 className="text-sm font-semibold text-muted-foreground uppercase">Trạng thái lịch hẹn</h5>
                <div className="space-y-3">
                  {STATUS_GUIDE.map((item) => (
                    <div key={item.status} className={`rounded-xl p-3 text-sm ${item.tone}`}>
                      <p className="font-semibold">{item.label}</p>
                      <p className="text-xs opacity-90">{item.description}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
