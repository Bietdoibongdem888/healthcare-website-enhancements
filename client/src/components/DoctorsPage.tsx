import { useEffect, useMemo, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Star, MapPin, Search, Award, Stethoscope } from "lucide-react";
import { SPECIALTIES_WITH_ALL } from "../constants/specialties";
import { DISTRICTS_WITH_ALL } from "../constants/districts";
import { DOCTORS } from "../constants/doctors";
import { safeApi } from "../lib/api";
import { DEPARTMENTS } from "../constants/departments";

interface DoctorsPageProps {
  onNavigate: (page: string) => void;
}

interface ApiDoctor {
  doctor_id: number;
  first_name: string;
  last_name: string;
  specialty: string;
  hospital: string;
  district: string;
  rating: number;
  reviews: number;
  department_id?: number | null;
  department_name?: string | null;
}

export function DoctorsPage({ onNavigate }: DoctorsPageProps) {
  const heroImage =
    "https://images.unsplash.com/photo-1631815588090-d5d8a0990fdb?auto=format&fit=crop&w=1600&q=80";
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [apiDoctors, setApiDoctors] = useState<ApiDoctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await safeApi<ApiDoctor[]>("/doctors?limit=60");
      if (data) {
        setApiDoctors(data);
      }
      setLoading(false);
    })();
  }, []);

  const combinedDoctors = useMemo(() => {
    if (apiDoctors.length === 0) {
      return DOCTORS.map((doc) => ({
        id: doc.id,
        name: doc.name,
        specialty: doc.specialty,
        hospital: doc.hospital,
        district: doc.district,
        rating: doc.rating,
        reviews: doc.reviews,
        achievements: doc.achievements,
        avatar: doc.avatar,
        department: DEPARTMENTS.find((d) => d.id === doc.departmentId)?.name || doc.specialty,
        experience: doc.experience,
      }));
    }
    return apiDoctors.map((doc) => ({
      id: String(doc.doctor_id),
      name: `${doc.first_name} ${doc.last_name}`,
      specialty: doc.specialty,
      hospital: doc.hospital || "HealthCare+",
      district: doc.district || "Hà Nội",
      rating: doc.rating || 4.8,
      reviews: doc.reviews || 0,
      achievements: ["Chứng nhận Bộ Y tế", "Ứng dụng công nghệ HealthCare+"],
      avatar: "",
      department: doc.department_name || "Tổng quát",
      experience: "10+ năm",
    }));
  }, [apiDoctors]);

  const filteredDoctors = combinedDoctors.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === "all" || doctor.specialty === selectedSpecialty;
    const matchesDistrict = selectedDistrict === "all" || doctor.district === selectedDistrict;
    const matchesDepartment = selectedDepartment === "all" || doctor.department === selectedDepartment;

    return matchesSearch && matchesSpecialty && matchesDistrict && matchesDepartment;
  });

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-slate-950/60">
      <div className="max-w-6xl mx-auto space-y-8">
        <Card
          className="p-8 border-none shadow-2xl text-white relative overflow-hidden"
          style={{ backgroundImage: `linear-gradient(120deg, rgba(4,47,136,.92), rgba(14,116,144,.9)), url(${heroImage})`, backgroundSize: "cover", backgroundPosition: "center" }}
        >
          <div className="max-w-3xl space-y-4">
            <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/30">Đội ngũ bác sĩ</Badge>
            <h1 className="text-3xl font-semibold">Chuyên gia đầu ngành đồng hành từng giai đoạn điều trị</h1>
            <p className="text-white/80">
              Hơn 180 bác sĩ, giáo sư với kinh nghiệm quốc tế trong tim mạch, ung bướu, sản phụ khoa, nhi, thần kinh…
              Đặt lịch riêng để nhận phác đồ cá nhân hóa và được chăm sóc tiếp nối qua HealthCare+.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" className="bg-white/15 hover:bg-white/25 text-white" onClick={() => onNavigate("booking")}>
                Đặt lịch nhanh
              </Button>
              <Button variant="outline" className="text-white border-white/40" onClick={() => onNavigate("doctor-team")}>
                Xem đội ngũ theo khoa
              </Button>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 w-40 bg-white/10 blur-3xl" />
        </Card>

        <Card className="p-6 bg-slate-900/70 border-slate-800">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm bác sĩ, chuyên khoa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn chuyên khoa" />
              </SelectTrigger>
              <SelectContent>
                {SPECIALTIES_WITH_ALL.map((specialty) => (
                  <SelectItem key={specialty} value={specialty === "Tất cả" ? "all" : specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn quận" />
              </SelectTrigger>
              <SelectContent>
                {DISTRICTS_WITH_ALL.map((district) => (
                  <SelectItem key={district} value={district === "Tất cả" ? "all" : district}>
                    {district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn khoa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả khoa</SelectItem>
                {DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept.id} value={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            {loading ? "Đang tải dữ liệu..." : `Tìm thấy ${filteredDoctors.length} bác sĩ phù hợp`}
          </p>
          <Button variant="outline" size="sm" className="border-blue-500/40 text-blue-200" onClick={() => onNavigate("doctor-team")}>
            Đội ngũ theo khoa
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {filteredDoctors.map((doctor) => (
            <Card
              key={doctor.id}
              className="p-6 hover:shadow-xl transition-all border-slate-800/60 bg-slate-900/80 backdrop-blur"
            >
              <div className="flex items-start gap-4 mb-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={doctor.avatar} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                    {doctor.name.split(" ").pop()?.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h6 className="mb-1">{doctor.name}</h6>
                  <p className="text-sm text-blue-400 mb-1 flex items-center gap-1">
                    <Stethoscope className="h-3 w-3" /> {doctor.specialty}
                  </p>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{doctor.rating.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">({doctor.reviews} đánh giá)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Award className="h-4 w-4" />
                  <span>{doctor.experience}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {doctor.hospital}, {doctor.district}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline">{doctor.department}</Badge>
                {doctor.achievements.slice(0, 2).map((achievement) => (
                  <Badge key={achievement} variant="outline" className="text-xs">
                    {achievement}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 border-slate-700 text-slate-100" onClick={() => onNavigate("doctor-team")}>
                  Xem đội ngũ
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-gradient-to-r from-amber-400 via-rose-500 to-fuchsia-600 text-white shadow-lg shadow-rose-500/20 border border-white/10 hover:scale-[1.01]"
                  onClick={() => onNavigate("booking")}
                >
                  Đặt lịch riêng
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {!loading && filteredDoctors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Không tìm thấy bác sĩ phù hợp. Vui lòng thử bộ lọc khác.</p>
          </div>
        )}
      </div>
    </div>
  );
}
