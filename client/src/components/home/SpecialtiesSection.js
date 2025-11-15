import { Stethoscope, Activity, Heart, Award, CheckCircle, Star, Shield } from "lucide-react";
import { Card } from "../ui/card";
const SPECIALTIES_WITH_ICONS = [
  { name: "N\u1ED9i Khoa", icon: <Stethoscope className="h-6 w-6" /> },
  { name: "Ngo\u1EA1i Khoa", icon: <Activity className="h-6 w-6" /> },
  { name: "S\u1EA3n - Nhi", icon: <Heart className="h-6 w-6" /> },
  { name: "C\u1EADn l\xE2m s\xE0ng \u2013 h\u1ED7 tr\u1EE3", icon: <Award className="h-6 w-6" /> },
  { name: "C\u01A1 x\u01B0\u01A1ng kh\u1EDBp", icon: <CheckCircle className="h-6 w-6" /> },
  { name: "Y h\u1ECDc c\u1ED5 truy\u1EC1n", icon: <Star className="h-6 w-6" /> },
  { name: "Dinh d\u01B0\u1EE1ng", icon: <Heart className="h-6 w-6" /> },
  { name: "T\xE2m th\u1EA7n", icon: <Shield className="h-6 w-6" /> }
];
function SpecialtiesSection({ onNavigate }) {
  return <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="mb-4">Chuyên khoa</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Đa dạng các chuyên khoa với đội ngũ bác sĩ giỏi và trang thiết bị hiện đại
          </p>
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {SPECIALTIES_WITH_ICONS.map((specialty, index) => <Card
    key={index}
    className="p-6 text-center hover:shadow-lg transition-all cursor-pointer hover:border-blue-600"
    onClick={() => onNavigate("doctors")}
  >
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-950/20 flex items-center justify-center text-blue-600 mx-auto mb-4">
                {specialty.icon}
              </div>
              <p className="font-medium">{specialty.name}</p>
            </Card>)}
        </div>
      </div>
    </section>;
}
export {
  SpecialtiesSection
};
