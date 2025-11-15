import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { CAROUSEL_ITEMS } from "../../constants/carouselItems";
function HeroCarousel({
  onNavigate
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(
        (prev) => (prev + 1) % CAROUSEL_ITEMS.length
      );
    }, 4e3);
    return () => clearInterval(timer);
  }, []);
  const nextSlide = () => {
    setCurrentSlide(
      (prev) => (prev + 1) % CAROUSEL_ITEMS.length
    );
  };
  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + CAROUSEL_ITEMS.length) % CAROUSEL_ITEMS.length
    );
  };
  return <section className="relative h-[600px] overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-600">
      <AnimatePresence mode="wait">
        <motion.div
    key={currentSlide}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}
    className="absolute inset-0"
  >
          <div
    className="absolute inset-0 bg-cover bg-center"
    style={{
      backgroundImage: `url(${CAROUSEL_ITEMS[currentSlide].image})`
    }}
  >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-cyan-900/90" />
          </div>

          <div className="relative h-full flex items-center justify-center px-4">
            <div className="max-w-4xl text-center text-white">
              <motion.h1
    className="mb-6"
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay: 0.2 }}
  >
                {CAROUSEL_ITEMS[currentSlide].title}
              </motion.h1>
              <motion.p
    className="text-xl mb-8"
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay: 0.3 }}
  >
                {CAROUSEL_ITEMS[currentSlide].description}
              </motion.p>
              <motion.div
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay: 0.4 }}
  >
                <Button
    size="lg"
    className="bg-white text-blue-600 hover:bg-gray-100"
    onClick={() => onNavigate("booking")}
  >
                  Đặt lịch khám ngay
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {
    /* Navigation Buttons */
  }
      <button
    onClick={prevSlide}
    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition-all"
  >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
    onClick={nextSlide}
    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition-all"
  >
        <ChevronRight className="h-6 w-6" />
      </button>

      {
    /* Dots Indicator */
  }
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {CAROUSEL_ITEMS.map((_, index) => <button
    key={index}
    onClick={() => setCurrentSlide(index)}
    className={`w-3 h-3 rounded-full transition-all ${currentSlide === index ? "bg-white w-8" : "bg-white/50 hover:bg-white/75"}`}
  />)}
      </div>
    </section>;
}
export {
  HeroCarousel
};
