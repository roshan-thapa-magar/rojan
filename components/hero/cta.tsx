"use client";

import React from "react";
import { motion, Variants } from "framer-motion";

const CTASection: React.FC = () => {
  const bgImage = "/image/cta.jpg";

  // Container for staggered children
  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.3, // delay between each child
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.42, 0, 0.58, 1] }, // cubic-bezier for easeOut
    },
  };

  return (
    <section
      className="cta_section py-40 bg-fixed bg-center bg-cover relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="container mx-auto relative z-10">
        <div className="flex justify-center items-center">
          <motion.div
            className="text-center max-w-2xl"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.h2
              className="text-4xl md:text-5xl font-bold mb-6 text-white"
              variants={itemVariants}
            >
              Making You Look Good <br />
              Is In Our Heritage.
            </motion.h2>
            <motion.p
              className="text-lg mb-8 text-white/90"
              variants={itemVariants}
            >
              Barber is a person whose occupation is mainly to cut, dress,
              groom,
              <br />
              {` style and shave men's and boys hair.`}
            </motion.p>
            <motion.a
              href="#"
              className="inline-block bg-neutral-700 hover:bg-neutral-800 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              variants={itemVariants}
            >
              Make Appointment
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
