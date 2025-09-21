"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

interface Barber {
  _id: string;
  id: string;
  name: string;
  email: string;
  phone: string;
  image?: string;
  position: string;
  experience: number;
  status: "active" | "inactive";
}

export default function TeamSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const fetchbarbers = async () => {
    try {
      const response = await fetch("/api/users?role=barber");
      const data = await response.json();
      setBarbers(data);
    } catch (error) {
      console.error("Error fetching barbers:", error);
    }
  }

  useEffect(() => {
    fetchbarbers();
  }, []);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  // const barbers: Barber[] = [
  //   {
  //     _id: "1",
  //     name: "Kyle Frederick",
  //     location: "Senior Barber",
  //     image: "/image/about-1.jpg",
  //   },
  //   {
  //     _id: "2",
  //     name: "José Carpio",
  //     location: "Hair Specialist",
  //     image: "/image/about-2.jpg",
  //   },
  //   {
  //     _id: "3",
  //     name: "Michel Ibáñez",
  //     location: "Beard Expert",
  //     image: "/image/about-3.jpg",
  //   },
  //   {
  //     _id: "4",
  //     name: "Adam Castellon",
  //     location: "Style Consultant",
  //     image: "/image/about-1.jpg",
  //   },
  // ];

  const visibleCards = 4;
  const visibleCardsMobile = 1;

  const nextSlide = () => {
    const maxIndex = isMobile 
      ? Math.max(1, barbers.length - visibleCardsMobile + 1)
      : Math.max(1, barbers.length - visibleCards + 1);
    setCurrentIndex((prev) => (prev + 1) % maxIndex);
  };

  const prevSlide = () => {
    const maxIndex = isMobile 
      ? Math.max(1, barbers.length - visibleCardsMobile + 1)
      : Math.max(1, barbers.length - visibleCards + 1);
    setCurrentIndex((prev) => (prev - 1 + maxIndex) % maxIndex);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5 } },
  };

  const handleWhatsAppClick = (phone: string) => {
    // Remove any non-numeric characters and ensure it starts with country code
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Detect if it's a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // For mobile devices, try to open WhatsApp app first
      const whatsappUrl = `whatsapp://send?phone=${cleanPhone}`;
      const webUrl = `https://wa.me/${cleanPhone}`;
      
      // Create an iframe to test if WhatsApp app is installed
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = whatsappUrl;
      document.body.appendChild(iframe);
      
      // Set a timeout to check if the app opened
      const timeout = setTimeout(() => {
        // If we're still here after 1 second, the app probably didn't open
        document.body.removeChild(iframe);
        window.open(webUrl, '_blank');
      }, 1000);
      
      // Listen for page visibility change (app opened)
      const handleVisibilityChange = () => {
        if (document.hidden) {
          clearTimeout(timeout);
          document.body.removeChild(iframe);
          document.removeEventListener('visibilitychange', handleVisibilityChange);
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      // Clean up after 3 seconds regardless
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        clearTimeout(timeout);
      }, 3000);
    } else {
      // For desktop, open web version directly
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
    }
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h3 className="text-neutral-600 text-lg font-semibold mb-2">
            Trendy Salon &
          </h3>
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Our Barber Shops
          </h2>
          <div className="flex items-center justify-center">
            <Image
              src="/image/heading-line.png"
              alt="Heading divider"
              width={200}
              height={20}
              className="mx-auto"
            />
          </div>
        </div>

        {/* Carousel */}
        <div className="relative overflow-hidden">
          <motion.div
            className="flex transition-transform duration-500 ease-in-out"
            animate={{ 
              x: isMobile 
                ? `-${currentIndex * 100}%` 
                : `-${currentIndex * 25}%` 
            }}
          >
            {barbers.map((barber) => (
              <motion.div
                key={barber._id}
                className="w-full md:w-1/4 flex-shrink-0 px-4"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ scale: 1.05 }}
              >
                <div className="relative group">
                  <Image
                    src={barber.image || "/placeholder.svg"}
                    alt={barber.name}
                    width={300}
                    height={320}
                    className="w-full h-80 object-cover rounded-lg"
                  />
                  
                  {/* WhatsApp Icon */}
                  <button
                    onClick={() => handleWhatsAppClick(barber.phone)}
                    className="absolute top-4 right-4 bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-10"
                    title={`Message ${barber.name} on WhatsApp`}
                  >
                    <MessageCircle className="w-5 h-5" />
                  </button>
                  
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-50 md:opacity-0 md:group-hover:opacity-50 transition-opacity duration-300 rounded-lg flex items-end">
                    <div className="text-white p-6">
                      <h3 className="text-xl font-semibold">{barber.name}</h3>
                      <p className="text-neutral-400">{barber.position}</p>
                      <p className="text-neutral-300 text-sm">{barber.experience} years experience</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Navigation Arrows */}
          {barbers.length > (isMobile ? visibleCardsMobile : visibleCards) && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 bg-neutral-600 hover:bg-neutral-700 text-white p-2 rounded-full"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-neutral-600 hover:bg-neutral-700 text-white p-2 rounded-full"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
