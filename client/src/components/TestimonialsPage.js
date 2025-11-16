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
const CATEGORIES = ["Tất cả", "Tim mạch", "Ung bướu", "Sản phụ khoa", "Nhi"];
const STORIES = [
  {
    id: 1,
    name: "Chú Quang - 62 tuổi",
    treatment: "Thay van tim ít xâm lấn",
    department: "Tim mạch",
    summary: "Sau 4 tuần phục hồi, chú trở lại đi bộ 5km và kiểm soát huyết áp ổn định.",
    detail: "Nhờ phòng mổ hybrid và AI dự báo biến chứng, ca thay van chỉ kéo dài 95 phút. Chú được gắn thiết bị ghi nhận nhịp tim liên tục và đội ngũ theo dõi từ xa 24/7.",
    rating: 4.9,
    metrics: [
      { label: "Thời gian nằm viện", value: "3 ngày" },
      { label: "Tái khám", value: "Sau 14 ngày" },
      { label: "Chất lượng sống", value: "+35%" }
    ]
  },
  {
    id: 2,
    name: "Gia đình chị Hồng",
    treatment: "Điều trị ung thư vú giai đoạn sớm",
    department: "Ung bướu",
    summary: "Phác đồ tailor-made giúp giảm 60% tác dụng phụ, tóc vẫn giữ 70%.",
    detail: "Kết hợp AI đọc MRI và hội chẩn đa chuyên khoa, phẫu thuật bảo tồn được thực hiện cùng robot hỗ trợ. Sau mổ, chương trình tâm lý trị liệu và dinh dưỡng đồng hành liên tục.",
    rating: 5,
    metrics: [
      { label: "Thời gian điều trị", value: "8 tuần" },
      { label: "Tác dụng phụ", value: "-60%" },
      { label: "Mức độ hài lòng", value: "98%" }
    ]
  },
  {
    id: 3,
    name: "Bé Minh 6 tuổi",
    treatment: "Điều trị hen phế quản",
    department: "Nhi",
    summary: "Số cơn hen giảm từ 5 còn 1 lần/tháng nhờ chương trình quản trị kích hoạt.",
    detail: "Ứng dụng HealthCare+ Kids nhắc thuốc, đo phổi tại nhà và gửi cảnh báo khi chỉ số lệch chuẩn. Gia đình nhận tư vấn dinh dưỡng, bài tập hít thở qua video call hàng tuần.",
    rating: 4.8,
    metrics: [
      { label: "Cơn hen/tháng", value: "-80%" },
      { label: "Tái cấp cứu", value: "0" },
      { label: "Tuân thủ thuốc", value: "95%" }
    ]
  }
];
function TestimonialsPage({ onNavigate }) {
  const [filter, setFilter] = useState("Tất cả");
  const filteredStories = useMemo(() => {
    if (filter === "Tất cả") return STORIES;
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
