import { useSearchParams } from "@remix-run/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

interface PaginationProps {
  totalItems: number;
  itemsPerPageOptions: number[];
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  currentPage: number;
  itemsPerPage: number;
}

export default function StyledPagination({
  totalItems,
  itemsPerPageOptions,
  onPageChange,
  onItemsPerPageChange,
  currentPage,
  itemsPerPage,
}: PaginationProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    setSearchParams(params);
    onPageChange(page);
    const element = document.getElementById("main-layout");
    setTimeout(() => {
      element?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleItemsPerPageChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    const newItemsPerPage = Number.parseInt(value, 10);
    params.set("itemsPerPage", newItemsPerPage.toString());
    params.set("page", "1");
    setSearchParams(params);
    onItemsPerPageChange(newItemsPerPage);
    const element = document.getElementById("main-layout");
    setTimeout(() => {
      element?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <nav className="flex items-center justify-between rounded-md border bg-white px-2 py-1">
      <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
        <SelectTrigger className="w-[70px]">
          <SelectValue placeholder={itemsPerPage} />
        </SelectTrigger>
        <SelectContent>
          {itemsPerPageOptions.map((option) => (
            <SelectItem key={option} value={option.toString()}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <span className="text-gray-500 text-sm">
        Menampilkan {startItem} hingga {endItem} dari {totalItems} data
      </span>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {[currentPage - 1, currentPage, currentPage + 1].map(
          (page) =>
            page > 0 &&
            page <= totalPages && (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="icon"
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Button>
            ),
        )}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
}
