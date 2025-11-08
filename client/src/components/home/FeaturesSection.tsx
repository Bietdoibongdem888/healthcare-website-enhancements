import { Calendar, Users, Heart, Shield } from "lucide-react";
import { Card } from "../ui/card";

const FEATURES = [
  {
    icon: <Calendar className="h-8 w-8" />,
    title: "Đặt lịch dễ dàng",
    description: "Đặt lịch khám bệnh online nhanh chóng, tiện lợi chỉ với vài thao tác đơn giản",
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: "Đội ngũ chuyên môn",
    description: "Bác sĩ giàu kinh nghiệm, tận tâm với nghề, luôn đặt lợi ích bệnh nhân lên hàng đầu",
  },
  {
    icon: <Heart className="h-8 w-8" />,
    title: "Chăm sóc toàn diện",
    description: "Theo dõi sức khỏe liên tục, tư vấn điều trị và chăm sóc sau khám chu đáo",
  },
  {
    icon: <Shield className="h-8 w-8" />,
    title: "An toàn & Bảo mật",
    description: "Thông tin sức khỏe được bảo mật tuyệt đối theo tiêu chuẩn quốc tế",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="mb-4">Tại sao chọn HealthCare+?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Chúng tôi cam kết mang đến dịch vụ y tế chất lượng cao với sự chăm sóc tận tâm
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.map((feature, index) => (
            <Card key={index} className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center text-white mx-auto mb-6">
                {feature.icon}
              </div>
              <h5 className="mb-3">{feature.title}</h5>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
