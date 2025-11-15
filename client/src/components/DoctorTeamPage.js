import { useMemo, useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Star, Award, MapPin } from "lucide-react";
import { DOCTORS } from "../constants/doctors";
import { DEPARTMENTS } from "../constants/departments";
function DoctorTeamPage({ onNavigate }) {
  const [department, setDepartment] = useState("all");
  const departments = useMemo(() => ["all", ...DEPARTMENTS.map((d) => d.name)], []);
  const doctors = useMemo(() => {
    if (department === "all") return DOCTORS;
    return DOCTORS.filter((doc) => {
      const deptName = DEPARTMENTS.find((d) => d.id === doc.departmentId)?.name;
      return deptName === department;
    });
  }, [department]);
  return <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-3">
          <Badge variant="outline">Đội ngũ bác sĩ</Badge>
          <h2 className="text-3xl font-semibold">Chuyên gia đầu ngành đồng hành cùng bạn</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Hơn 180 bác sĩ, giáo sư với kinh nghiệm quốc tế trong các lĩnh vực tim mạch, ung bướu, sản phụ khoa, nhi,
            thần kinh...
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {departments.map((dept) => <button
    key={dept}
    onClick={() => setDepartment(dept)}
    className={`px-4 py-1.5 rounded-full border text-sm transition ${department === dept ? "bg-blue-600 text-white border-blue-600" : "border-slate-700 text-muted-foreground"}`}
  >
              {dept === "all" ? "T\u1EA5t c\u1EA3" : dept}
            </button>)}
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {doctors.map((doctor) => {
    const deptName = DEPARTMENTS.find((d) => d.id === doctor.departmentId)?.name || doctor.specialty;
    return <Card key={doctor.id} className="p-5 border-slate-800/50 bg-gradient-to-br from-slate-950 to-slate-900">
              <div className="flex gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={doctor.avatar} />
                  <AvatarFallback className="bg-blue-600 text-white">
                    {doctor.name.split(" ").pop()?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4>{doctor.name}</h4>
                    <Badge variant="secondary">{deptName}</Badge>
                  </div>
                  <p className="text-sm text-blue-300">{doctor.specialty}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400" /> {doctor.rating} ({doctor.reviews} đánh giá)
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="h-4 w-4 text-emerald-400" /> {doctor.experience}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-cyan-400" /> {doctor.hospital}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {doctor.achievements.slice(0, 3).map((ach) => <Badge key={ach} variant="outline" className="text-xs">
                    {ach}
                  </Badge>)}
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onNavigate("doctors")}>
                  Xem lịch khám
                </Button>
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-500" onClick={() => onNavigate("booking")}>
                  Đặt lịch riêng
                </Button>
              </div>
            </Card>;
  })}
        </div>
      </div>
    </div>;
}
export {
  DoctorTeamPage
};
