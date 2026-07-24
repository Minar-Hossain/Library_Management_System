import { useEffect, useState } from "react";
import { apiGet } from "../api/client";

export default function Records() {
  const [search, setSearch] = useState("");
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const load = (page = 1) => {
    setLoading(true);
    const qs = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) qs.set("search", search);
    apiGet(`/borrow?${qs}`)
      .then((d) => {
        setRecords(d.records);
        setPagination(d.pagination);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(1);
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold">Student borrowing records</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">All borrow history from the database.</p>

      <div className="mt-8 flex gap-2">
        <input
          className="input-field flex-1"
          placeholder="Search student or book..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="button" className="btn-primary" onClick={() => load(1)}>
          Search
        </button>
      </div>

      <div className="glass-card mt-8 overflow-x-auto">
        {loading ? (
          <p className="p-8 text-center">Loading records...</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4">Books</th>
                <th className="p-4">Borrowed</th>
                <th className="p-4">Due</th>
                <th className="p-4">Returned</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.recordId} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="p-4">
                    <span className="font-medium">{r.studentName}</span>
                    <br />
                    <span className="text-xs text-slate-500">{r.studentId}</span>
                  </td>
                  <td className="p-4 max-w-xs truncate">{r.bookTitles || "—"}</td>
                  <td className="p-4">{r.borrowDate}</td>
                  <td className="p-4">{r.dueDate}</td>
                  <td className="p-4">{r.returnDate || "—"}</td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        r.status === "returned"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            type="button"
            className="btn-secondary"
            disabled={pagination.page <= 1}
            onClick={() => load(pagination.page - 1)}
          >
            Prev
          </button>
          <span className="px-4 py-2 text-sm">
            Page {pagination.page} / {pagination.totalPages}
          </span>
          <button
            type="button"
            className="btn-secondary"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => load(pagination.page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

