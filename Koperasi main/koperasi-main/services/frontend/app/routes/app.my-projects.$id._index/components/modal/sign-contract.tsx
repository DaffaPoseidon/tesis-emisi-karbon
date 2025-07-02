import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import RequiredIcon from "~/components/ui/required-icon";
import { useAgreementProject } from "~/services/projects/agreement";

export const signContractSchema = z.object({
  id: z.string().optional(),
  contract: z.instanceof(File).refine((file) => file.size < 4 * 1024 * 1024, {
    message: "Ukuran file maksimal 4MB",
  }),
});

interface SignContractDialogProps {
  id: string;
  disabled?: boolean;
}

export default function SignContractDialog({ id, disabled }: SignContractDialogProps) {
  const { mutateAsync } = useAgreementProject();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof signContractSchema>>({
    resolver: zodResolver(signContractSchema),
    defaultValues: {
      id: id,
      contract: undefined,
    },
  });

  const onSubmit = async (data: z.infer<typeof signContractSchema>) => {
    try {
      setLoading(true);
      await mutateAsync({ id: data.id, contract: data.contract });
      toast.success("Tanda tangan kontrak berhasil");
    } catch (error) {
      console.error(error);
      toast.error("Gagal menandatangani kontrak");
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild disabled={disabled}>
        <button
          disabled={disabled}
          type="button"
          className="mt-2 rounded border border-blue-500 bg-white px-4 py-2 text-blue-500 transition-colors hover:bg-blue-50"
        >
          Tanda Tangan Kontrak
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tanda Tangan Kontrak</DialogTitle>
          <DialogDescription className="sr-only">
            This action cannot be undone. This will permanently delete your account and remove your
            data from our servers.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="contract"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Input Tanda Tangan <RequiredIcon />
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => field.onChange(e.target.files?.[0])}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button disabled={loading} type="submit">
              {loading ? "Menandatangani..." : "Tanda Tangan"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
