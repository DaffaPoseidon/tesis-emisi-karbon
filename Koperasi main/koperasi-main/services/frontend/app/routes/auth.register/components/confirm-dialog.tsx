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
} from "~/components/ui/alert-dialog";

export default function ConfirmDialog({
  open,
  onOpenChange,
  handleSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handleSubmit: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="mx-auto text-center">
            <div className="mx-auto flex items-center justify-center gap-2 rounded-full bg-[#fcecbb] p-2 text-[#DC6803]">
              <TriangleAlert />
            </div>
            <span className="~text-xl/2xl">Apakah Anda Sudah Yakin?</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-lg">
            Pastikan data yang diunggah sudah benar.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Kembali</AlertDialogCancel>
          <AlertDialogAction onClick={handleSubmit}>Yakin</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
