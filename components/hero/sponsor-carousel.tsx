"use client";

import React from "react";
import Image from "next/image";

const sponsors = [
  "/image/sponsor-1.png",
  "/image/sponsor-2.png",
  "/image/sponsor-3.png",
  "/image/sponsor-4.png",
  "/image/sponsor-5.png",
  "/image/sponsor-1.png",
  "/image/sponsor-2.png",
  "/image/sponsor-3.png",
];

const SponsorSection: React.FC = () => {
  return (
    <div className="sponsor_section bg-gray-100 py-12 overflow-hidden">
      <div className="container mx-auto">
        <div className="relative w-full">
          <ul className="flex animate-marquee gap-8">
            {sponsors.map((src, index) => (
              <li
                key={index}
                className="flex-shrink-0 relative h-16 md:h-24 w-auto"
              >
                <Image
                  src={src}
                  alt={`sponsor-${index}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 4rem, 6rem"
                />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default SponsorSection;
