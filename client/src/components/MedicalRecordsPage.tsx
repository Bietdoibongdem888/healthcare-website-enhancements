import { useMemo, useState } from "react";
import { FileText, Activity, Calendar, Pill, ClipboardList, User, Hospital, Printer } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface MedicalRecordsPageProps {
  onNavigate: (page: string) => void;
}

const FACILITY_DATA = [
  { id: 1, name: "HealthCare+ Times City", doctor: "BS. Trần Quốc Huy", specialty: "Tim mạch" },
  { id: 2, name: "HealthCare+ Keangnam", doctor: "ThS.BS. Vũ Mai Anh", specialty: "Ung bướu" },
];

const HISTORY = [
  {
    id: 11,
    department: "Tim mạch",
    doctor: "BS. Nguyễn Duy",
    date: "12/10/2025",
    summary: "Tái khám sau thay van",
    detail: "Siêu âm tim định kỳ, chỉnh thuốc Metoprolol và kiểm tra INR.",
  },
  {
    id: 12,
    department: "Ung bướu",
    doctor: "PGS. Phạm Khánh",
    date: "05/09/2025",
    summary: "Xạ trị kết hợp AI",
    detail: "Đánh giá đáp ứng sau 8 buổi xạ trị, chuyển sang giai đoạn giảm liều.",
  },
];

const APPOINTMENTS = [
  {
    id: 101,
    status: "Sắp diễn ra",
    doctor: "BS. Lê Minh",
    department: "Thần kinh",
    time: "09:30 • 22/11/2025",
    location: "HealthCare+ Times City",
  },
  {
    id: 102,
    status: "Hoàn thành",
    doctor: "BS. Lưu Thu",
    department: "Cơ xương khớp",
    time: "15:00 • 02/10/2025",
    location: "HealthCare+ Keangnam",
  },
];

const PRESCRIPTIONS = [
  {
    id: 901,
    title: "Đơn thuốc hậu phẫu tim",
    doctor: "BS. Trần Quốc Huy",
    date: "15/10/2025",
    meds: ["Eliquis 5mg x 2", "Perindopril 5mg"],
  },
  {
    id: 902,
    title: "Kết quả xét nghiệm máu",
    doctor: "BS. Nguyễn Phượng",
    date: "18/09/2025",
    meds: ["Báo cáo PDF kèm biểu đồ AI"],
  },
];

export function MedicalRecordsPage({ onNavigate }: MedicalRecordsPageProps) {
  const [facilities, setFacilities] = useState(FACILITY_DATA);
  const [facilityDialog, setFacilityDialog] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<typeof HISTORY[0] | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<typeof APPOINTMENTS[0] | null>(null);
  const [selectedPrescription, setSelectedPrescription] = useState<typeof PRESCRIPTIONS[0] | null>(null);
  const [facilityForm, setFacilityForm] = useState({ name: "", doctor: "", specialty: "" });

  const summaryStats = useMemo(
    () => [
      { label: "Lịch hẹn đang mở", value: APPOINTMENTS.filter((a) => a.status === "Sắp diễn ra").length },
      { label: "Hồ sơ y tế", value: HISTORY.length },
      { label: "Đơn thuốc đang dùng", value: PRESCRIPTIONS.length },
    ],
    [],
  );

  function handleDownload(type: string) {
    alert(`Tệp ${type} sẽ được tải trong phiên bản chính thức.`);
  }

  function handlePrint() {
    window.print();
  }

  function handleAddFacility() {
    if (!facilityForm.name || !facilityForm.doctor) return;
    setFacilities((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: facilityForm.name,
        doctor: facilityForm.doctor,
        specialty: facilityForm.specialty,
      },
    ]);
    setFacilityForm({ name: "", doctor: "", specialty: "" });
    setFacilityDialog(false);
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-8">
          <h2 className="mb-2">Hồ sơ sức khỏe</h2>
          <p className="text-muted-foreground">Quản lý thông tin cá nhân, lịch sử khám và đơn thuốc trên cùng một nơi.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {summaryStats.map((stat) => (
            <Card key={stat.label} className="p-4 border-slate-800/50 bg-slate-950/60">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-semibold mt-2">{stat.value}</p>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="health-profile" className="w-full">
          <TabsList className="w-full justify-start mb-6 flex-wrap h-auto">
            <TabsTrigger value="health-profile">Hồ sơ y tế</TabsTrigger>
            <TabsTrigger value="history">Lịch sử khám bệnh</TabsTrigger>
            <TabsTrigger value="appointments">Lịch hẹn khám</TabsTrigger>
            <TabsTrigger value="prescriptions">Đơn thuốc & Xét nghiệm</TabsTrigger>
          </TabsList>

          <TabsContent value="health-profile">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Activity className="h-5 w-5 text-blue-500" />
                  <h5>Thông tin sức khỏe cơ bản</h5>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between border rounded-lg px-3 py-2">
                    <span className="text-muted-foreground">Chiều cao</span>
                    <b>170 cm</b>
                  </div>
                  <div className="flex items-center justify-between border rounded-lg px-3 py-2">
                    <span className="text-muted-foreground">Huyết áp</span>
                    <b>120/80 mmHg</b>
                  </div>
                  <div className="flex items-center justify-between border rounded-lg px-3 py-2">
                    <span className="text-muted-foreground">Nhịp tim</span>
                    <b>72 bpm</b>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-6" onClick={() => onNavigate("booking")}>
                  Cập nhật sau lần khám kế tiếp
                </Button>
              </Card>

              <Card className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Hospital className="h-5 w-5 text-purple-400" />
                  <h5>Bác sĩ/Cơ sở đã liên kết</h5>
                </div>
                <div className="space-y-3">
                  {facilities.map((facility) => (
                    <div key={facility.id} className="border rounded-xl px-4 py-3">
                      <p className="font-medium">{facility.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {facility.doctor} • {facility.specialty}
                      </p>
                    </div>
                  ))}
                </div>
                <Dialog open={facilityDialog} onOpenChange={setFacilityDialog}>
                  <DialogTrigger asChild>
                    <Button className="w-full">Thêm bác sĩ/cơ sở</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Thêm bác sĩ hoặc cơ sở</DialogTitle>
                      <DialogDescription>Điền thông tin để đồng bộ hồ sơ.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                      <div>
                        <Label>Tên cơ sở</Label>
                        <Input value={facilityForm.name} onChange={(e) => setFacilityForm((p) => ({ ...p, name: e.target.value }))} />
                      </div>
                      <div>
                        <Label>Bác sĩ phụ trách</Label>
                        <Input value={facilityForm.doctor} onChange={(e) => setFacilityForm((p) => ({ ...p, doctor: e.target.value }))} />
                      </div>
                      <div>
                        <Label>Chuyên khoa</Label>
                        <Input value={facilityForm.specialty} onChange={(e) => setFacilityForm((p) => ({ ...p, specialty: e.target.value }))} />
                      </div>
                    </div>
                    <Button className="mt-4" onClick={handleAddFacility}>
                      Lưu liên kết
                    </Button>
                  </DialogContent>
                </Dialog>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="grid gap-4">
              {HISTORY.map((record) => (
                <Card key={record.id} className="p-5 border-slate-800/60">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h5>{record.department}</h5>
                      <p className="text-sm text-muted-foreground">
                        {record.date} • {record.doctor}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => setSelectedHistory(record)}>
                            Xem chi tiết
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{selectedHistory?.summary || record.summary}</DialogTitle>
                            <DialogDescription>{selectedHistory?.date || record.date}</DialogDescription>
                          </DialogHeader>
                          <p className="text-sm">{selectedHistory?.detail || record.detail}</p>
                          <Button className="mt-4" onClick={() => handleDownload("history")}>
                            Tải file PDF
                          </Button>
                        </DialogContent>
                      </Dialog>
                      <Button size="sm" variant="outline" onClick={handlePrint}>
                        In phiếu
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{record.summary}</p>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="appointments">
            <div className="grid gap-4">
              {APPOINTMENTS.map((appt) => (
                <Card key={appt.id} className="p-5 border-slate-800/60">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h5>{appt.doctor}</h5>
                      <p className="text-sm text-muted-foreground">
                        {appt.department} • {appt.time}
                      </p>
                    </div>
                    <Badge variant={appt.status === "Sắp diễn ra" ? "default" : "outline"}>{appt.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{appt.location}</p>
                  <div className="flex gap-2 mt-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedAppointment(appt)}>
                          Xem chi tiết
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Lịch hẹn với {selectedAppointment?.doctor || appt.doctor}</DialogTitle>
                          <DialogDescription>{selectedAppointment?.time || appt.time}</DialogDescription>
                        </DialogHeader>
                        <p className="text-sm">Địa điểm: {selectedAppointment?.location || appt.location}</p>
                        <p className="text-sm mt-2">
                          Khi cần huỷ lịch, hãy bấm “Huỷ lịch” hoặc liên hệ hotline 1900 633 682.
                        </p>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="sm" onClick={() => alert("Lịch đã được huỷ và gửi email xác nhận.")}>
                      Hủy lịch
                    </Button>
                    <Button size="sm" onClick={() => onNavigate("booking")}>
                      Đặt lịch mới
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="prescriptions">
            <div className="grid gap-4">
              {PRESCRIPTIONS.map((pres) => (
                <Card key={pres.id} className="p-5 border-slate-800/60">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5>{pres.title}</h5>
                      <p className="text-sm text-muted-foreground">
                        {pres.date} • {pres.doctor}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => setSelectedPrescription(pres)}>
                            Xem chi tiết
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{selectedPrescription?.title || pres.title}</DialogTitle>
                            <DialogDescription>{selectedPrescription?.date || pres.date}</DialogDescription>
                          </DialogHeader>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            {(selectedPrescription?.meds || pres.meds).map((med) => (
                              <li key={med}>{med}</li>
                            ))}
                          </ul>
                          <div className="flex gap-2 mt-4">
                            <Button onClick={() => handleDownload("prescription")}>Tải về</Button>
                            <Button variant="outline" onClick={handlePrint}>
                              <Printer className="h-4 w-4 mr-2" /> In đơn
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button size="sm" variant="outline" onClick={() => handleDownload("prescription")}>
                        Xem đầy đủ
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
