"use client";

import {
  Scissors,
  Radar as Razor,
  Brush,
  Sparkles,
  Zap,
  Palette,
  Train as Straighten,
  Star,
} from "lucide-react";
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
  {
    icon: Zap,
    title: "Beard Trimming",
    description:
      "Barber is a person whose occupation is mainly to cut dress style.",
  },
  {
    icon: Palette,
    title: "Hair Coloring",
    description:
      "Barber is a person whose occupation is mainly to cut dress style.",
  },
  {
    icon: Straighten,
    title: "Hair Straight",
    description:
      "Barber is a person whose occupation is mainly to cut dress style.",
  },
  {
    icon: Star,
    title: "Bright Facial",
    description:
      "Barber is a person whose occupation is mainly to cut dress style.",
  },
];

export default function Services() {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.1 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section className="py-20 bg-stone-100">
      <div className="container mx-auto px-4">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 text-center"
              variants={cardVariants}
            >
              <service.icon className="w-16 h-16 text-stone-600 mx-auto mb-6 stroke-1" />
              <h3 className="text-xl font-serif font-medium mb-4 text-stone-800">
                {service.title}
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
