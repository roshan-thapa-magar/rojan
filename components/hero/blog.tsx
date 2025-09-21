"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";

export default function Blog() {
  const blogPosts = [
    {
      id: 1,
      title: "Minimalist trending in modern architecture 2019",
      excerpt:
        "Building first evolved out dynamics between needs means available building materials attendant skills.",
      image: "/image/about-1.jpg",
      category: "INTERIOR",
    },
    {
      id: 2,
      title: "Terrace in the town yamazaki kentaro design workshop.",
      excerpt:
        "Building first evolved out dynamics between needs means available building materials attendant skills.",
      image: "/image/about-2.jpg",
      category: "ARCHITECTURE",
    },
    {
      id: 3,
      title: "W270 house são paulo arquitetos fabio jorge arquiteture.",
      excerpt:
        "Building first evolved out dynamics between needs means available building materials attendant skills.",
      image: "/image/about-3.jpg",
      category: "DESIGN",
    },
  ];

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.42, 0, 0.58, 1] },
    },
  };

  return (
    <section className="py-20 bg-neutral-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <p className="text-sm text-neutral-500 mb-4 tracking-wider">
            From Blog
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-4xl font-serif text-neutral-900 leading-tight max-w-4xl mx-auto">
            A Good Newspaper Is A Nation Talking To Itself
          </h2>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {blogPosts.map((post) => (
            <motion.article
              key={post.id}
              className="bg-white group cursor-pointer rounded-xl shadow-lg hover:shadow-2xl transition duration-300 overflow-hidden"
              variants={cardVariants}
            >
              <div className="relative overflow-hidden w-full h-64">
                <Image
                  src={post.image || "/placeholder.svg"}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  priority
                />
                <div className="absolute bottom-4 left-4">
                  <span className="bg-black bg-opacity-70 text-white text-xs px-3 py-1 tracking-wider rounded">
                    {post.category}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-serif text-neutral-900 mb-4 leading-tight group-hover:text-neutral-600 transition-colors">
                  {post.title}
                </h3>
                <p className="text-neutral-600 text-sm leading-relaxed mb-6">
                  {post.excerpt}
                </p>

                <div className="border-b border-neutral-300 pb-1 inline-block">
                  <span className="text-sm text-neutral-700 hover:text-neutral-900 transition-colors cursor-pointer">
                    READ MORE
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
