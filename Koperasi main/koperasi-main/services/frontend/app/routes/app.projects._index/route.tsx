import { useSearchParams } from "@remix-run/react";
import { Filter } from "lucide-react";
import { useState } from "react";
import ProjectCard from "~/components/cards/project-card";
import PageContainer from "~/components/page-container";
import { Button } from "~/components/ui/button";
import Spinner from "~/components/ui/spinner";
import StyledPagination from "~/components/ui/styled-pagination";
import { useGetAllPaginatedProject } from "~/services/projects/get-all";
import { StatusProject } from "~/types/constants/status-project";

export default function ProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(
    Number.parseInt(searchParams.get("page") ?? "1", 10),
  );
  const [itemsPerPage, setItemsPerPage] = useState(
    Number.parseInt(searchParams.get("itemsPerPage") ?? "10", 10),
  );

  const { data, isLoading } = useGetAllPaginatedProject({
    page: currentPage,
    itemsPerPage,
    filter: StatusProject.PENDANAAN_DIBUKA,
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    setSearchParams(params);
  };
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams);
    params.set("itemsPerPage", newItemsPerPage.toString());
    params.set("page", "1");
    setSearchParams(params);
  };
  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="font-bold text-2xl tracking-tight">Daftar Proyek Yang Ditawarkan</h2>
          <div className="flex items-center gap-3">
            <Button className="gap-2 border-primary" variant="outline">
              <Filter size={20} /> Filter
            </Button>
          </div>
        </div>
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {isLoading ? (
            <div className="col-span-1 mx-auto items-center justify-center md:col-span-2 xl:col-span-3">
              <Spinner />
            </div>
          ) : (
            data?.projects.map((project) => (
              <ProjectCard data={project} to={`/app/projects/${project.id}`} key={project.id} />
            ))
          )}
          {!data && !isLoading && (
            <div className="col-span-1 mx-auto items-center justify-center md:col-span-2 xl:col-span-3">
              <p className="text-center text-gray-500">Tidak ada proyek yang ditemukan</p>
            </div>
          )}
        </section>
        <StyledPagination
          totalItems={data?.total ?? 0}
          itemsPerPageOptions={[10, 20, 50]}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </PageContainer>
  );
}
