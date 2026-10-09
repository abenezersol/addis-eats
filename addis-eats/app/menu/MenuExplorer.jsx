"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import CategoryBar from "./CategoryBar";
import DishList from "./DishList";
import DishSkeleton from "./DishSkeleton";
import { fetcher } from "../../lib/fetcher";
import { queryDishes } from "../../lib/menuQuery";

const categories = ["all", "starters", "mains", "desserts", "drinks"];

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export default function MenuExplorer({ initialDishes }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const initialPage = Number.parseInt(searchParams.get("page") || "1", 10);
  const [category, setCategory] = useState(categories.includes(initialCategory) ? initialCategory : "all");
  const [term, setTerm] = useState("");
  const [page, setPage] = useState(Number.isFinite(initialPage) && initialPage > 0 ? initialPage : 1);
  const debounced = useDebounce(term, 300);

  useEffect(() => {
    const nextCategory = searchParams.get("category") || "all";
    const nextPage = Number.parseInt(searchParams.get("page") || "1", 10);
    setCategory(categories.includes(nextCategory) ? nextCategory : "all");
    setPage(Number.isFinite(nextPage) && nextPage > 0 ? nextPage : 1);
  }, [searchParams]);

  useEffect(() => {
    setPage(1);
  }, [debounced, category]);

  const browseKey = useMemo(() => {
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    params.set("page", String(page));
    return `/api/dishes?${params.toString()}`;
  }, [category, page]);

  // A null key means an empty search does not issue a search request.
  const searchKey = useMemo(() => {
    if (!debounced) return null;
    const params = new URLSearchParams({ q: debounced, page: String(page) });
    if (category !== "all") params.set("category", category);
    return `/api/dishes?${params.toString()}`;
  }, [category, debounced, page]);

  const { data: browseData, error: browseError, isLoading: browseLoading } = useSWR(
    browseKey,
    fetcher,
    {
      // Seeded with exactly what the API would answer for this key (same function), for any category and page,
      // so a shared link such as /menu?category=mains&page=2 shows its dishes on arrival instead of a skeleton.
      fallbackData: queryDishes(initialDishes, { category: category === "all" ? undefined : category, page }),
      keepPreviousData: true
    }
  );

  const { data: searchData, error: searchError, isLoading: searchLoading } = useSWR(
    searchKey,
    fetcher,
    { keepPreviousData: true }
  );

  function updateUrl(nextCategory, nextPage) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextCategory === "all") params.delete("category");
    else params.set("category", nextCategory);
    if (nextPage === 1) params.delete("page");
    else params.set("page", String(nextPage));
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function changeCategory(nextCategory) {
    setCategory(nextCategory);
    setPage(1);
    updateUrl(nextCategory, 1);
  }

  function changePage(nextPage) {
    setPage(nextPage);
    updateUrl(category, nextPage);
  }

  const data = debounced ? searchData : browseData;
  const error = debounced ? searchError : browseError;
  const isLoading = debounced ? searchLoading : browseLoading;
  const result = data ?? { data: [], total: 0, totalPages: 1, page: page };
  const showSkeleton = isLoading && !data;

  return (
    <section>
      <div className="menu-search-row">
        <label className="search-field">
          <span>Search dishes</span>
          <input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Search by dish, tag, or category…"
            aria-label="Search dishes"
          />
        </label>
        <span className="search-count">
          {result.total} {result.total === 1 ? "dish" : "dishes"}
        </span>
      </div>

      <CategoryBar active={category} onChange={changeCategory} />

      {error ? (
        <div className="error-state">
          <h2>Could not load the menu</h2>
          <p>Please try your search again.</p>
        </div>
      ) : showSkeleton ? (
        <DishSkeleton />
      ) : (
        <>
          <DishList dishes={result.data} />
          {result.totalPages > 1 && (
            <nav className="pagination" aria-label="Menu pages">
              <button type="button" className="chip" disabled={result.page <= 1} onClick={() => changePage(result.page - 1)}>
                ← Previous
              </button>
              <span>Page {result.page} of {result.totalPages}</span>
              <button type="button" className="chip" disabled={result.page >= result.totalPages} onClick={() => changePage(result.page + 1)}>
                Next →
              </button>
            </nav>
          )}
        </>
      )}
    </section>
  );
}
