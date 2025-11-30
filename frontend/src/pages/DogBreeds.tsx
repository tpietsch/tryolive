import { useState, useEffect } from "react";
import PageMeta from "../components/common/PageMeta";
import SimpleHeader from "../components/header/SimpleHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import PaginationWithIcon from "../components/tables/DataTables/TableOne/PaginationWithIcon";
import { breedService, Breed } from "../services/api";
import {DEFAULT_DOG_IMAGE} from "../constants.ts";

export default function DogBreeds() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaginating, setIsPaginating] = useState(false);

  useEffect(() => {
    async function fetchBreeds() {
      try {
        // If we already have data, we're paginating
        if (breeds.length > 0) {
          setIsPaginating(true);
        } else {
          setLoading(true);
        }

        const response = await breedService.getBreeds({
          page: currentPage,
          page_size: itemsPerPage,
        });
        setBreeds(response.items);
      } catch (error) {
        console.error("Failed to fetch breeds:", error);
      } finally {
        setLoading(false);
        setIsPaginating(false);
      }
    }

    fetchBreeds();
  }, [currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const TableSkeleton = () => (
    <>
      {[...Array(itemsPerPage)].map((_, index) => (
        <TableRow key={index}>
          <TableCell className="px-4 py-3 border border-gray-100">
            <div className="h-5 bg-gray-200 rounded animate-pulse w-32"></div>
          </TableCell>
          <TableCell className="px-4 py-3 border border-gray-100">
            <div className="h-16 w-16 bg-gray-200 rounded animate-pulse"></div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );

  return (
    <div className="min-h-screen bg-brand-50">
      <PageMeta
        title="Dog Breeds | TailAdmin"
        description="Browse different dog breeds and their characteristics"
      />
      <SimpleHeader pageTitle="Dog Breeds" />

      <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
        <div className="space-y-5 sm:space-y-6">
          <div className="overflow-hidden bg-white rounded-xl">
            <div className="flex flex-col gap-2 px-4 py-4 border border-b-0 border-gray-100 rounded-t-xl sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <span className="text-gray-900"> Show </span>
                <div className="relative z-20 bg-transparent">
                  <select
                    className="w-full py-2 pl-3 pr-8 text-sm text-gray-900 bg-transparent border border-gray-300 rounded-lg appearance-none h-9 bg-none shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    disabled={isPaginating}
                  >
                    {[5, 8, 10, 15].map((value) => (
                      <option
                        key={value}
                        value={value}
                        className="text-gray-900"
                      >
                        {value}
                      </option>
                    ))}
                  </select>
                  <span className="absolute z-30 text-gray-900 -translate-y-1/2 right-2 top-1/2">
                    <svg
                      className="stroke-current"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3.8335 5.9165L8.00016 10.0832L12.1668 5.9165"
                        stroke=""
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
                <span className="text-gray-500"> entries </span>
              </div>
              <p className="text-xs text-gray-500 mt-2 sm:mt-0">
                Note: We need to page through the results per page to have an accurate entries per page count.
              </p>
            </div>

            <div className="max-w-full overflow-x-auto custom-scrollbar">
              <div className="relative">
                {isPaginating && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3 bg-white px-6 py-4 rounded-lg shadow-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-600"></div>
                        <span className="text-sm font-medium text-gray-900">Loading breeds...</span>
                      </div>
                    </div>
                  </div>
                )}
                <Table>
                  <TableHeader className="border-t border-gray-100">
                    <TableRow>
                      {[
                        { key: "breed", label: "Breed Name" },
                        { key: "image", label: "Image" },
                      ].map(({ key, label }) => (
                        <TableCell
                          key={key}
                          isHeader
                          className="px-4 py-3 border border-gray-100"
                        >
                          <p className="font-medium text-gray-700 text-theme-xs">
                            {label}
                          </p>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableSkeleton />
                    ) : breeds.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="px-4 py-12 text-center border border-gray-100">
                          <div className="flex flex-col items-center gap-2">
                            <svg
                              className="w-12 h-12 text-gray-300"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                              />
                            </svg>
                            <span className="text-lg font-medium text-gray-900">No breeds found</span>
                            <span className="text-sm text-gray-500">Try adjusting your filters or check back later</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      breeds.map((breed,index) => (
                        <TableRow key={index}>
                          <TableCell className="px-4 py-3 border border-gray-100 whitespace-nowrap">
                            <span className="block font-medium text-gray-800 text-theme-sm">
                              {breed.breed}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-3 font-normal text-gray-800 border border-gray-100 text-theme-sm whitespace-nowrap">
                            {breed.image ? (
                              <img
                                src={breed.image}
                                alt={breed.breed}
                                className="h-16 w-16 object-cover rounded"
                              />
                            ) : (
                                <img
                                    src={DEFAULT_DOG_IMAGE}
                                    alt={breed.breed}
                                    className="h-16 w-16 object-cover rounded"
                                />
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="border border-t-0 rounded-b-xl border-gray-100 py-4 pl-[18px] pr-4 dark:border-white/[0.05]">
              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-end">
                <PaginationWithIcon
                  initialPage={currentPage}
                  onPageChange={handlePageChange}
                  disabled={isPaginating}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
