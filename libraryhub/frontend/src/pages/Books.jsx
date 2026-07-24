import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiGet } from "../api/client";
import BookCard from "../components/BookCard";
import BookSkeleton from "../components/BookSkeleton";
import EmptyState from "../components/EmptyState";

const CATEGORIES = ["", "Programming", "Science", "Mathematics", "History", "Literature", "AI", "Networking", "Database"];

export default function Books() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const search = params.get("search") || "";
  const category = params.get("category") || "";
  const page = parseInt(params.get("page") || "1", 10);

  const load = useCallback(() => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (search) qs.set("search", search);
    if (category) qs.set("category", category);
    qs.set("page", String(page));
    qs.set("limit", "12");

    apiGet(`/books?${qs}`)
      .then((data) => {
        setBooks(data.books);
        setPagination(data.pagination);
        setError("");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [search, category, page]);

  useEffect(() => {
    load();
  }, [load]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.set("page", "1");
    setParams(next);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold">Book catalog</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        {pagination.total} engineering & technology titles
      </p>

      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-end">
        <div className="flex-1">
          <label className="text-sm font-medium">Search</label>
          <input
            className="input-field mt-1"
            placeholder="Title, author, ISBN..."
            defaultValue={search}
            onKeyDown={(e) => e.key === "Enter" && updateParam("search", e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Category</label>
          <select
            className="input-field mt-1 min-w-[180px]"
            value={category}
            onChange={(e) => updateParam("category", e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c || "all"} value={c}>
                {c || "All categories"}
              </option>
            ))}
          </select>
        </div>
        <button type="button" className="btn-primary" onClick={() => load()}>
          Search
        </button>
      </div>

      {error && <p className="mt-6 text-rose-600">{error}</p>}

      <div className="mt-10">
        {loading ? (
          <BookSkeleton />
        ) : books.length === 0 ? (
          <EmptyState title="No books found" message="Try another search or category." />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {books.map((book) => (
              <BookCard
                key={book.bookId}
                book={book}
                onBorrow={(b) => navigate("/borrow", { state: { book: b } })}
              />
            ))}
          </div>
        )}
      </div>

      {!loading && pagination.totalPages > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          <button
            type="button"
            className="btn-secondary"
            disabled={page <= 1}
            onClick={() => updateParam("page", String(page - 1))}
          >
            Previous
          </button>
          <span className="flex items-center px-4 text-sm">
            Page {page} of {pagination.totalPages}
          </span>
          <button
            type="button"
            className="btn-secondary"
            disabled={page >= pagination.totalPages}
            onClick={() => updateParam("page", String(page + 1))}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}


