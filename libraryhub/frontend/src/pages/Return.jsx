import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiGet, apiPost } from "../api/client";

export default function Return() {
  const [search, setSearch] = useState("");
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [returning, setReturning] = useState(null);

  const load = () => {
    setLoading(true);
    const qs = search ? `?search=${encodeURIComponent(search)}` : "";
    apiGet(`/borrow/active${qs}`)
      .then((d) => setBorrows(d.borrows))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleReturn = async (row) => {
    setReturning(row.itemId);
    try {
      await apiPost("/borrow/return", { itemId: row.itemId, recordId: row.recordId, bookId: row.bookId });
      toast.success(`Returned "${row.title}"`);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setReturning(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold">Return a book</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">Search active borrows and mark as returned.</p>

      <div className="mt-8 flex gap-2">
        <input
          className="input-field flex-1"
          placeholder="Student ID, name, or book title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="button" className="btn-primary" onClick={load}>
          Search
        </button>
      </div>

      <div className="glass-card mt-8 overflow-x-auto">
        {loading ? (
          <p className="p-8 text-center text-slate-500">Loading...</p>
        ) : borrows.length === 0 ? (
          <p className="p-8 text-center text-slate-500">No active borrows found.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-4">Book</th>
                <th className="p-4">Student</th>
                <th className="p-4">Due</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {borrows.map((row) => (
                <tr key={row.itemId} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="p-4 font-medium">{row.title}</td>
                  <td className="p-4">
                    {row.studentName}
                    <br />
                    <span className="text-xs text-slate-500">{row.studentId}</span>
                  </td>
                  <td className="p-4">{row.dueDate}</td>
                  <td className="p-4">
                    <button
                      type="button"
                      className="btn-primary py-2 text-xs"
                      disabled={returning === row.itemId}
                      onClick={() => handleReturn(row)}
                    >
                      {returning === row.itemId ? "..." : "Return"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

