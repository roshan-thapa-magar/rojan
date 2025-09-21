import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative w-full  min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Background image */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/image/page-header.jpg')`,
        }}
      ></div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 flex flex-col items-center justify-center">
        <h3 className="text-lg md:text-xl font-medium text-neutral-400 mb-4 animate-fade-in-up">
          Trendy Salon & Spa
        </h3>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 animate-fade-in-up animation-delay-200">
          Barbershop Services
        </h1>
        <Image
          alt=""
          src={"/image/heading-line.png"}
          width={300}
          height={50} // adjust height to keep it slim
          className="mx-auto"
        />
      </div>
    </section>
  );
}
