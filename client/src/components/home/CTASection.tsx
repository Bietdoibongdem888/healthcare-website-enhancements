import { Button } from "../ui/button";

interface CTASectionProps {
  onNavigate: (page: string) => void;
}

export function CTASection({ onNavigate }: CTASectionProps) {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="mb-6">Sẵn sàng chăm sóc sức khỏe của bạn?</h2>
        <p className="text-xl text-muted-foreground mb-8">
          Đặt lịch khám ngay hôm nay để được bác sĩ tư vấn và chăm sóc tận tình
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700"
            onClick={() => onNavigate("booking")}
          >
            Đặt lịch khám
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => onNavigate("doctors")}
          >
            Tìm bác sĩ
          </Button>
        </div>
      </div>
    </section>
  );
}
