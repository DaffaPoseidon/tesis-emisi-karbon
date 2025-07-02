import { TriangleAlert } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";

interface TerimaModalProps {
  disabled?: boolean;
  loading?: boolean;
  onSubmitted?: () => void;
}

export function TerimaModal({ onSubmitted, loading, disabled }: TerimaModalProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button disabled={disabled}>Terima</Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="!gap-6">
        <AlertDialogHeader className="mx-auto items-center justify-center text-center">
          <div className="flex w-fit items-center justify-center gap-2 rounded-full bg-[#fcecbb] p-3 text-[#DC6803]">
            <TriangleAlert />
          </div>
          <AlertDialogTitle>Terima Proposal Proyek?</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Pastikan semua data sudah benar. Proposal yang diterima akan diteruskan ke komitee
            koperasi.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="!justify-center">
          <AlertDialogCancel disabled={loading} className="!w-full">
            Batalkan
          </AlertDialogCancel>
          <AlertDialogAction disabled={loading} className="!w-full" onClick={onSubmitted}>
            Lanjutkan
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
