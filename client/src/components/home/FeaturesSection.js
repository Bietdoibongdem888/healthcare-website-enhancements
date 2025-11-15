import { Calendar, Users, Heart, Shield } from "lucide-react";
import { Card } from "../ui/card";
const FEATURES = [
  {
    icon: <Calendar className="h-8 w-8" />,
    title: "\u0110\u1EB7t l\u1ECBch d\u1EC5 d\xE0ng",
    description: "\u0110\u1EB7t l\u1ECBch kh\xE1m b\u1EC7nh online nhanh ch\xF3ng, ti\u1EC7n l\u1EE3i ch\u1EC9 v\u1EDBi v\xE0i thao t\xE1c \u0111\u01A1n gi\u1EA3n"
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: "\u0110\u1ED9i ng\u0169 chuy\xEAn m\xF4n",
    description: "B\xE1c s\u0129 gi\xE0u kinh nghi\u1EC7m, t\u1EADn t\xE2m v\u1EDBi ngh\u1EC1, lu\xF4n \u0111\u1EB7t l\u1EE3i \xEDch b\u1EC7nh nh\xE2n l\xEAn h\xE0ng \u0111\u1EA7u"
  },
  {
    icon: <Heart className="h-8 w-8" />,
    title: "Ch\u0103m s\xF3c to\xE0n di\u1EC7n",
    description: "Theo d\xF5i s\u1EE9c kh\u1ECFe li\xEAn t\u1EE5c, t\u01B0 v\u1EA5n \u0111i\u1EC1u tr\u1ECB v\xE0 ch\u0103m s\xF3c sau kh\xE1m chu \u0111\xE1o"
  },
  {
    icon: <Shield className="h-8 w-8" />,
    title: "An to\xE0n & B\u1EA3o m\u1EADt",
    description: "Th\xF4ng tin s\u1EE9c kh\u1ECFe \u0111\u01B0\u1EE3c b\u1EA3o m\u1EADt tuy\u1EC7t \u0111\u1ED1i theo ti\xEAu chu\u1EA9n qu\u1ED1c t\u1EBF"
  }
];
function FeaturesSection() {
  return <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="mb-4">Tại sao chọn HealthCare+?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Chúng tôi cam kết mang đến dịch vụ y tế chất lượng cao với sự chăm sóc tận tâm
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.map((feature, index) => <Card key={index} className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center text-white mx-auto mb-6">
                {feature.icon}
              </div>
              <h5 className="mb-3">{feature.title}</h5>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>)}
        </div>
      </div>
    </section>;
}
export {
  FeaturesSection
};
