import Autoplay from "embla-carousel-autoplay";
import React from "react";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";

const Content = [
  {
    id: 1,
    img: "/img/auth/carousel-1.png",
    text: "Mulai Langkah Pertama Menuju Kesuksesan Bersama Koperasi Produksi Rejeki Sukses Berkah",
  },
  {
    id: 2,
    img: "/img/auth/carousel-2.png",
    text: "Gabung Sekarang dan Jadilah Investor Berpengaruh di Koperasi Produksi Rejeki Sukses Berkah",
  },
  {
    id: 3,
    img: "/img/auth/carousel-3.png",
    text: "Registrasi Sekarang dan Raih Manfaat Lebih",
  },
];

export default function RegisterCarousel() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const plugin = React.useRef(Autoplay({ delay: 4000, stopOnInteraction: true }));

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);
  return (
    <Carousel
      className="h-auto w-[28rem]"
      opts={{ loop: true }}
      plugins={[plugin.current]}
      setApi={setApi}
    >
      <CarouselContent>
        {Content.map((item) => (
          <CarouselItem key={item.id}>
            <div className="flex flex-col items-center justify-center gap-8">
              <img src={item.img} alt="hero" className="w-[26rem] object-cover" />
              <p className="w-3/4 text-center font-semibold text-xl">{item.text}</p>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="lg:-left-6 xl:-left-20" />
      <CarouselNext className="lg:-right-6 xl:-right-20" />
      <div className="-bottom-10 -translate-x-1/2 absolute left-1/2 flex gap-5">
        {Array.from({ length: count }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 w-10 rounded-sm ${current === i + 1 ? "bg-green-500" : "bg-slate-300"}`}
          />
        ))}
      </div>
    </Carousel>
  );
}
