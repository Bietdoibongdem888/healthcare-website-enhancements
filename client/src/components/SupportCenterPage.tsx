import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { PhoneCall, MessageCircle, BookOpen, FileText } from "lucide-react";

interface SupportCenterPageProps {
  onNavigate: (page: string) => void;
}

const FAQS = [
  {
    question: "Làm sao để tải phiếu khám hoặc đơn thuốc?",
    answer:
      "Vào mục “Hồ sơ sức khỏe” → chọn tab tương ứng → bấm “Xem chi tiết” để mở modal, tại đây bạn có thể tải PDF hoặc gửi email.",
  },
  {
    question: "Tôi muốn thay đổi lịch hẹn đã xác nhận?",
    answer:
      "Mở Lịch hẹn khám → nhấn “Xem chi tiết” → chọn “Hủy/Đổi lịch”. Bạn sẽ nhận được email xác nhận ngay sau khi hoàn tất.",
  },
  {
    question: "Tư vấn từ xa hoạt động như thế nào?",
    answer:
      "Hotline sẽ tạo phòng họp bảo mật, bác sĩ truy cập hồ sơ của bạn và gửi đơn thuốc điện tử sau buổi tư vấn.",
  },
];

const RESOURCES = [
  { icon: BookOpen, title: "Hướng dẫn sử dụng cổng khách hàng", file: "PDF 2.1MB" },
  { icon: FileText, title: "Quy trình chuẩn bị trước phẫu thuật", file: "Checklist 1.2MB" },
  { icon: MessageCircle, title: "Câu hỏi thường gặp về bảo hiểm", file: "FAQ 0.8MB" },
];

export function SupportCenterPage({ onNavigate }: SupportCenterPageProps) {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-slate-950/70">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <Badge variant="outline">Trung tâm hỗ trợ</Badge>
          <h2 className="text-3xl font-semibold">Chúng tôi luôn sẵn sàng 24/7</h2>
          <p className="text-muted-foreground">
            Hotline, chat AI, điều dưỡng trực và kho tài liệu từng bước giúp bạn sử dụng HealthCare+ dễ dàng.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <Card className="p-6 border-slate-800/60 bg-gradient-to-br from-slate-950 to-slate-900">
            <div className="flex items-center gap-3">
              <PhoneCall className="h-10 w-10 text-blue-400" />
              <div>
                <p className="text-sm text-blue-300 uppercase tracking-widest">Hotline</p>
                <h4 className="text-xl">1900 633 682</h4>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Điều dưỡng trực 24/7 – hỗ trợ đặt lịch gấp, cấp cứu từ xa, hướng dẫn nhập viện.
            </p>
            <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
              <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800">Ưu tiên ca cấp cứu</div>
              <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800">Theo dõi tình trạng</div>
            </div>
            <Button className="mt-4" onClick={() => window.open("tel:1900633682")}>
              Gọi ngay
            </Button>
          </Card>

          <Card className="p-6 border-slate-800/60">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-10 w-10 text-emerald-400" />
              <div>
                <p className="text-sm text-emerald-300 uppercase tracking-widest">Chat AI / người trực</p>
                <h4 className="text-xl">Trợ lý HealthCare+</h4>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Sử dụng widget góc phải màn hình để hỏi về phác đồ, công nghệ hoặc chuyển sang điều dưỡng thật.
            </p>
            <Button variant="outline" className="mt-4" onClick={() => onNavigate("booking")}>
              Xem hướng dẫn đặt lịch
            </Button>
          </Card>
        </div>

        <Card className="p-6 border-slate-800/60">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-blue-400" />
            <h4>Tài liệu nhanh</h4>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {RESOURCES.map((res) => (
              <div key={res.title} className="p-4 rounded-xl border border-slate-800/50 bg-slate-900/60">
                <res.icon className="h-6 w-6 text-blue-400" />
                <p className="mt-3 font-medium">{res.title}</p>
                <p className="text-xs text-muted-foreground">{res.file}</p>
                <Button variant="link" className="px-0 text-blue-400 text-sm">
                  Tải về
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 border-slate-800/60">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="h-5 w-5 text-blue-400" />
            <h4>Câu hỏi thường gặp</h4>
          </div>
          <Accordion type="single" collapsible className="space-y-2">
            {FAQS.map((faq, idx) => (
              <AccordionItem key={faq.question} value={`faq-${idx}`} className="border border-slate-800 rounded-lg px-4">
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      </div>
    </div>
  );
}
