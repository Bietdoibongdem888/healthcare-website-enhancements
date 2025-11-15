import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Cpu, Activity, ShieldCheck, Brain, ChevronRight } from "lucide-react";
import { DEPARTMENTS } from "../constants/departments";
const TECHNOLOGIES = [
  {
    icon: Cpu,
    title: "Ph\xF2ng m\u1ED5 Hybrid",
    description: "K\u1EBFt h\u1EE3p MRI, CT v\xE0 robot h\u1ED7 tr\u1EE3, r\xFAt ng\u1EAFn 35% th\u1EDDi gian ph\u1EABu thu\u1EADt v\xE0 gi\u1EA3m ch\u1EA3y m\xE1u.",
    detail: "Khai th\xE1c d\u1EEF li\u1EC7u th\u1EDDi gian th\u1EF1c \u0111\u1EC3 \u0111i\u1EC1u ch\u1EC9nh \u0111\u01B0\u1EDDng m\u1ED5 t\u1EEBng milimet."
  },
  {
    icon: Brain,
    title: "AI \u0111\u1ECDc h\xECnh \u1EA3nh",
    description: "AI h\u1ECDc s\xE2u ph\xE1t hi\u1EC7n b\u1EA5t th\u01B0\u1EDDng tim m\u1EA1ch, ung b\u01B0\u1EDBu v\u1EDBi \u0111\u1ED9 ch\xEDnh x\xE1c 96,4%.",
    detail: "T\u1EF1 \u0111\u1ED9ng g\u1EEDi c\u1EA3nh b\xE1o cho b\xE1c s\u0129 v\xE0 g\u1EE3i \xFD ph\xE1c \u0111\u1ED3 ph\xF9 h\u1EE3p."
  },
  {
    icon: ShieldCheck,
    title: "Trung t\xE2m \u0111i\u1EC1u khi\u1EC3n ICU t\u1EEB xa",
    description: "Theo d\xF5i sinh hi\u1EC7u li\xEAn t\u1EE5c, h\u1ED7 tr\u1EE3 quy\u1EBFt \u0111\u1ECBnh \u0111i\u1EC1u tr\u1ECB kh\u1EA9n c\u1EA5p trong 60 gi\xE2y.",
    detail: "K\u1EBFt n\u1ED1i v\u1EDBi gia \u0111\xECnh b\u1EC7nh nh\xE2n qua \u1EE9ng d\u1EE5ng b\u1EA3o m\u1EADt."
  }
];
const PIPELINE = [
  {
    step: "1. T\u01B0 v\u1EA5n \u0111a chuy\xEAn khoa",
    detail: "AI s\xE0ng l\u1ECDc h\u1ED3 s\u01A1, \u0111\u1EC1 xu\u1EA5t h\u1ED9i ch\u1EA9n v\u1EDBi b\xE1c s\u0129 \u0111\u1EA7u ng\xE0nh li\xEAn quan."
  },
  {
    step: "2. L\u1EADp k\u1EBF ho\u1EA1ch \u0111i\u1EC1u tr\u1ECB",
    detail: "M\xF4 ph\u1ECFng 3D, d\u1EF1 \u0111o\xE1n bi\u1EBFn ch\u1EE9ng v\xE0 chu\u1EA9n h\xF3a checklist an to\xE0n."
  },
  {
    step: "3. Ch\u0103m s\xF3c h\u1EADu \u0111i\u1EC1u tr\u1ECB",
    detail: "\u1EE8ng d\u1EE5ng HealthCare+ Care ghi nh\u1EADn d\u1EA5u hi\u1EC7u sinh t\u1ED3n, g\u1EEDi c\u1EA3nh b\xE1o t\xE1i kh\xE1m."
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
