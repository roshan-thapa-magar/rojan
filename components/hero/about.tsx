"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function About() {
  const leftContent = [
    <h3 key="1" className="text-neutral-900 text-lg font-semibold">
      Introducing
    </h3>,
    <h2 key="2" className="text-4xl text-center font-bold text-neutral-500">
      The Barber Shops <br />A New Idea
    </h2>,
    <Image
      key="3"
      alt=""
      src={"/image/about-logo.png"}
      height={200}
      width={200}
    />,
    <p key="4" className="text-gray-600 text-center text-lg leading-relaxed">
      {`BarberShop is a place where barbers mainly cuts hair to dress groom style
      and shave men's and boys' hair. A barber's place of work is known as a
      "barbershop" or a "barber's". Barbershops are also places of social
      interaction and public discourse. In some instances, barbershops are also
      public forums.`}
    </p>,
    <button
      key="5"
      className="bg-neutral-700 hover:bg-neutral-800 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
    >
      More About Us
    </button>,
  ];

  const images = [
    { src: "/image/service-6.jpg", alt: "Barber at work", className: "" },
    {
      src: "/image/service-8.jpg",
      alt: "Barbershop interior",
      className: "mt-12 -ml-10",
    },
    {
      src: "/image/service-1.jpg",
      alt: "Barber tools",
      className: "-mt-40 ml-10",
    },
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.3, // delay between child animations
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            className="space-y-6 flex flex-col items-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {leftContent.map((content) => (
              <motion.div key={content.key} variants={itemVariants}>
                {content}
              </motion.div>
            ))}
          </motion.div>

          {/* Right images */}
          <motion.div
            className="relative grid grid-cols-2 gap-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {images.map((img, idx) => (
              <motion.img
                key={idx}
                src={img.src}
                alt={img.alt}
                className={`rounded-lg shadow-lg ${img.className}`}
                variants={itemVariants}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
