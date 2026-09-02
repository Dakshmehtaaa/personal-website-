// Source: 21st.dev — "3D coverflow carousel"
// Kept here for reference only. This site is plain HTML/CSS/JS with no build
// step, so the effect was re-implemented in vanilla CSS + JS instead of
// installing React/Tailwind/shadcn. See:
//   hobbies.html -> .coverflow markup
//   style.css    -> "COVERFLOW" section
//   script.js    -> "Coverflow carousel" block

"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";

const ChevronLeftIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

export interface CarouselItem {
  tag?: string;
  titleLine1: string;
  titleLine2?: string;
  desc?: string;
  img: string;
  ctaText?: string;
  ctaUrl?: string;
}

export interface CoverFlowCarouselProps {
  items?: CarouselItem[];
  sectionLabel?: string;
  autoplay?: boolean;
  autoplayDelay?: number;
  className?: string;
  onCtaClick?: (item: CarouselItem) => void;
}

export function CoverFlowCarousel({
  items = [],
  sectionLabel = "BEST SELLERS",
  autoplay = true,
  autoplayDelay = 5000,
  className = "",
  onCtaClick,
}: CoverFlowCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef(0);
  const total = items.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = (idx: number) => setCurrentIndex(idx % total);

  useEffect(() => {
    if (!autoplay || isHovered || total <= 1) return;
    const interval = setInterval(nextSlide, autoplayDelay);
    return () => clearInterval(interval);
  }, [autoplay, autoplayDelay, isHovered, nextSlide, total]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 45) {
      if (diff < 0) nextSlide();
      else prevSlide();
    }
  };

  if (!items || items.length === 0) return null;

  // The key mechanic: each slide's transform is chosen by its offset from the
  // active index — centre slide flat and full scale, neighbours pushed out on
  // X, scaled down and rotated on Y, further ones dimmed and blurred.
  //
  //   offset 0          -> translateX(0)      scale(1)    rotateY(0)
  //   offset 1          -> translateX(285px)  scale(0.84) rotateY(-24deg)
  //   offset 2          -> translateX(510px)  scale(0.68) rotateY(-38deg)
  //   offset total-1    -> translateX(-285px) scale(0.84) rotateY(24deg)
  //   offset total-2    -> translateX(-510px) scale(0.68) rotateY(38deg)
  //
  // ...on a stage with `perspective: 1400px`, transitioned with
  // `all 800ms cubic-bezier(0.25, 1, 0.5, 1)`.

  return (
    <section
      className={`relative w-full min-h-[760px] flex items-center justify-center overflow-hidden py-12 select-none ${className}`}
      style={{ backgroundColor: "#0c0a09", color: "#ffffff" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative w-full h-[520px] flex justify-center items-center mb-8" style={{ perspective: "1400px" }}>
        {items.map((item, idx) => {
          const offset = (idx - currentIndex + total) % total;

          let transform = "translateX(0px) scale(0.4) rotateY(0deg)";
          let opacity = 0;
          let zIndex = 0;
          let filter = "brightness(0.4) blur(2px)";
          let isCenter = false;

          if (offset === 0) {
            isCenter = true;
            transform = "translateX(0px) scale(1) rotateY(0deg)";
            opacity = 1;
            zIndex = 30;
            filter = "brightness(1)";
          } else if (offset === 1) {
            transform = "translateX(285px) scale(0.84) rotateY(-24deg)";
            opacity = 0.65;
            zIndex = 20;
            filter = "brightness(0.75)";
          } else if (offset === 2) {
            transform = "translateX(510px) scale(0.68) rotateY(-38deg)";
            opacity = 0.38;
            zIndex = 10;
            filter = "brightness(0.55) blur(1px)";
          } else if (offset === total - 1) {
            transform = "translateX(-285px) scale(0.84) rotateY(24deg)";
            opacity = 0.65;
            zIndex = 20;
            filter = "brightness(0.75)";
          } else if (offset === total - 2) {
            transform = "translateX(-510px) scale(0.68) rotateY(38deg)";
            opacity = 0.38;
            zIndex = 10;
            filter = "brightness(0.55) blur(1px)";
          }

          return (
            <div
              key={idx}
              onClick={() => !isCenter && goToSlide(idx)}
              style={{
                position: "absolute",
                width: "330px",
                height: "500px",
                borderRadius: "18px",
                overflow: "hidden",
                transform,
                opacity,
                zIndex,
                filter,
                transformOrigin: "center center",
                transition: "all 800ms cubic-bezier(0.25, 1, 0.5, 1)",
                cursor: isCenter ? "default" : "pointer",
              }}
            >
              <img src={item.img} alt={item.titleLine1} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 25%, rgba(0,0,0,0.68) 60%, rgba(0,0,0,0.96) 100%)", pointerEvents: "none", zIndex: 10 }} />
              <div style={{ position: "relative", zIndex: 20, opacity: isCenter ? 1 : 0, transition: "opacity 500ms ease" }}>
                <h2>{item.titleLine1}</h2>
                {item.titleLine2 && <span>{item.titleLine2}</span>}
                {item.desc && <p>{item.desc}</p>}
                <a href={item.ctaUrl || "#"} onClick={(e) => { if (onCtaClick) { e.preventDefault(); onCtaClick(item); } }}>
                  <span>{item.ctaText || "View Menu"}</span>
                  <ArrowRightIcon />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={prevSlide} aria-label="Previous"><ChevronLeftIcon /></button>
      <button onClick={nextSlide} aria-label="Next"><ChevronRightIcon /></button>

      <div>
        {items.map((_, idx) => (
          <button key={idx} onClick={() => goToSlide(idx)} aria-label={`Go to slide ${idx + 1}`} />
        ))}
      </div>
    </section>
  );
}

export const Component = CoverFlowCarousel;
export default CoverFlowCarousel;
