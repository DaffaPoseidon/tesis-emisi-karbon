import { DataTable } from "~/components/table/data-table";
import { columns } from "./table/columns";
import Spinner from "~/components/ui/spinner";
import { useGethistoryProjectById } from "~/services/project-wallet/get-by-id";

interface SecondSectionProps {
  id: string | number;
}

export default function SecondSection({ id }: SecondSectionProps) {
  const { data, isLoading } = useGethistoryProjectById({
    id,
    isDashboard: false,
  });
  return (
    <section className="order-2 min-w-96 flex-1 space-y-6 rounded-md bg-white p-6 transition-all xl:order-1">
      <div className="space-y-9">
        <h3 className="font-semibold text-lg">Riwayat Transfer</h3>
      </div>
      <div className="space-y-3 overflow-hidden rounded-md ">
        {isLoading ? (
          <div className="mx-auto flex items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={data || []}
            searchKey="project_judul"
            searchLabel="Nama Proyek"
          />
        )}
      </div>
    </section>
  );
}
