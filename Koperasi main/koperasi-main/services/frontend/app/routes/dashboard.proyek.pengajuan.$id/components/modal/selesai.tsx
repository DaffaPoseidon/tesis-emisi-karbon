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

interface SelesaiModalProps {
  disabled?: boolean;
  loading?: boolean;
  onSubmitted?: () => void;
}

export function SelesaiModal({ onSubmitted, loading, disabled }: SelesaiModalProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="col-span-2 w-full bg-blue-700 hover:bg-blue-600" disabled={disabled}>
          Proyek Selesai
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="!gap-6">
        <AlertDialogHeader className="mx-auto items-center justify-center text-center">
          <div className="flex w-fit items-center justify-center gap-2 rounded-full bg-[#fcecbb] p-3 text-[#DC6803]">
            <TriangleAlert />
          </div>
          <AlertDialogTitle>Proyek telah selesai?</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Pastikan semua proyek telah selesai.
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
