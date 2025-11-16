import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Cpu, Activity, ShieldCheck, Brain, ChevronRight } from "lucide-react";
import { DEPARTMENTS } from "../constants/departments";
const TECHNOLOGIES = [
  {
    icon: Cpu,
    title: "Phòng mổ Hybrid",
    description: "Kết hợp MRI, CT và robot hỗ trợ, rút ngắn 35% thời gian phẫu thuật và giảm chảy máu.",
    detail: "Khai thác dữ liệu thời gian thực để điều chỉnh đường mổ từng milimet."
  },
  {
    icon: Brain,
    title: "AI đọc hình ảnh",
    description: "AI học sâu phát hiện bất thường tim mạch, ung bướu với độ chính xác 96,4%.",
    detail: "Tự động gửi cảnh báo cho bác sĩ và gợi ý phác đồ phù hợp."
  },
  {
    icon: ShieldCheck,
    title: "Trung tâm điều khiển ICU từ xa",
    description: "Theo dõi sinh hiệu liên tục, hỗ trợ quyết định điều trị khẩn cấp trong 60 giây.",
    detail: "Kết nối với gia đình bệnh nhân qua ứng dụng bảo mật."
  }
];
const PIPELINE = [
  {
    step: "1. Tư vấn đa chuyên khoa",
    detail: "AI sàng lọc hồ sơ, đề xuất hội chẩn với bác sĩ đầu ngành liên quan."
  },
  {
    step: "2. Lập kế hoạch điều trị",
    detail: "Mô phỏng 3D, dự đoán biến chứng và chuẩn hóa checklist an toàn."
  },
  {
    step: "3. Chăm sóc hậu điều trị",
    detail: "Ứng dụng HealthCare+ Care ghi nhận dấu hiệu sinh tồn, gửi cảnh báo tái khám."
  }
];
function TechnologyPage({ onNavigate }) {
  return <div className="min-h-screen bg-muted/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="text-center space-y-4">
          <Badge variant="outline">Công nghệ hiện đại</Badge>
          <h2 className="text-3xl font-semibold">Trung tâm đổi mới y khoa HealthCare+</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Hạ tầng tiêu chuẩn quốc tế với phòng mổ hybrid, AI hỗ trợ chuẩn đoán, nền tảng chăm sóc tiếp nối giúp mọi
            ca bệnh đều được cá nhân hóa.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {TECHNOLOGIES.map((tech) => <Card key={tech.title} className="p-6 border-slate-800/40 bg-background/70">
              <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center mb-4">
                <tech.icon className="h-6 w-6 text-blue-500" />
              </div>
              <h4 className="mb-2">{tech.title}</h4>
              <p className="text-sm text-muted-foreground mb-3">{tech.description}</p>
              <p className="text-xs text-slate-400">{tech.detail}</p>
            </Card>)}
        </div>

        <Card className="p-6 border-slate-800/50 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-widest text-blue-400">Quy trình trải nghiệm</p>
              <h3 className="mt-2 mb-3">Theo sát bệnh nhân trong suốt hành trình điều trị</h3>
              <p className="text-muted-foreground max-w-2xl">
                Mỗi giai đoạn đều có checklist an toàn, tư vấn dinh dưỡng và cảnh báo chủ động. Trợ lý AI lưu nhật ký
                triệu chứng để bác sĩ cập nhật phác đồ tức thì.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => onNavigate("doctor-team")}>
                Đội ngũ bác sĩ <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-500" onClick={() => onNavigate("booking")}>
                Đặt lịch khám ngay
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mt-8">
            {PIPELINE.map((item) => <div key={item.step} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <p className="text-sm font-semibold text-blue-400">{item.step}</p>
                <p className="text-sm text-muted-foreground mt-2">{item.detail}</p>
              </div>)}
          </div>
        </Card>

        <Card className="p-6 border-slate-800/40">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <h4>Các chuyên khoa đang sử dụng công nghệ mới</h4>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DEPARTMENTS.map((dept) => <div key={dept.id} className="p-4 rounded-xl border border-slate-800/60 bg-background/50">
                  <p className="text-sm font-semibold">{dept.name}</p>
                  <p className="text-xs text-muted-foreground mt-1 mb-2">{dept.description}</p>
                  <div className="flex flex-wrap gap-1 text-[11px] text-blue-300">
                    {dept.services.slice(0, 3).map((svc) => <span key={svc} className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30">
                        {svc}
                      </span>)}
                  </div>
                </div>)}
            </div>
          </div>
        </Card>
      </div>
    </div>;
}
export {
  TechnologyPage
};
