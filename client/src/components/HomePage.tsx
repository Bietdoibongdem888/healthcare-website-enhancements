import { Button } from "./ui/button";
import { HeroCarousel } from "./home/HeroCarousel";
import { FeaturesSection } from "./home/FeaturesSection";
import { SpecialtiesSection } from "./home/SpecialtiesSection";
import { StatsSection } from "./home/StatsSection";
import { CTASection } from "./home/CTASection";

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const experienceImage =
    "https://images.unsplash.com/photo-1504439468489-c8920d796a29?auto=format&fit=crop&w=1600&q=80";
  return (
    <div className="min-h-screen">
      <HeroCarousel onNavigate={onNavigate} />
      <FeaturesSection />
      <SpecialtiesSection onNavigate={onNavigate} />
      <StatsSection />
      <div className="max-w-6xl mx-auto px-4 py-12 grid gap-4 md:grid-cols-3">
        <button
          onClick={() => onNavigate("treatments")}
          className="p-5 text-left rounded-2xl border border-white/15 bg-gradient-to-br from-slate-900 to-slate-800 text-white hover:border-cyan-400/40 transition shadow-lg"
        >
          <p className="text-sm text-cyan-300 uppercase tracking-widest">Bệnh điều trị</p>
          <h4 className="mt-2 mb-2 text-xl font-semibold">Phác đồ cá nhân hóa</h4>
          <p className="text-sm text-white/80">
            Xem lộ trình chăm sóc tim mạch, ung bướu, sản phụ khoa cùng đội ngũ chuyên gia.
          </p>
        </button>
        <button
          onClick={() => onNavigate("technology")}
          className="p-5 text-left rounded-2xl border border-white/15 bg-gradient-to-br from-slate-900 to-slate-800 text-white hover:border-cyan-400/40 transition shadow-lg"
        >
          <p className="text-sm text-cyan-300 uppercase tracking-widest">Công nghệ hiện đại</p>
          <h4 className="mt-2 mb-2 text-xl font-semibold">Phòng mổ hybrid & AI</h4>
          <p className="text-sm text-white/80">Khám phá cách HealthCare+ ứng dụng AI và robot vào điều trị.</p>
        </button>
        <button
          onClick={() => onNavigate("testimonials")}
          className="p-5 text-left rounded-2xl border border-white/15 bg-gradient-to-br from-slate-900 to-slate-800 text-white hover:border-cyan-400/40 transition shadow-lg"
        >
          <p className="text-sm text-cyan-300 uppercase tracking-widest">Cảm nhận khách hàng</p>
          <h4 className="mt-2 mb-2 text-xl font-semibold">18.000+ hành trình hồi phục</h4>
          <p className="text-sm text-white/80">
            Nghe lại câu chuyện và kinh nghiệm thực tế từ các gia đình HealthCare+.
          </p>
        </button>
      </div>
      <section
        className="relative max-w-6xl mx-auto px-6 py-16 mb-12 rounded-3xl overflow-hidden text-white shadow-2xl"
        style={{
          backgroundImage: `linear-gradient(120deg, rgba(15,23,42,.9), rgba(6,182,212,.6)), url(${experienceImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-2xl space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-white/80">Trải nghiệm HealthCare+</p>
          <h2 className="text-3xl font-semibold">Không chỉ là khám bệnh – là hành trình sống khỏe chủ động</h2>
          <p className="text-white/80">
            Từ lúc đặt lịch đến giai đoạn hồi phục, bạn luôn có đội ngũ điều dưỡng, bác sĩ và trợ lý AI đồng hành.
            Mọi kết quả xét nghiệm, đơn thuốc và chỉ dẫn đều được đồng bộ tức thì trên hồ sơ số.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" className="bg-white/20 text-white hover:bg-white/30" onClick={() => onNavigate("medical-records")}>
              Quản lý hồ sơ
            </Button>
            <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white" onClick={() => onNavigate("support")}>
              Nhận tư vấn ngay
            </Button>
          </div>
        </div>
      </section>
      <CTASection onNavigate={onNavigate} />
    </div>
  );
}
