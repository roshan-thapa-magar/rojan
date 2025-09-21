"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Testimonial {
  text: string;
  author: string;
}

const testimonials: Testimonial[] = [
  {
    text: `There are design companies, and then there are user experience design interface design professional. By far one of the world's best known brands.`,
    author: "Anita Tran, IT Solutions.",
  },
  {
    text: `Amazing service! The barbers are skilled and professional. My haircut exceeded expectations.`,
    author: "Leslie Williamson, Developer.",
  },
  {
    text: `There are design companies, and then there are user experience design interface design professional. By far one of the world's best known brands.`,
    author: "Fred Moody, Network Software.",
  },
];

const TestimonialsCarousel: React.FC = () => {
  const bgImage = "/image/testimonial.jpg";
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => setCurrentIndex(index);

  const variants = {
    enter: { opacity: 0, y: 50 },
    center: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 },
  };

  return (
    <section
      id="reviews"
      className="testimonial_section py-40 bg-fixed bg-center bg-cover relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="container mx-auto relative overflow-hidden flex justify-center items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className="flex flex-col items-center justify-center text-center text-white px-4 py-20"
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.8 }}
          >
            <p className="mb-4 text-lg md:text-3xl">
              {testimonials[currentIndex].text}
            </p>
            <h4 className="text-md md:text-lg font-semibold">
              {testimonials[currentIndex].author}
            </h4>
          </motion.div>
        </AnimatePresence>

        {/* Pagination Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;
