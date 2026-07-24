import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { apiGet, apiPost } from "../api/client";

export default function Borrow() {
  const location = useLocation();
  const prefill = location.state?.book;

  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({
    studentName: "",
    studentId: "",
    phoneNumber: "",
    bookId: prefill?.bookId || "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiGet("/books?available=true&limit=100").then((d) => setBooks(d.books));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiPost("/borrow", form);
      toast.success(`Borrowed "${res.book?.title}" — due ${res.dueDate}`);
      setForm({ studentName: "", studentId: "", phoneNumber: "", bookId: "", notes: "" });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold">Borrow a book</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">No login required — enter student details below.</p>

      {prefill && (
        <div className="glass-card mt-6 flex gap-4 p-4">
          <img src={prefill.coverImage} alt="" className="h-24 w-16 rounded-lg object-cover" />
          <div>
            <p className="font-semibold">{prefill.title}</p>
            <p className="text-sm text-slate-500">{prefill.author}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card mt-8 space-y-4 p-6">
        <div>
          <label className="text-sm font-medium">Student name *</label>
          <input
            className="input-field mt-1"
            required
            value={form.studentName}
            onChange={(e) => setForm({ ...form, studentName: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Student ID *</label>
          <input
            className="input-field mt-1"
            required
            value={form.studentId}
            onChange={(e) => setForm({ ...form, studentId: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Phone number</label>
          <input
            className="input-field mt-1"
            value={form.phoneNumber}
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Book *</label>
          <select
            className="input-field mt-1"
            required
            value={form.bookId}
            onChange={(e) => setForm({ ...form, bookId: e.target.value })}
          >
            <option value="">Select a book</option>
            {books.map((b) => (
              <option key={b.bookId} value={b.bookId}>
                {b.title} ({b.availableCopies} available)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Notes</label>
          <textarea
            className="input-field mt-1"
            rows={2}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? "Processing..." : "Confirm borrow"}
        </button>
      </form>
    </div>
  );
}


