import { useCallback, useEffect } from "react";
import { PaginationNext, PaginationPrev } from "@/svg";

const Pagination = ({
  items = [],
  countOfPage = 12,
  paginatedData,
  currPage,
  setCurrPage,
}) => {
  const pageStart = (currPage - 1) * countOfPage;
  const totalPage = Math.ceil(items.length / countOfPage);

  const setPage = useCallback(
    (idx) => {
      if (idx <= 0 || idx > totalPage) {
        return;
      }
      const nextPageStart = (idx - 1) * countOfPage;
      setCurrPage(idx);
      window.scrollTo(0, 0);
      paginatedData(items, nextPageStart, countOfPage);
    },
    [countOfPage, items, paginatedData, setCurrPage, totalPage],
  );

  useEffect(() => {
    paginatedData(items, pageStart, countOfPage);
  }, [items, pageStart, countOfPage, paginatedData]);

  return (
    <nav>
      {totalPage > 1 && (
        <ul>
          <li>
            <button
              onClick={() => setPage(currPage - 1)}
              className={`tp-pagination-prev prev page-numbers ${
                currPage === 1 && "disabled"
              }`}
            >
              <PaginationPrev />
            </button>
          </li>

          {Array.from({ length: totalPage }, (_, i) => i + 1).map((n) => (
            <li key={n} onClick={() => setPage(n)}>
              <span className={`${currPage === n ? "current" : ""}`}>{n}</span>
            </li>
          ))}

          <li>
            <button
              onClick={() => setPage(currPage + 1)}
              className={`next page-numbers ${
                currPage === totalPage ? "disabled" : ""
              }`}
            >
              <PaginationNext />
            </button>
          </li>
        </ul>
      )}
    </nav>
  );
};

export default Pagination;
