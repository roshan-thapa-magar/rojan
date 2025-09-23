"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, MapPinnedIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const slides = [
  {
    image: "/image/slide-1.jpg",
    subtitle: "It's Not Just a Haircut, It's an Experience.",
    title: "Being a barber is about taking care of the people.",
    description:
      "Our barbershop is the territory created purely for males who appreciate premium quality, time and flawless look.",
  },
  {
    image: "/image/slide-2.jpg",
    subtitle: "Classic Hair Style & Shaves.",
    title: "Our hair styles enhances your smile.",
    description:
      "Our barbershop is the territory created purely for males who appreciate premium quality, time and flawless look.",
  },
  {
    image: "/image/slide-3.jpg",
    subtitle: "It's Not Just a Haircut, It's an Experience.",
    title: "Where mens want to look there very best.",
    description:
      "Our barbershop is the territory created purely for males who appreciate premium quality, time and flawless look.",
  },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleAppointmentClick = () => {
    if (status === "authenticated") {
      router.push("/appointment");
    } else {
      router.push("/login");
    }
  };

  const handleMapClick = () => {
    const destination = encodeURIComponent(
      "Arubari Jorpati Marg, Gokarneshwor 44600"
    );
    // This opens Google Maps with navigation (driving mode)
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
    window.open(url, "_blank");
  };

  return (
    <section className="relative min-h-screen overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${slide.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="container mx-auto px-4 h-full flex items-center">
            <div className="text-white max-w-2xl">
              <h3 className="text-zinc-400 text-lg mb-4">{slide.subtitle}</h3>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                {slide.title}
              </h1>
              <p className="text-xl mb-8 text-gray-200">{slide.description}</p>
              <div className="flex items-center gap-4">
                {/* Appointment Button */}
                <button
                  onClick={handleAppointmentClick}
                  className="bg-neutral-700 hover:bg-neutral-800 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-block"
                >
                  Make Appointment
                </button>

                {/* Map Button */}
                <div
                  onClick={handleMapClick}
                  className="p-2 rounded-full bg-neutral-700 hover:bg-neutral-800 text-white cursor-pointer"
                >
                  <MapPinnedIcon size={40} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all z-10"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all z-10"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? "bg-zinc-500" : "bg-white bg-opacity-50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

