import { Stethoscope, Activity, Heart, Award, CheckCircle, Star, Shield } from "lucide-react";
import { Card } from "../ui/card";

const SPECIALTIES_WITH_ICONS = [
  { name: "Nội Khoa", icon: <Stethoscope className="h-6 w-6" /> },
  { name: "Ngoại Khoa", icon: <Activity className="h-6 w-6" /> },
  { name: "Sản - Nhi", icon: <Heart className="h-6 w-6" /> },
  { name: "Cận lâm sàng – hỗ trợ", icon: <Award className="h-6 w-6" /> },
  { name: "Cơ xương khớp", icon: <CheckCircle className="h-6 w-6" /> },
  { name: "Y học cổ truyền", icon: <Star className="h-6 w-6" /> },
  { name: "Dinh dưỡng", icon: <Heart className="h-6 w-6" /> },
  { name: "Tâm thần", icon: <Shield className="h-6 w-6" /> },
];

interface SpecialtiesSectionProps {
  onNavigate: (page: string) => void;
}

export function SpecialtiesSection({ onNavigate }: SpecialtiesSectionProps) {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="mb-4">Chuyên khoa</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Đa dạng các chuyên khoa với đội ngũ bác sĩ giỏi và trang thiết bị hiện đại
          </p>
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {SPECIALTIES_WITH_ICONS.map((specialty, index) => (
            <Card
              key={index}
              className="p-6 text-center hover:shadow-lg transition-all cursor-pointer hover:border-blue-600"
              onClick={() => onNavigate("doctors")}
            >
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-950/20 flex items-center justify-center text-blue-600 mx-auto mb-4">
                {specialty.icon}
              </div>
              <p className="font-medium">{specialty.name}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
