import { useMemo, useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "./ui/dialog";
import { Star, Quote, HeartPulse } from "lucide-react";
const CATEGORIES = ["T\u1EA5t c\u1EA3", "Tim m\u1EA1ch", "Ung b\u01B0\u1EDBu", "S\u1EA3n ph\u1EE5 khoa", "Nhi"];
const STORIES = [
  {
    id: 1,
    name: "Ch\xFA Quang - 62 tu\u1ED5i",
    treatment: "Thay van tim \xEDt x\xE2m l\u1EA5n",
    department: "Tim m\u1EA1ch",
    summary: "Sau 4 tu\u1EA7n ph\u1EE5c h\u1ED3i, ch\xFA tr\u1EDF l\u1EA1i \u0111i b\u1ED9 5km v\xE0 ki\u1EC3m so\xE1t huy\u1EBFt \xE1p \u1ED5n \u0111\u1ECBnh.",
    detail: "Nh\u1EDD ph\xF2ng m\u1ED5 hybrid v\xE0 AI d\u1EF1 b\xE1o bi\u1EBFn ch\u1EE9ng, ca thay van ch\u1EC9 k\xE9o d\xE0i 95 ph\xFAt. Ch\xFA \u0111\u01B0\u1EE3c g\u1EAFn thi\u1EBFt b\u1ECB ghi nh\u1EADn nh\u1ECBp tim li\xEAn t\u1EE5c v\xE0 \u0111\u1ED9i ng\u0169 theo d\xF5i t\u1EEB xa 24/7.",
    rating: 4.9,
    metrics: [
      { label: "Th\u1EDDi gian n\u1EB1m vi\u1EC7n", value: "3 ng\xE0y" },
      { label: "T\xE1i kh\xE1m", value: "Sau 14 ng\xE0y" },
      { label: "Ch\u1EA5t l\u01B0\u1EE3ng s\u1ED1ng", value: "+35%" }
    ]
  },
  {
    id: 2,
    name: "Gia \u0111\xECnh ch\u1ECB H\u1ED3ng",
    treatment: "\u0110i\u1EC1u tr\u1ECB ung th\u01B0 v\xFA giai \u0111o\u1EA1n s\u1EDBm",
    department: "Ung b\u01B0\u1EDBu",
    summary: "Ph\xE1c \u0111\u1ED3 tailor-made gi\xFAp gi\u1EA3m 60% t\xE1c d\u1EE5ng ph\u1EE5, t\xF3c v\u1EABn gi\u1EEF 70%.",
    detail: "K\u1EBFt h\u1EE3p AI \u0111\u1ECDc MRI v\xE0 h\u1ED9i ch\u1EA9n \u0111a chuy\xEAn khoa, ph\u1EABu thu\u1EADt b\u1EA3o t\u1ED3n \u0111\u01B0\u1EE3c th\u1EF1c hi\u1EC7n c\xF9ng robot h\u1ED7 tr\u1EE3. Sau m\u1ED5, ch\u01B0\u01A1ng tr\xECnh t\xE2m l\xFD tr\u1ECB li\u1EC7u v\xE0 dinh d\u01B0\u1EE1ng \u0111\u1ED3ng h\xE0nh li\xEAn t\u1EE5c.",
    rating: 5,
    metrics: [
      { label: "Th\u1EDDi gian \u0111i\u1EC1u tr\u1ECB", value: "8 tu\u1EA7n" },
      { label: "T\xE1c d\u1EE5ng ph\u1EE5", value: "-60%" },
      { label: "M\u1EE9c \u0111\u1ED9 h\xE0i l\xF2ng", value: "98%" }
    ]
  },
  {
    id: 3,
    name: "B\xE9 Minh 6 tu\u1ED5i",
    treatment: "\u0110i\u1EC1u tr\u1ECB hen ph\u1EBF qu\u1EA3n",
    department: "Nhi",
    summary: "S\u1ED1 c\u01A1n hen gi\u1EA3m t\u1EEB 5 c\xF2n 1 l\u1EA7n/th\xE1ng nh\u1EDD ch\u01B0\u01A1ng tr\xECnh qu\u1EA3n tr\u1ECB k\xEDch ho\u1EA1t.",
    detail: "\u1EE8ng d\u1EE5ng HealthCare+ Kids nh\u1EAFc thu\u1ED1c, \u0111o ph\u1ED5i t\u1EA1i nh\xE0 v\xE0 g\u1EEDi c\u1EA3nh b\xE1o khi ch\u1EC9 s\u1ED1 l\u1EC7ch chu\u1EA9n. Gia \u0111\xECnh nh\u1EADn t\u01B0 v\u1EA5n dinh d\u01B0\u1EE1ng, b\xE0i t\u1EADp h\xEDt th\u1EDF qua video call h\xE0ng tu\u1EA7n.",
    rating: 4.8,
    metrics: [
      { label: "C\u01A1n hen/th\xE1ng", value: "-80%" },
      { label: "T\xE1i c\u1EA5p c\u1EE9u", value: "0" },
      { label: "Tu\xE2n th\u1EE7 thu\u1ED1c", value: "95%" }
    ]
  }
];
function TestimonialsPage({ onNavigate }) {
  const [filter, setFilter] = useState("T\u1EA5t c\u1EA3");
  const filteredStories = useMemo(() => {
    if (filter === "T\u1EA5t c\u1EA3") return STORIES;
    return STORIES.filter((story) => story.department === filter);
  }, [filter]);
  return <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-slate-950/60">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <Badge variant="outline">Cảm nhận khách hàng</Badge>
          <h2 className="text-3xl font-semibold">Hơn 18.000 hành trình hồi phục thành công</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Mỗi dòng cảm ơn là động lực để HealthCare+ tiếp tục cải tiến dịch vụ, ứng dụng công nghệ mới và đồng hành
            cùng gia đình bạn.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          {CATEGORIES.map((cat) => <button
    key={cat}
    onClick={() => setFilter(cat)}
    className={`px-4 py-1.5 rounded-full border text-sm transition ${filter === cat ? "bg-blue-600 text-white border-blue-600" : "border-slate-700 text-muted-foreground"}`}
  >
              {cat}
            </button>)}
        </div>

        <div className="grid gap-6">
          {filteredStories.map((story) => <Card key={story.id} className="p-6 border-slate-800/50 bg-gradient-to-br from-slate-950 to-slate-900">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Quote className="h-4 w-4 text-blue-400" />
                    <p className="font-semibold">{story.name}</p>
                  </div>
                  <p className="text-sm text-blue-300">{story.treatment}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">{story.department}</Badge>
                    <div className="flex items-center gap-1 text-yellow-400 text-sm">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> {story.rating}
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => onNavigate("booking")}>
                  Đặt lịch với bác sĩ liên quan
                </Button>
              </div>

              <p className="text-sm text-slate-200 mt-4">{story.summary}</p>

              <div className="grid sm:grid-cols-3 gap-3 mt-4">
                {story.metrics.map((item) => <div key={item.label} className="rounded-xl border border-slate-800 px-3 py-2 text-sm">
                    <p className="text-muted-foreground text-xs">{item.label}</p>
                    <p className="font-semibold mt-1">{item.value}</p>
                  </div>)}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <HeartPulse className="h-4 w-4 text-rose-400" /> Được xác thực bởi hệ thống khảo sát hậu điều trị
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="secondary">
                      Xem chi tiết
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>{story.treatment}</DialogTitle>
                      <DialogDescription>{story.name}</DialogDescription>
                    </DialogHeader>
                    <p className="text-sm leading-relaxed">{story.detail}</p>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      {story.metrics.map((item) => <Card key={item.label} className="p-3 bg-muted/40">
                          <p className="text-xs text-muted-foreground">{item.label}</p>
                          <p className="text-sm font-semibold">{item.value}</p>
                        </Card>)}
                    </div>
                    <Button className="mt-4" onClick={() => onNavigate("doctor-team")}>
                      Chọn bác sĩ theo chuyên khoa
                    </Button>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>)}
        </div>

        <Card className="p-6 border-slate-800/60 bg-slate-900/80">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-widest text-blue-400">Hotline trải nghiệm</p>
              <h4 className="mt-1 mb-2">Nhận tư vấn cá nhân hóa dựa trên câu chuyện của bạn</h4>
              <p className="text-sm text-muted-foreground">
                Đội ngũ chuyên viên sẽ giúp bạn chọn bác sĩ, chuẩn bị hồ sơ và đặt lịch ưu tiên.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => onNavigate("support")}>
                Trung tâm hỗ trợ
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-500" onClick={() => onNavigate("booking")}>
                Đặt lịch ngay
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>;
}
export {
  TestimonialsPage
};
