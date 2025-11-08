const STATS = [
  { number: "50+", label: "Bác sĩ chuyên khoa" },
  { number: "10,000+", label: "Bệnh nhân tin tưởng" },
  { number: "8", label: "Chuyên khoa" },
  { number: "24/7", label: "Hỗ trợ khẩn cấp" },
];

export function StatsSection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 text-center">
          {STATS.map((stat, index) => (
            <div key={index}>
              <h2 className="mb-2">{stat.number}</h2>
              <p className="text-xl">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
