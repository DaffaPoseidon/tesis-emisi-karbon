import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Modal } from "../ui/modal";

interface AlertModalProps {
  title: string;
  description: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

export function AlertModal({
  title = "Apakah anda yakin?",
  description = "Tindakan ini tidak dapat dibatalkan.",
  isOpen,
  onClose,
  onConfirm,
  loading,
}: AlertModalProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Modal description={description} isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex w-full items-center justify-end space-x-2 pt-6">
        <Button disabled={loading} onClick={onClose} variant="destructive">
          Batal
        </Button>
        <Button disabled={loading} onClick={onConfirm}>
          Lanjutkan
        </Button>
      </div>
    </Modal>
  );
}
