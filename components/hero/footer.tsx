"use client";

import { Facebook, Twitter, Instagram, Linkedin, Mail } from "lucide-react";
import { motion, Variants } from "framer-motion";

export default function Footer() {
  // Container for staggered animation
  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.2 },
    },
  };

  // Each column animation
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }, // cubic-bezier
    },
  };

  return (
    <motion.footer
      className="bg-neutral-900 text-white"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="container mx-auto px-4 py-16">
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <motion.div variants={itemVariants}>
            <h3 className="text-2xl font-bold text-neutral-400 mb-4">
              BarberShop
            </h3>
            <p className="text-gray-300 mb-6">
              Our website is created for men who appreciate premium quality,
              time and flawless look.
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-5 h-5 text-gray-400 hover:text-neutral-400 cursor-pointer transition-colors" />
              <Twitter className="w-5 h-5 text-gray-400 hover:text-neutral-400 cursor-pointer transition-colors" />
              <Instagram className="w-5 h-5 text-gray-400 hover:text-neutral-400 cursor-pointer transition-colors" />
              <Linkedin className="w-5 h-5 text-gray-400 hover:text-neutral-400 cursor-pointer transition-colors" />
            </div>
          </motion.div>

          {/* Contact */}
          <motion.div variants={itemVariants}>
            <h3 className="text-xl font-semibold mb-4">Headquarters</h3>
            <p className="text-gray-300 mb-2">New Baneshor</p>
            <p className="text-gray-300 mb-2">contact@barbershop.com</p>
            <p className="text-gray-300">+1234567890</p>
          </motion.div>

          {/* Links */}
          <motion.div variants={itemVariants}>
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-neutral-400 transition-colors"
                >
                  Orders
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-neutral-400 transition-colors"
                >
                  Terms
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-neutral-400 transition-colors"
                >
                  Report Problem
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Newsletter */}
          <motion.div variants={itemVariants}>
            <h3 className="text-xl font-semibold mb-4">
              Subscribe to our contents
            </h3>
            <form className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email Address..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-neutral-500 focus:border-transparent text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-neutral-600 hover:bg-neutral-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                SUBSCRIBE
              </button>
            </form>
          </motion.div>
        </motion.div>

        {/* Copyright */}
        <motion.div
          className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center"
          variants={itemVariants}
        >
          <p className="text-gray-400">
            © {new Date().getFullYear()} Barber Shop. All rights reserved.
          </p>
        </motion.div>
      </div>
    </motion.footer>
  );
}
