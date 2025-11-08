import { useMemo, useState } from "react";
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
  Printer,
  Download,
  Info,
} from "lucide-react";
import { SPECIALTIES } from "../constants/specialties";
import { DISTRICTS } from "../constants/districts";
import { DOCTORS } from "../constants/doctors";
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

const PHONE_REGEX = /^\d{10}$/;

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
  const [channel, setChannel] = useState("offline");
  const [errors, setErrors] = useState<string[]>([]);
  const [bookingCode, setBookingCode] = useState<string | null>(null);

  const filteredDoctors = DOCTORS.filter(
    (doc) =>
      (!specialty || doc.specialty === specialty) &&
      (!district || doc.district === district),
  );

  const selectedDoctorData = DOCTORS.find((doc) => doc.id === selectedDoctor);

  const canProceedStep1 = Boolean(selectedDoctor && selectedTime && date);

  const summary = useMemo(
    () => ({
      doctor: selectedDoctorData?.name || "Chưa chọn",
      specialty: selectedDoctorData?.specialty || specialty,
      hospital: selectedDoctorData?.hospital || "HealthCare+",
      time: selectedTime,
      date: date?.toLocaleDateString("vi-VN"),
      channel: channel === "offline" ? "Tại cơ sở" : "Tư vấn trực tuyến",
    }),
    [selectedDoctorData, selectedTime, date, channel, specialty],
  );

  function validateStepTwo() {
    const newErrors: string[] = [];
    if (!fullName.trim()) newErrors.push("Vui lòng nhập họ tên.");
    if (!PHONE_REGEX.test(phone.trim())) newErrors.push("Số điện thoại phải gồm đúng 10 chữ số.");
    if (!email.includes("@")) newErrors.push("Email không hợp lệ.");
    if (!selectedDoctorData) newErrors.push("Vui lòng chọn bác sĩ.");
    if (!selectedTime) newErrors.push("Vui lòng chọn giờ khám.");
    setErrors(newErrors);
    return newErrors.length === 0;
  }

  function handleConfirmBooking() {
    const ok = validateStepTwo();
    if (!ok) return;
    setBookingCode(`HC${Math.floor(Math.random() * 900000 + 100000)}`);
    setStep(3);
  }

  function handleDownload() {
    alert("Phiếu xác nhận sẽ được tải xuống trong phiên bản production.");
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 text-center space-y-2">
          <Badge variant="outline">Đặt lịch khám</Badge>
          <h2>Hoàn tất 3 bước để nhận lịch khám có xác nhận email</h2>
          <p className="text-muted-foreground">Thông tin của bạn được bảo mật theo tiêu chuẩn HIPAA.</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-center flex-wrap gap-4">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step > idx
                      ? "bg-blue-600 text-white"
                      : step === idx
                      ? "border-2 border-blue-500 text-blue-500"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step > idx ? <CheckCircle className="h-5 w-5" /> : idx}
                </div>
                <span className="text-sm text-muted-foreground">
                  {idx === 1 && "Chọn bác sĩ & thời gian"}
                  {idx === 2 && "Thông tin người đặt"}
                  {idx === 3 && "Xác nhận & in phiếu"}
                </span>
                {idx !== 3 && <ChevronRight className="h-5 w-5 text-slate-500" />}
              </div>
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <Card className="p-6 mb-6">
                <h5 className="mb-4">Chọn chuyên khoa & khu vực</h5>
                <div className="space-y-4">
                  <div>
                    <Label>Chuyên khoa</Label>
                    <Select value={specialty} onValueChange={setSpecialty}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Chọn chuyên khoa" />
                      </SelectTrigger>
                      <SelectContent>
                        {SPECIALTIES.map((spec) => (
                          <SelectItem key={spec} value={spec}>
                            {spec}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Quận</Label>
                    <Select value={district} onValueChange={setDistrict}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Chọn quận" />
                      </SelectTrigger>
                      <SelectContent>
                        {DISTRICTS.map((dist) => (
                          <SelectItem key={dist} value={dist}>
                            {dist}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h5 className="mb-4">Chọn bác sĩ</h5>
                <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2">
                  {filteredDoctors.map((doc) => (
                    <label
                      key={doc.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition ${
                        doc.id === selectedDoctor ? "border-blue-600 bg-blue-500/10" : "hover:bg-muted"
                      }`}
                    >
                      <input
                        type="radio"
                        name="doctor"
                        className="hidden"
                        value={doc.id}
                        onChange={() => setSelectedDoctor(doc.id)}
                      />
                      <Avatar className="w-12 h-12">
                        <AvatarFallback>{doc.name.split(" ").pop()?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium">{doc.name}</div>
                        <div className="text-sm text-muted-foreground">{doc.specialty}</div>
                      </div>
                      <Badge variant="outline">{doc.hospital}</Badge>
                    </label>
                  ))}
                </div>
              </Card>
            </div>

            <div>
              <Card className="p-6 mb-6">
                <h5 className="mb-4">Chọn ngày</h5>
                <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
              </Card>
              <Card className="p-6">
                <h5 className="mb-4">Chọn giờ</h5>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map((t) => (
                    <button
                      key={t}
                      className={`p-2 rounded border text-sm ${
                        selectedTime === t ? "border-blue-600 bg-blue-500/10" : "hover:bg-muted"
                      }`}
                      onClick={() => setSelectedTime(t)}
                      type="button"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </Card>
            </div>
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
                  <Select value={channel} onValueChange={setChannel}>
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
                  <Input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Triệu chứng, yêu cầu đặc biệt..."
                  />
                </div>
              </div>
            </Card>

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
              <div className="mt-6 space-y-2">
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
                <Button variant="outline" onClick={() => setStep(1)}>
                  Quay lại
                </Button>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white" onClick={handleConfirmBooking}>
                  Xác nhận & nhận email
                </Button>
              </div>
            </Card>
          </div>
        )}

        {step === 3 && (
          <Card className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Lịch hẹn đã được xác nhận</p>
                <h4 className="mt-1">{summary.doctor}</h4>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">Mã đặt lịch: {bookingCode}</Badge>
                  <Badge variant="outline">{summary.channel}</Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-2" /> In phiếu
                </Button>
                <Button variant="outline" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" /> Tải PDF
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-6 text-sm">
              <div className="p-4 rounded-xl border border-slate-800">
                <p className="text-muted-foreground text-xs">Thời gian</p>
                <p className="font-semibold">{summary.date} • {summary.time}</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-800">
                <p className="text-muted-foreground text-xs">Cơ sở</p>
                <p className="font-semibold">{summary.hospital}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => onNavigate("medical-records")}>Xem hồ sơ y tế</Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Hướng dẫn chuẩn bị</Button>
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
              <Button variant="ghost" onClick={() => setStep(1)}>
                Đặt lịch mới
              </Button>
            </div>
          </Card>
        )}

        {step === 1 && (
          <div className="mt-6 flex justify-end">
            <Button
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
            >
              Tiếp tục
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
