import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiDelete, apiGet, apiPost, apiPut } from "../api/client";

const CATEGORIES = ["Programming", "Science", "Mathematics", "History", "Literature", "AI", "Networking", "Database"];

const emptyBook = {
  title: "",
  author: "",
  category: "Programming",
  isbn: "",
  publicationYear: new Date().getFullYear(),
  description: "",
  coverImage: "",
  totalCopies: 3,
  shelfLocation: "",
};

function BarChart({ data, labelKey, valueKey }) {
  const max = Math.max(...data.map((d) => d[valueKey]), 1);
  return (
    <div className="space-y-3">
      {data.map((row) => (
        <div key={row[labelKey] || row.bookId}>
          <div className="mb-1 flex justify-between text-xs">
            <span className="truncate pr-2">{row[labelKey] || row.title}</span>
            <span>{row[valueKey]}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="h-full rounded-full bg-brand-600 transition-all"
              style={{ width: `${(row[valueKey] / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState(emptyBook);
  const [editingId, setEditingId] = useState(null);
  const [tab, setTab] = useState("dashboard");

  const refresh = () => {
    apiGet("/stats").then(setStats);
    apiGet("/books?limit=100").then((d) => setBooks(d.books));
  };

  useEffect(() => {
    refresh();
  }, []);

  const saveBook = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiPut(`/books/${editingId}`, form);
        toast.success("Book updated");
      } else {
        await apiPost("/books", form);
        toast.success("Book added");
      }
      setForm(emptyBook);
      setEditingId(null);
      refresh();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const editBook = (b) => {
    setEditingId(b.bookId);
    setForm({
      title: b.title,
      author: b.author,
      category: b.category,
      isbn: b.isbn || "",
      publicationYear: b.publicationYear,
      description: b.description || "",
      coverImage: b.coverImage || "",
      totalCopies: b.totalCopies,
      shelfLocation: b.shelfLocation || "",
    });
    setTab("books");
  };

  const removeBook = async (id) => {
    if (!window.confirm("Delete this book?")) return;
    try {
      await apiDelete(`/books/${id}`);
      toast.success("Deleted");
      refresh();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const s = stats?.stats;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold">Admin dashboard</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">Public access — no login required.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {["dashboard", "books", "add"].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize ${
              tab === t ? "bg-brand-600 text-white" : "bg-slate-200 dark:bg-slate-800"
            }`}
          >
            {t === "add" ? "Add book" : t}
          </button>
        ))}
      </div>

      {tab === "dashboard" && stats && (
        <div className="mt-8 space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Books", s?.totalBooks],
              ["Available", s?.availableCopies],
              ["Borrowed", s?.borrowedCopies],
              ["Students", s?.totalStudents],
            ].map(([label, val]) => (
              <div key={label} className="glass-card p-5 text-center">
                <p className="text-2xl font-bold text-brand-600">{val}</p>
                <p className="text-sm text-slate-500">{label}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="glass-card p-6">
              <h3 className="font-semibold">Most borrowed books</h3>
              <div className="mt-4">
                <BarChart data={stats.charts.mostBorrowed} labelKey="title" valueKey="borrowCount" />
              </div>
            </div>
            <div className="glass-card p-6">
              <h3 className="font-semibold">Borrowing activity (14 days)</h3>
              <div className="mt-4">
                <BarChart data={stats.charts.activity} labelKey="day" valueKey="count" />
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "books" && (
        <div className="glass-card mt-8 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b dark:border-slate-700">
                <th className="p-3">Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((b) => (
                <tr key={b.bookId} className="border-b dark:border-slate-800">
                  <td className="p-3">{b.title}</td>
                  <td className="p-3">{b.category}</td>
                  <td className="p-3">
                    {b.availableCopies}/{b.totalCopies}
                  </td>
                  <td className="p-3 space-x-2">
                    <button type="button" className="text-brand-600" onClick={() => editBook(b)}>
                      Edit
                    </button>
                    <button type="button" className="text-rose-600" onClick={() => removeBook(b.bookId)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(tab === "add" || editingId) && (
        <form onSubmit={saveBook} className="glass-card mt-8 grid gap-4 p-6 sm:grid-cols-2">
          <h2 className="sm:col-span-2 font-semibold">{editingId ? "Edit book" : "Add new book"}</h2>
          {["title", "author", "isbn", "coverImage", "shelfLocation"].map((field) => (
            <div key={field}>
              <label className="text-sm capitalize">{field}</label>
              <input
                className="input-field mt-1"
                required={field === "title" || field === "author"}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              />
            </div>
          ))}
          <div>
            <label className="text-sm">Category</label>
            <select
              className="input-field mt-1"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm">Year / Copies</label>
            <div className="mt-1 flex gap-2">
              <input
                type="number"
                className="input-field"
                value={form.publicationYear}
                onChange={(e) => setForm({ ...form, publicationYear: e.target.value })}
              />
              <input
                type="number"
                className="input-field"
                value={form.totalCopies}
                onChange={(e) => setForm({ ...form, totalCopies: e.target.value })}
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm">Description</label>
            <textarea
              className="input-field mt-1"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <button type="submit" className="btn-primary sm:col-span-2">
            {editingId ? "Update book" : "Add book"}
          </button>
        </form>
      )}
    </div>
  );
}
