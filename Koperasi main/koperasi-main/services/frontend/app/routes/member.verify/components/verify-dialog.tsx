import { Form, useNavigation } from "@remix-run/react";
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
  const navigation = useNavigation();
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="~text-2xl/lg text-center font-semibold">
            Akun Dalam Proses Verifikasi
          </AlertDialogTitle>
          <AlertDialogDescription className="sr-only">Konfirmasi Akun User</AlertDialogDescription>
          <section>
            <div className="flex flex-col gap-8">
              <img
                src="/img/auth/verify-avatar.svg"
                alt="hero"
                className="mx-auto h-full w-auto rounded-md object-cover"
              />
              <span className="text-center text-gray-700 text-lg dark:text-gray-300">
                Akun Anda sedang diverifikasi. Tunggu hingga 2x24 jam. Jika belum ada konfirmasi,
                silakan hubungi Admin.
              </span>
            </div>
          </section>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction asChild>
            <Form className="!p-0 !w-full" method="post" action="/action/logout">
              <Button className="w-full" disabled={navigation.state === "submitting"}>
                Hubungi Admin
              </Button>
            </Form>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
