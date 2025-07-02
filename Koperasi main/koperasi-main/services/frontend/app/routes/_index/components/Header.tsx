import { Form, Link, useNavigation } from "@remix-run/react";
import { LogOutIcon, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";

interface HomeHeaderProps {
  isLoggedIn: boolean;
}

export default function HomeHeader({ isLoggedIn }: HomeHeaderProps) {
  const navigation = useNavigation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`${isScrolled ? "bg-white shadow-md" : "bg-secondary"} sticky top-0 transition-all`}
    >
      <header className="container flex h-20 w-full shrink-0 items-center">
        <Link to="#" className="mr-6 hidden items-center gap-2 lg:flex">
          <img
            src="/img/icon.png"
            width={32}
            height={32}
            alt="RSB Inc"
            className="h-12 w-auto object-cover"
          />
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetTitle>
              <span className="sr-only">Menu Navigasi</span>
            </SheetTitle>
            <SheetDescription>
              <img
                src="/img/icon.png"
                width={32}
                height={32}
                alt="RSB Inc"
                className="h-12 w-auto object-cover"
              />
            </SheetDescription>
            <div className="grid gap-2 py-6">
              <Link to="#home" className="flex w-full items-center py-2 font-semibold text-lg">
                Beranda
              </Link>
              <Link to="#about-us" className="flex w-full items-center py-2 font-semibold text-lg">
                Tentang Kami
              </Link>
              <Link to="#benefit" className="flex w-full items-center py-2 font-semibold text-lg">
                Keuntungan
              </Link>
              <Link to="#faq" className="flex w-full items-center py-2 font-semibold text-lg">
                FAQ
              </Link>
              <Link to="#contact" className="flex w-full items-center py-2 font-semibold text-lg">
                Kontak
              </Link>
              {isLoggedIn ? (
                <>
                  <Button asChild>
                    <Link to="auth/login">Masuk</Link>
                  </Button>
                  <Form className="!p-0" method="post" action="/action/logout">
                    <Button
                      className="w-full cursor-pointer justify-between text-start"
                      disabled={navigation.state === "submitting"}
                      variant="ghost"
                      type="submit"
                    >
                      Keluar <LogOutIcon className="size-5" />
                    </Button>
                  </Form>
                </>
              ) : (
                <>
                  <Button variant="outline" asChild>
                    <Link to="auth/register">Daftar</Link>
                  </Button>
                  <Button asChild>
                    <Link to="auth/login">Masuk</Link>
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
        <Link to="#" className="mx-auto flex flex-1 items-center gap-2 lg:hidden">
          <img
            src="/img/icon.png"
            width={32}
            height={32}
            alt="RSB Inc"
            className="mx-auto h-12 w-auto object-cover"
          />
        </Link>
        <nav className="hidden flex-1 justify-center lg:flex">
          <ul className="flex items-center gap-12">
            <li>
              <Link to="#home" className="font-medium hover:underline">
                Beranda
              </Link>
            </li>
            <li>
              <Link to="#about-us" className="font-medium hover:underline">
                Tentang Kami
              </Link>
            </li>
            <li>
              <Link to="#benefit" className="font-medium hover:underline">
                Keuntungan
              </Link>
            </li>
            <li>
              <Link to="#faq" className="font-medium hover:underline">
                FAQ
              </Link>
            </li>
            <li>
              <Link to="#contact" className="font-medium hover:underline">
                Kontak
              </Link>
            </li>
          </ul>
        </nav>
        <div className="ml-auto hidden gap-2 lg:flex">
          {isLoggedIn ? (
            <>
              <Button asChild>
                <Link to="auth/login">Masuk</Link>
              </Button>
              <Form className="!p-0" method="post" action="/action/logout">
                <Button
                  className="w-full cursor-pointer justify-between text-start"
                  disabled={navigation.state === "submitting"}
                  variant="destructive"
                  type="submit"
                >
                  Keluar <LogOutIcon className="size-5" />
                </Button>
              </Form>
            </>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link to="auth/register">Daftar</Link>
              </Button>
              <Button asChild>
                <Link to="auth/login">Masuk</Link>
              </Button>
            </>
          )}
        </div>
      </header>
    </div>
  );
}
