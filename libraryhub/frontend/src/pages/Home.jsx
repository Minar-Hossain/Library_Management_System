import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { apiGet } from "../api/client";
import BookCard from "../components/BookCard";
import BookSkeleton from "../components/BookSkeleton";

function StatCard({ label, value, icon }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="glass-card p-6 text-center"
    >
      <p className="text-3xl">{icon}</p>
      <p className="mt-2 font-display text-3xl font-bold text-brand-600">{value}</p>
      <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>
    </motion.div>
  );
}

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet("/stats")
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats;

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-indigo-800 px-4 py-20 text-white sm:px-6">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40" />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mx-auto max-w-4xl text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-100">University DBMS Project</p>
          <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl md:text-6xl">Welcome to LibraryHub</h1>
          <p className="mt-6 text-lg text-brand-100">
            Manage books, borrowing, returns, and student records — no login required.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/books" className="rounded-xl bg-white px-6 py-3 font-semibold text-brand-700 shadow-lg hover:bg-brand-50">
              Browse catalog
            </Link>
            <Link to="/borrow" className="rounded-xl border-2 border-white/80 px-6 py-3 font-semibold hover:bg-white/10">
              Borrow a book
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-center font-display text-2xl font-semibold">Library at a glance</h2>
        {error && <p className="mt-4 text-center text-rose-600">{error}</p>}
        {loading ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
            ))}
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total books" value={stats?.totalBooks ?? 0} icon="📖" />
            <StatCard label="Available copies" value={stats?.availableCopies ?? 0} icon="✅" />
            <StatCard label="Borrowed copies" value={stats?.borrowedCopies ?? 0} icon="📤" />
            <StatCard label="Students" value={stats?.totalStudents ?? 0} icon="🎓" />
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold">Featured books</h2>
            <p className="text-slate-600 dark:text-slate-400">Engineering & technology picks</p>
          </div>
          <Link to="/books" className="text-sm font-semibold text-brand-600 hover:underline">
            View all →
          </Link>
        </div>
        {loading ? (
          <BookSkeleton count={4} />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(data?.featured || []).map((book) => (
              <BookCard key={book.bookId} book={book} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}



