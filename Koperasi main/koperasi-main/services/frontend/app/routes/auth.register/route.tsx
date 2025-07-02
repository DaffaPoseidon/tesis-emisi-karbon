import { Link, useNavigate } from "@remix-run/react";
import { type SetStateAction, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { useRegisterUser } from "~/services/auth/register";
import type { TFirstForm, TRegisterRequest, TSecondForm } from "~/types/api/auth";
import ConfirmDialog from "./components/confirm-dialog";
import FirstForm from "./components/first-form";
import SecondForm from "./components/second-form";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [open, setOpen] = useState(false);
  const { mutateAsync: userRegister } = useRegisterUser();
  const [formData, setFormData] = useState<TRegisterRequest>({
    nama: "",
    no_hp: "",
    password: "",
    nik: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    provinsi: "",
    kota: "",
    kecamatan: "",
    alamat: "",
    foto_diri: null,
    foto_ktp: null,
  });

  const handleFirstFormSubmit = (data: SetStateAction<Omit<TFirstForm, "confirm_password">>) => {
    setFormData({ ...formData, ...data });
    setStep(2);
  };

  const handleSecondFormSubmit = (data: SetStateAction<TSecondForm>) => {
    setFormData({ ...formData, ...data });
    setOpen(true);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleNextStep = () => {
    if (step === 1) {
      document
        .getElementById("first-form")
        ?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
    } else {
      document
        .getElementById("second-form")
        ?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
    }
  };

  const handleSubmit = async () => {
    await userRegister(formData, {
      onSuccess: () => {
        toast.success("Registrasi berhasil, silahkan lanjutkan ke tahap selanjutnya.");
        setFormData({
          nama: "",
          no_hp: "",
          password: "",
          nik: "",
          tempat_lahir: "",
          tanggal_lahir: "",
          provinsi: "",
          kota: "",
          kecamatan: "",
          alamat: "",
          foto_diri: null,
          foto_ktp: null,
        });
        navigate("/auth/login");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  return (
    <section className="mx-auto my-auto grid w-full max-w-2xl gap-6 overflow-auto px-5">
      <div className="grid gap-2">
        <img src="/img/icon.png" alt="Logo" className="w-56" />
        <h1 className="font-bold text-3xl">{step === 1 ? "Buat Akun!" : "Lengkapi Data!"}</h1>
        <p className="text-muted-foreground">
          {step === 1
            ? "Silahkan mengisi formulis ini untuk buat akun anda."
            : "Silahkan lengkapi formulir ini untuk verifikasi akun anda."}
        </p>
        <div className="mt-4 flex items-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white">
            1
          </div>
          <div className="h-0.5 w-8 bg-green-500" />
          <div
            className={`flex h-8 w-8 items-center justify-center ${
              step === 2 ? "bg-green-500 text-white" : "border-2 border-gray-300"
            } rounded-full`}
          >
            2
          </div>
        </div>
      </div>
      {step === 1 ? (
        <FirstForm
          id="first-form"
          defaultValues={formData as Omit<TFirstForm, "confirm_password">}
          onSubmit={handleFirstFormSubmit}
        />
      ) : (
        <SecondForm
          id="second-form"
          defaultValues={formData as TSecondForm}
          onSubmit={handleSecondFormSubmit}
        />
      )}
      <div className="flex gap-4">
        {step === 2 && (
          <Button
            type="button"
            className="w-full text-white"
            onClick={handleBack}
            variant="destructive"
          >
            Kembali
          </Button>
        )}
        <Button onClick={handleNextStep} className="w-full">
          {step === 1 ? "Selanjutnya" : "Daftar"}
        </Button>
      </div>
      <div className="text-center text-sm">
        Sudah punya akun?{" "}
        <Link to="/auth/login" className="text-primary underline hover:text-primary/80">
          Masuk
        </Link>
      </div>
      <ConfirmDialog open={open} onOpenChange={setOpen} handleSubmit={handleSubmit} />
    </section>
  );
}
