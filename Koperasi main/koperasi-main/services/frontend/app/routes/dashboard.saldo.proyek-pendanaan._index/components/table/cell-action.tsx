import { Link } from "@remix-run/react";
import { PencilIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import type { ProyekPendanaan } from "~/types/api/proyek-pendanaan";

interface CellActionProps {
  data: ProyekPendanaan;
}

export function CellAction({ data }: CellActionProps) {
  return (
    <>
      <Button asChild className="bg-blue-500 hover:bg-blue-400" size="sm">
        <Link to={`/dashboard/saldo/proyek-pendanaan/${data.project?.id}`}>
          <PencilIcon className="h-5 w-5" />
        </Link>
      </Button>
    </>
  );
}
