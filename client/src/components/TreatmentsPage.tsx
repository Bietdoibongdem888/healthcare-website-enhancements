import { useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ArrowRight, Stethoscope, HeartPulse, Activity, ShieldCheck } from "lucide-react";

interface TreatmentsPageProps {
  onNavigate: (page: string, options?: any) => void;
}

const TREATMENTS = [
  {
    id: "cardio",
    title: "Tim mạch chuyên sâu",
    summary: "Điều trị bệnh mạch vành, tăng huyết áp, suy tim với phác đồ cá nhân hóa.",
    symptoms: ["Đau tức ngực", "Khó thở khi hoạt động", "Tim đập nhanh"],
    services: ["Siêu âm tim 4D", "Đo điện tim Holter", "Can thiệp đặt stent vành"],
    recovery: ["Theo dõi từ xa 24/7", "Huấn luyện phục hồi chức năng tim", "Tư vấn dinh dưỡng tim mạch"],
  },
  {
    id: "neuro",
    title: "Thần kinh & Đột quỵ",
    summary: "Can thiệp sớm trong 4 giờ đầu, phục hồi chức năng và phòng ngừa tái phát.",
    symptoms: ["Tê liệt nửa người", "Nói khó", "Đau đầu dữ dội"],
    services: ["CT/MRI não", "Can thiệp mạch não", "Điện não đồ"],
    recovery: ["Phục hồi ngôn ngữ", "Vật lý trị liệu chuyên sâu", "Theo dõi nguy cơ tái phát"],
  },
  {
    id: "obgyn",
    title: "Sản - Phụ khoa toàn diện",
    summary: "Chăm sóc thai kỳ nguy cơ cao, điều trị hiếm muộn và phẫu thuật nội soi.",
    symptoms: ["Mang thai nguy cơ", "Rối loạn nội tiết", "Hiếm muộn"],
    services: ["Sàng lọc trước sinh NIPT", "IVF phối hợp AI", "Nội soi tử cung/ buồng trứng"],
    recovery: ["Theo dõi hậu sản", "Tư vấn dinh dưỡng mẹ và bé", "Chương trình chăm sóc sau sinh"],
  },
  {
    id: "ortho",
    title: "Chấn thương chỉnh hình",
    summary: "Thay khớp ít xâm lấn, điều trị chấn thương thể thao và phục hồi vận động.",
    symptoms: ["Đau khớp kéo dài", "Chấn thương thể thao", "Thoái hóa khớp"],
    services: ["Nội soi tái tạo dây chằng", "Thay khớp thế hệ mới", "Phòng lab phân tích dáng chạy"],
    recovery: ["Chương trình phục hồi 12 tuần", "Ứng dụng theo dõi bài tập", "Huấn luyện viên cá nhân"],
  },
];

export function TreatmentsPage({ onNavigate }: TreatmentsPageProps) {
  const [selected, setSelected] = useState(TREATMENTS[0]);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-muted/20">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 text-center">
          <Badge className="mb-3" variant="outline">
            Bệnh điều trị
          </Badge>
          <h2 className="mb-3">Giải pháp chuyên sâu cho từng nhóm bệnh</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Mỗi bệnh lý đều có phác đồ riêng với hội đồng chuyên gia đa chuyên khoa, kết hợp thiết bị hiện đại và chăm sóc sau điều trị.
          </p>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          <div className="space-y-4">
            {TREATMENTS.map((item) => (
              <Card
                key={item.id}
                className={`p-4 cursor-pointer border-2 transition ${
                  selected.id === item.id ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30" : "hover:border-blue-200"
                }`}
                onClick={() => setSelected(item)}
              >
                <div className="flex items-center gap-3">
                  <Stethoscope className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.summary.slice(0, 38)}...</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-6 space-y-6">
            <div>
              <p className="text-sm uppercase tracking-wide text-blue-600 mb-2">Phác đồ cá nhân hóa</p>
              <h3 className="mb-2">{selected.title}</h3>
              <p className="text-muted-foreground">{selected.summary}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-4 bg-muted/40">
                <div className="flex items-center gap-2 mb-3">
                  <HeartPulse className="h-5 w-5 text-rose-600" />
                  <p className="font-medium">Triệu chứng thường gặp</p>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {selected.symptoms.map((sym) => (
                    <li key={sym}>• {sym}</li>
                  ))}
                </ul>
              </Card>
              <Card className="p-4 bg-muted/40">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="h-5 w-5 text-emerald-600" />
                  <p className="font-medium">Dịch vụ nổi bật</p>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {selected.services.map((svc) => (
                    <li key={svc}>• {svc}</li>
                  ))}
                </ul>
              </Card>
            </div>

            <Card className="p-4 border-dashed border-blue-200 bg-blue-50 dark:bg-blue-950/20">
              <div className="flex items-center gap-3 mb-2">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                <p className="font-medium">Chương trình phục hồi</p>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Theo dõi từ xa, tư vấn dinh dưỡng, nhật ký triệu chứng và tái khám định kỳ giúp bạn an tâm phục hồi.
              </p>
              <div className="flex flex-wrap gap-2">
                {selected.recovery.map((step) => (
                  <Badge key={step} variant="outline">
                    {step}
                  </Badge>
                ))}
              </div>
            </Card>

            <div className="flex flex-wrap gap-3 justify-end">
              <Button variant="outline" onClick={() => onNavigate("doctors")}>
                Đội ngũ bác sĩ liên quan
              </Button>
              <Button
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                onClick={() => onNavigate("booking", { specialty: selected.id })}
              >
                Đặt lịch tư vấn <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
