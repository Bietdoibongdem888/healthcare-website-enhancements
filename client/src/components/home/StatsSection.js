const STATS = [
  { number: "50+", label: "B\xE1c s\u0129 chuy\xEAn khoa" },
  { number: "10,000+", label: "B\u1EC7nh nh\xE2n tin t\u01B0\u1EDFng" },
  { number: "8", label: "Chuy\xEAn khoa" },
  { number: "24/7", label: "H\u1ED7 tr\u1EE3 kh\u1EA9n c\u1EA5p" }
];
function StatsSection() {
  return <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 text-center">
          {STATS.map((stat, index) => <div key={index}>
              <h2 className="mb-2">{stat.number}</h2>
              <p className="text-xl">{stat.label}</p>
            </div>)}
        </div>
      </div>
    </section>;
}
export {
  StatsSection
};
