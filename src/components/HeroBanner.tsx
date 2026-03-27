// HeroBanner Component - Auto-rotating promotional banner for homepage
// Features smooth transitions, dot indicators, and prev/next arrows

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { heroBanners } from "@/data/products";

interface HeroBannerProps {
  onCategorySelect?: (category: string) => void;
}

const HeroBanner = ({ onCategorySelect }: HeroBannerProps) => {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrent((index + heroBanners.length) % heroBanners.length);
      setTimeout(() => setIsTransitioning(false), 400);
    },
    [isTransitioning]
  );

  const next = useCallback(() => goTo(current + 1), [goTo, current]);
  const prev = useCallback(() => goTo(current - 1), [goTo, current]);

  // Auto-advance every 5 seconds
  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const banner = heroBanners[current];

  return (
    <div className="relative w-full overflow-hidden" style={{ height: "340px" }}>
      {/* Background gradient + overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${banner.gradient} transition-all duration-500`}
      />
      {/* Faded product image on the right */}
      <div
        className="absolute right-0 top-0 h-full w-1/2 opacity-20 bg-cover bg-center"
        style={{ backgroundImage: `url(${banner.image})` }}
      />
      {/* Left-to-right fade mask */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/10 to-transparent" />

      {/* Content */}
      <div
        className={`relative h-full flex flex-col justify-center px-8 md:px-16 transition-opacity duration-400 ${
          isTransitioning ? "opacity-0" : "opacity-100"
        }`}
      >
        <p className="text-amazon-orange font-semibold text-sm mb-2 tracking-widest uppercase">
          Limited Time Offer
        </p>
        <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 max-w-lg leading-tight">
          {banner.title}
        </h2>
        <p className="text-white/80 text-sm md:text-base mb-6 max-w-sm">
          {banner.subtitle}
        </p>
        <button
          onClick={() => onCategorySelect?.(banner.category)}
          className="btn-amazon-primary inline-flex items-center gap-2 w-fit text-sm px-6 py-2.5"
        >
          {banner.cta}
        </button>
      </div>

      {/* Prev arrow */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 transition-colors z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft size={22} />
      </button>

      {/* Next arrow */}
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 transition-colors z-10"
        aria-label="Next slide"
      >
        <ChevronRight size={22} />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {heroBanners.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? "w-6 h-2.5 bg-amazon-orange"
                : "w-2.5 h-2.5 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroBanner;
