import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";

export default function VerifyDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="~text-2xl/lg text-center font-semibold">
            Pembayaran Dalam Proses Vervikasi
          </AlertDialogTitle>
          <AlertDialogDescription className="sr-only">
            Pembayaran Anda sedang diverifikasi. Tunggu hingga 2x24 jam. Jika belum ada konfirmasi,
            silakan hubungi Admin.
          </AlertDialogDescription>
          <section>
            <div className="flex flex-col gap-8">
              <img
                src="/img/auth/verify-avatar.svg"
                alt="hero"
                className="mx-auto h-full w-auto rounded-md object-cover"
              />
              <span className="text-center text-gray-700 text-lg dark:text-gray-300">
                Pembayaran Anda sedang diverifikasi. Tunggu hingga 2x24 jam. Jika belum ada
                konfirmasi, silakan hubungi Admin.
              </span>
            </div>
          </section>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction asChild>
            <Button className="w-full" type="button">
              Tutup
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
