import React, { useMemo } from "react";
import PropTypes from "prop-types";
import styles from "./Pagination.module.scss";

const DOTS = "...";

function range(start, end) {
  const length = end - start + 1;
  return Array.from({ length }, (_, idx) => idx + start);
}

function usePagination({ currentPage, totalCount, siblingCount = 1, pageSize }) {
  return useMemo(() => {
    const totalPageCount = Math.max(1, Math.ceil((totalCount || 0) / (pageSize || 1)));

    // Pages count to show in control:
    // first, last, current, 2*siblingCount, and 2 dots
    const totalPageNumbers = siblingCount + siblingCount + 5;

    // Case 1: no dots, show all pages
    if (totalPageNumbers >= totalPageCount) {
      return range(1, totalPageCount);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPageCount);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPageCount - 1;

    const firstPageIndex = 1;
    const lastPageIndex = totalPageCount;

    // Case 2: no left dots, but right dots
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = range(1, leftItemCount);
      return [...leftRange, DOTS, totalPageCount];
    }

    // Case 3: left dots, but no right dots
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = range(totalPageCount - rightItemCount + 1, totalPageCount);
      return [firstPageIndex, DOTS, ...rightRange];
    }

    // Case 4: both left and right dots
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }

    // Fallback
    return range(1, totalPageCount);
  }, [currentPage, totalCount, siblingCount, pageSize]);
}

export default function Pagination({
  currentPage,
  totalCount,
  pageSize,
  onPageChange,
  siblingCount = 1,
  className = "",
  labels = {
    previous: "Précédent",
    next: "Suivant",
    page: "Aller à la page",
    currentPage: "Page actuelle",
  },
}) {
  const totalPageCount = Math.max(1, Math.ceil((totalCount || 0) / (pageSize || 1)));
  const paginationRange = usePagination({ currentPage, totalCount, siblingCount, pageSize });

  if (totalPageCount <= 1) {
    return null;
  }

  const onNext = () => {
    if (currentPage < totalPageCount) {
      onPageChange(currentPage + 1);
    }
  };

  const onPrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  return (
    <nav className={`${styles.pagination} ${className}`} aria-label="Pagination">
      <ul className={styles.list} role="list">
        <li className={`${styles.item} ${currentPage <= 1 ? styles.disabled : ""}`}>
          <button
            type="button"
            className={styles.button}
            onClick={onPrevious}
            disabled={currentPage <= 1}
            aria-label={`${labels.previous}`}
          >
            ← {labels.previous}
          </button>
        </li>

        {paginationRange.map((pageNumber, idx) => {
          if (pageNumber === DOTS) {
            return (
              <li key={`dots-${idx}`} className={`${styles.item} ${styles.dots}`} aria-hidden="true">
                <span className={styles.ellipsis}>…</span>
              </li>
            );
          }

          const isActive = pageNumber === currentPage;

          return (
            <li key={pageNumber} className={`${styles.item} ${isActive ? styles.active : ""}`}>
              <button
                type="button"
                className={styles.button}
                onClick={() => onPageChange(pageNumber)}
                aria-label={`${labels.page} ${pageNumber}`}
                aria-current={isActive ? "page" : undefined}
              >
                {pageNumber}
              </button>
            </li>
          );
        })}

        <li className={`${styles.item} ${currentPage >= totalPageCount ? styles.disabled : ""}`}>
          <button
            type="button"
            className={styles.button}
            onClick={onNext}
            disabled={currentPage >= totalPageCount}
            aria-label={`${labels.next}`}
          >
            {labels.next} →
          </button>
        </li>
      </ul>
    </nav>
  );
}

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  siblingCount: PropTypes.number,
  className: PropTypes.string,
  labels: PropTypes.shape({
    previous: PropTypes.string,
    next: PropTypes.string,
    page: PropTypes.string,
    currentPage: PropTypes.string,
  }),
};
