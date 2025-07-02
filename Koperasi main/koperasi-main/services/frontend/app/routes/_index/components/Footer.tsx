import { Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-green-700 shadow">
      <div className="container mx-auto w-full p-4 md:py-6">
        <div className="sm:flex sm:items-center sm:justify-between sm:gap-12">
          <span className="mb-4 flex items-center space-x-3 sm:mb-0 rtl:space-x-reverse">
            <img
              src="/img/icon.png"
              width={32}
              height={32}
              alt="RSB Inc"
              className="mx-auto h-12 w-auto rounded-xl bg-white object-contain px-3"
            />
          </span>
          <ul className="mb-6 flex flex-wrap items-center gap-4 font-medium text-sm text-white sm:mb-0">
            <li>
              <span className="me-4 flex items-center gap-1.5 md:me-6">
                <div className="h-fit rounded-full bg-white p-1.5">
                  <Phone className="h-6 w-auto text-primary" />
                </div>
                +1-940-394-2948
              </span>
            </li>
            <li>
              <span className="me-4 flex items-center gap-1.5 md:me-6">
                <div className="h-fit rounded-full bg-white p-1.5">
                  <Mail className="h-6 w-auto text-primary" />
                </div>
                contact@brainwave.io
              </span>
            </li>
            <li>
              <span className="me-4 flex items-center gap-1.5 md:me-6">
                <div className="h-fit rounded-full bg-white p-1.5">
                  <MapPin className="h-6 w-auto text-primary" />
                </div>{" "}
                34 Madison Street, NY, USA 10005
              </span>
            </li>
          </ul>
        </div>
        <hr className="my-6 border-gray-200 sm:mx-auto lg:my-8" />
        <span className="block font-medium text-sm text-white sm:text-center">
          © 2024 Koperasi Produksi RSB. All Rights Reserved.
        </span>
      </div>
    </footer>
  );
}
