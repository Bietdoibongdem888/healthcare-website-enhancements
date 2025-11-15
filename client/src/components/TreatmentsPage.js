import { useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ArrowRight, Stethoscope, HeartPulse, Activity, ShieldCheck } from "lucide-react";
const TREATMENTS = [
  {
    id: "cardio",
    title: "Tim m\u1EA1ch chuy\xEAn s\xE2u",
    summary: "\u0110i\u1EC1u tr\u1ECB b\u1EC7nh m\u1EA1ch v\xE0nh, t\u0103ng huy\u1EBFt \xE1p, suy tim v\u1EDBi ph\xE1c \u0111\u1ED3 c\xE1 nh\xE2n h\xF3a.",
    symptoms: ["\u0110au t\u1EE9c ng\u1EF1c", "Kh\xF3 th\u1EDF khi ho\u1EA1t \u0111\u1ED9ng", "Tim \u0111\u1EADp nhanh"],
    services: ["Si\xEAu \xE2m tim 4D", "\u0110o \u0111i\u1EC7n tim Holter", "Can thi\u1EC7p \u0111\u1EB7t stent v\xE0nh"],
    recovery: ["Theo d\xF5i t\u1EEB xa 24/7", "Hu\u1EA5n luy\u1EC7n ph\u1EE5c h\u1ED3i ch\u1EE9c n\u0103ng tim", "T\u01B0 v\u1EA5n dinh d\u01B0\u1EE1ng tim m\u1EA1ch"]
  },
  {
    id: "neuro",
    title: "Th\u1EA7n kinh & \u0110\u1ED9t qu\u1EF5",
    summary: "Can thi\u1EC7p s\u1EDBm trong 4 gi\u1EDD \u0111\u1EA7u, ph\u1EE5c h\u1ED3i ch\u1EE9c n\u0103ng v\xE0 ph\xF2ng ng\u1EEBa t\xE1i ph\xE1t.",
    symptoms: ["T\xEA li\u1EC7t n\u1EEDa ng\u01B0\u1EDDi", "N\xF3i kh\xF3", "\u0110au \u0111\u1EA7u d\u1EEF d\u1ED9i"],
    services: ["CT/MRI n\xE3o", "Can thi\u1EC7p m\u1EA1ch n\xE3o", "\u0110i\u1EC7n n\xE3o \u0111\u1ED3"],
    recovery: ["Ph\u1EE5c h\u1ED3i ng\xF4n ng\u1EEF", "V\u1EADt l\xFD tr\u1ECB li\u1EC7u chuy\xEAn s\xE2u", "Theo d\xF5i nguy c\u01A1 t\xE1i ph\xE1t"]
  },
  {
    id: "obgyn",
    title: "S\u1EA3n - Ph\u1EE5 khoa to\xE0n di\u1EC7n",
    summary: "Ch\u0103m s\xF3c thai k\u1EF3 nguy c\u01A1 cao, \u0111i\u1EC1u tr\u1ECB hi\u1EBFm mu\u1ED9n v\xE0 ph\u1EABu thu\u1EADt n\u1ED9i soi.",
    symptoms: ["Mang thai nguy c\u01A1", "R\u1ED1i lo\u1EA1n n\u1ED9i ti\u1EBFt", "Hi\u1EBFm mu\u1ED9n"],
    services: ["S\xE0ng l\u1ECDc tr\u01B0\u1EDBc sinh NIPT", "IVF ph\u1ED1i h\u1EE3p AI", "N\u1ED9i soi t\u1EED cung/ bu\u1ED3ng tr\u1EE9ng"],
    recovery: ["Theo d\xF5i h\u1EADu s\u1EA3n", "T\u01B0 v\u1EA5n dinh d\u01B0\u1EE1ng m\u1EB9 v\xE0 b\xE9", "Ch\u01B0\u01A1ng tr\xECnh ch\u0103m s\xF3c sau sinh"]
  },
  {
    id: "ortho",
    title: "Ch\u1EA5n th\u01B0\u01A1ng ch\u1EC9nh h\xECnh",
    summary: "Thay kh\u1EDBp \xEDt x\xE2m l\u1EA5n, \u0111i\u1EC1u tr\u1ECB ch\u1EA5n th\u01B0\u01A1ng th\u1EC3 thao v\xE0 ph\u1EE5c h\u1ED3i v\u1EADn \u0111\u1ED9ng.",
    symptoms: ["\u0110au kh\u1EDBp k\xE9o d\xE0i", "Ch\u1EA5n th\u01B0\u01A1ng th\u1EC3 thao", "Tho\xE1i h\xF3a kh\u1EDBp"],
    services: ["N\u1ED9i soi t\xE1i t\u1EA1o d\xE2y ch\u1EB1ng", "Thay kh\u1EDBp th\u1EBF h\u1EC7 m\u1EDBi", "Ph\xF2ng lab ph\xE2n t\xEDch d\xE1ng ch\u1EA1y"],
    recovery: ["Ch\u01B0\u01A1ng tr\xECnh ph\u1EE5c h\u1ED3i 12 tu\u1EA7n", "\u1EE8ng d\u1EE5ng theo d\xF5i b\xE0i t\u1EADp", "Hu\u1EA5n luy\u1EC7n vi\xEAn c\xE1 nh\xE2n"]
  }
];
function TreatmentsPage({ onNavigate }) {
  const [selected, setSelected] = useState(TREATMENTS[0]);
  return <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-muted/20">
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
            {TREATMENTS.map((item) => <Card
    key={item.id}
    className={`p-4 cursor-pointer border-2 transition ${selected.id === item.id ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30" : "hover:border-blue-200"}`}
    onClick={() => setSelected(item)}
  >
                <div className="flex items-center gap-3">
                  <Stethoscope className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.summary.slice(0, 38)}...</p>
                  </div>
                </div>
              </Card>)}
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
                  {selected.symptoms.map((sym) => <li key={sym}>• {sym}</li>)}
                </ul>
              </Card>
              <Card className="p-4 bg-muted/40">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="h-5 w-5 text-emerald-600" />
                  <p className="font-medium">Dịch vụ nổi bật</p>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {selected.services.map((svc) => <li key={svc}>• {svc}</li>)}
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
                {selected.recovery.map((step) => <Badge key={step} variant="outline">
                    {step}
                  </Badge>)}
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
    </div>;
}
export {
  TreatmentsPage
};
