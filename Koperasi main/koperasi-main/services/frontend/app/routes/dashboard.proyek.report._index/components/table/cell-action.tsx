import { Link } from "@remix-run/react";
import { EyeIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import type { Proyek } from "~/types/api/proyek";

interface CellActionProps {
  data: Proyek;
}

export function CellAction({ data }: CellActionProps) {
  return (
    <>
      <Button asChild size="sm">
        <Link to={`/dashboard/proyek/report/${data.id}`}>
          <EyeIcon className="h-5 w-5" />
        </Link>
      </Button>
    </>
  );
}
