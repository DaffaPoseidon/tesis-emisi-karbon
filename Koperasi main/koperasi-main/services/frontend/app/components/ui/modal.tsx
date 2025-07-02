import { TriangleAlert } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./dialog";

interface ModalProps {
  title: string;
  description: string;
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ title, description, isOpen, onClose, children }) => {
  const onChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onChange}>
      <DialogContent>
        <DialogHeader className="space-y-4">
          <div className="mx-auto flex w-fit items-center justify-center gap-2 rounded-full bg-[#fcecbb] p-3 text-[#DC6803]">
            <TriangleAlert size={32} />
          </div>
          <div className="space-y-2">
            <DialogTitle className="text-center text-xl">{title}</DialogTitle>
            <DialogDescription className="text-center text-base">{description}</DialogDescription>
          </div>
        </DialogHeader>
        <div>{children}</div>
      </DialogContent>
    </Dialog>
  );
};
