import type { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Building2, Handshake, Mail, MapPin, Phone, Users2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import { authenticator } from "~/sessions/auth.server";
import Footer from "./components/footer";
import HomeHeader from "./components/header";

export async function loader({ request }: LoaderFunctionArgs) {
  const token = await authenticator.isAuthenticated(request);
  const isLoggedIn = token !== null;

  return { isLoggedIn };
}

export default function IndexPage() {
  const data = useLoaderData<typeof loader>();
  return (
    <>
      <HomeHeader isLoggedIn={data.isLoggedIn} />
      <main>
        <section className="~py-12/24 w-full bg-secondary" id="home">
          <div className="container grid items-center justify-between gap-8 px-4 md:px-6 lg:grid-cols-2">
            <img
              src="/img/home/hero.svg"
              width={800}
              height={600}
              alt="hero-image"
              className="~w-72/[26rem] order-1 h-auto place-self-center rounded-xl object-cover lg:order-2 lg:place-self-end"
            />
            <div className="order-2 space-y-4 lg:order-1">
              <h1 className="~text-3xl/4xl font-bold tracking-tighter">
                Koperasi Produksi Rejeki Berkah:{" "}
                <span className="text-primary">Bersama Membangun Kesejahteraan</span>
              </h1>
              <p className="text-justify text-muted-foreground">
                Bergabunglah menjadi bagian dari anggota yang kuat dan solid, yang berkomitmen pada
                pengembangan ekonomi bersama melalui prinsip-prinsip koperasi.
              </p>
              <Button className="px-10" asChild>
                <Link to="/auth/login">Mulai Sekarang</Link>
              </Button>
            </div>
          </div>
        </section>
        <section className="~py-12/24 container bg-white" id="about-us">
          <div className="grid items-center justify-between gap-8 px-4 md:px-6 lg:grid-cols-2">
            <img
              src="/img/home/about-us.svg"
              width={800}
              height={600}
              alt="about-image"
              className="~w-72/96 mx-auto h-auto rounded-xl object-cover"
            />
            <div className="space-y-3">
              <h2 className="font-bold text-2xl tracking-tighter">Tentang Kami</h2>
              <p className="font-semibold text-2xl text-primary uppercase">
                Dari anggota, untuk dan oleh anggota
              </p>
              <p className="text-justify text-muted-foreground">
                Koperasi Produksi Rejeki Berkah adalah koperasi yang bergerak dalam bidang produksi
                dan distribusi hasil pertanian. Kami berkomitmen untuk memberikan kesejahteraan bagi
                anggota koperasi dan masyarakat sekitar melalui prinsip-prinsip koperasi.
              </p>
            </div>
          </div>
        </section>
        <section className="~py-12/24 w-full bg-secondary" id="benefit">
          <div className="container space-y-12">
            <h2 className="text-center font-bold text-2xl tracking-tighter">
              Mengapa Bergabung dengan Koperasi Kami?
            </h2>
            <div className="grid grid-cols-1 items-center gap-5 lg:grid-cols-3">
              <div className="mx-auto flex max-w-sm flex-col items-center justify-center space-y-2">
                <Users2 className="h-16 w-auto text-primary" />
                <h3 className="font-semibold text-xl">Kesejahteraan Bersama</h3>
                <p className="text-justify text-muted-foreground">
                  Dapatkan bagian dari keuntungan yang diperoleh koperasi.
                </p>
              </div>
              <div className="mx-auto flex max-w-sm flex-col items-center justify-center space-y-2">
                <Building2 className="h-16 w-auto text-primary" />
                <h3 className="font-semibold text-xl">Keamanan dan Transparansi</h3>
                <p className="text-justify text-muted-foreground">
                  Dengan teknologi terbaru, setiap transaksi dalam koperasi ini tercatat dengan aman
                  dan transparan.
                </p>
              </div>
              <div className="mx-auto flex max-w-sm flex-col items-center justify-center space-y-2">
                <Handshake className="h-16 w-auto text-primary" />
                <h3 className="font-semibold text-xl">Dukungan untuk Usaha Anda</h3>
                <p className="text-justify text-muted-foreground">
                  Dapatkan bantuan dan dukungan untuk memulai atau mengembangkan usaha Anda.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="~py-12/24 container bg-white" id="faq">
          <div className="mx-auto max-w-2xl space-y-12">
            <div className="space-y-4">
              <h2 className="text-center font-bold text-2xl tracking-tighter">Pertanyaan Umum</h2>
              <p className="text-center">
                Kami telah mengumpulkan jawaban untuk pertanyaan yang sering diajukan oleh calon
                anggota. Temukan informasi penting yang Anda butuhkan di sini.
              </p>
            </div>
            <div>
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger>
                    Apakah koperasi ini menyediakan dukungan untuk anggota?
                  </AccordionTrigger>
                  <AccordionContent>
                    Tentu, kami menyediakan dukungan penuh untuk setiap anggota kami. Tim kami siap
                    membantu Anda dalam segala hal,
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <Accordion type="single" collapsible>
                <AccordionItem value="item-2">
                  <AccordionTrigger>
                    Bagaimana cara saya bergabung menjadi anggota koperasi?
                  </AccordionTrigger>
                  <AccordionContent>
                    Tentu, kami menyediakan dukungan penuh untuk setiap anggota kami. Tim kami siap
                    membantu Anda dalam segala hal,
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <Accordion type="single" collapsible>
                <AccordionItem value="item-3">
                  <AccordionTrigger>
                    Apakah koperasi ini menyediakan pinjaman bagi anggotanya?
                  </AccordionTrigger>
                  <AccordionContent>
                    Tentu, kami menyediakan dukungan penuh untuk setiap anggota kami. Tim kami siap
                    membantu Anda dalam segala hal,
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <Accordion type="single" collapsible>
                <AccordionItem value="item-4">
                  <AccordionTrigger>Apakah ada biaya keanggotaan?</AccordionTrigger>
                  <AccordionContent>
                    Tentu, kami menyediakan dukungan penuh untuk setiap anggota kami. Tim kami siap
                    membantu Anda dalam segala hal,
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>
        <section className="~py-12/24 w-full bg-secondary" id="contact">
          <div className="container space-y-12">
            <div className="mx-auto max-w-2xl space-y-4">
              <h2 className="text-center font-bold text-2xl tracking-tighter">Kontak Kami</h2>
              <p className="text-center">
                Hubungi kami untuk informasi lebih lanjut mengenai keanggotaan dan layanan yang kami
                tawarkan. Tim kami siap membantu Anda untuk bergabung dan berkembang.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-3">
              <div className="flex max-w-sm gap-4">
                <div className="h-fit rounded-full bg-white p-2">
                  <Phone className="~h-4/6 w-auto text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Whatsapp</p>
                  <p className="mt-2">+1-940-394-2948</p>
                  <p>+1-389-385-3807</p>
                </div>
              </div>
              <div className="flex max-w-sm gap-4">
                <div className="h-fit rounded-full bg-white p-2">
                  <Mail className="~h-4/6 w-auto text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Email</p>
                  <p className="mt-2">support@brainwave.io</p>
                  <p>contact@brainwave.io</p>
                </div>
              </div>
              <div className="flex max-w-sm gap-4">
                <div className="h-fit rounded-full bg-white p-2">
                  <MapPin className="~h-4/6 w-auto text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Alamat</p>
                  <p className="mt-2">34 Madison Street, NY, USA 10005</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
