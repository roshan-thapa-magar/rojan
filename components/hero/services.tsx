"use client";

import { Scissors, Radar as Razor, Brush, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const services = [
  {
    icon: Scissors,
    title: "Haircut Styles",
    description:
      "Barber is a person whose occupation is mainly to cut dress style.",
  },
  {
    icon: Razor,
    title: "Beard Trimming",
    description:
      "Barber is a person whose occupation is mainly to cut dress style.",
  },
  {
    icon: Brush,
    title: "Smooth Shave",
    description:
      "Barber is a person whose occupation is mainly to cut dress style.",
  },
  {
    icon: Sparkles,
    title: "Face Masking",
    description:
      "Barber is a person whose occupation is mainly to cut dress style.",
  },
];

export default function Services() {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.2 }, // each card appears 0.2s after the previous
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h3 className="text-neutral-600 text-lg font-semibold mb-2">
            Trendy Salon & Spa
          </h3>
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Our Services
          </h2>
          <div className="w-20 h-1 bg-neutral-600 mx-auto"></div>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              className="bg-white p-8 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow duration-300"
              variants={cardVariants}
            >
              <service.icon className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-800">
                {service.title}
              </h3>
              <p className="text-gray-600">{service.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
