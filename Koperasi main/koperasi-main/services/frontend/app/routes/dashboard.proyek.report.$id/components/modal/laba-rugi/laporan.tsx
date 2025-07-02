import { TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import type { Proyek } from "~/types/api/proyek";
import LaporanLabaModal from "./laporan-laba";
import LaporanRugi from "./laporan-rugi";

interface LaporanModalProps {
  data: Proyek;
}

export default function LaporanModal({ data }: LaporanModalProps) {
  const [open, setOpen] = useState(false);
  const [showLabaModal, setShowLabaModal] = useState(false);
  const [showRugiModal, setShowRugiModal] = useState(false);

  function handleChoice(choice: "laba" | "rugi") {
    setOpen(false);
    if (choice === "laba") {
      setShowLabaModal(true);
    } else {
      setShowRugiModal(true);
    }
  }

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full">Unggah Laporan</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="mb-3">
            <DialogTitle>Pilih Jenis Laporan</DialogTitle>
            <DialogDescription className="sr-only">
              Pilih jenis laporan yang ingin diunggah
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <button
              type="button"
              className="!w-full flex flex-col items-center justify-center gap-2 rounded-md bg-primary/10 p-2.5 font-medium hover:bg-primary/20"
              onClick={() => handleChoice("laba")}
            >
              <div className="rounded-md bg-primary p-1.5 text-white">
                <TrendingUp />
              </div>
              Laporan Laba
            </button>
            <button
              type="button"
              className="!w-full flex flex-col items-center justify-center gap-2 rounded-md bg-destructive/10 p-2.5 font-medium hover:bg-destructive/20"
              onClick={() => handleChoice("rugi")}
            >
              <div className="rounded-md bg-destructive p-1.5 text-white">
                <TrendingDown />
              </div>
              Laporan Rugi
            </button>
          </div>
        </DialogContent>
      </Dialog>
      <LaporanLabaModal data={data} open={showLabaModal} onOpenChange={setShowLabaModal} />
      <LaporanRugi data={data} open={showRugiModal} onOpenChange={setShowRugiModal} />
    </div>
  );
}
