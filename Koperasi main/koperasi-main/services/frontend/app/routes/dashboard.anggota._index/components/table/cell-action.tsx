import { Link } from "@remix-run/react";
import { PencilIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import type { Anggota } from "~/types/api/anggota";

interface CellActionProps {
  data: Anggota;
}

export function CellAction({ data }: CellActionProps) {
  return (
    <>
      <Button asChild className="bg-blue-500 hover:bg-blue-400" size="sm">
        <Link to={`/dashboard/anggota/${data.id}`}>
          <PencilIcon className="h-5 w-5" />
        </Link>
      </Button>
    </>
  );
}
