import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { apiGet } from "../api/client";
import BookCard from "../components/BookCard";
import BookSkeleton from "../components/BookSkeleton";

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet(`/books/${id}`)
      .then((data) => {
        setBook(data.book);
        setSimilar(data.similar || []);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <BookSkeleton count={1} />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">Book not found</h1>
        <Link to="/books" className="mt-4 inline-block text-brand-600">
          Back to catalog
        </Link>
      </div>
    );
  }

  const available = book.availableCopies > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card grid gap-8 p-6 lg:grid-cols-2 lg:p-10"
      >
        <img
          src={book.coverImage}
          alt={book.title}
          className="mx-auto max-h-[520px] w-full max-w-md rounded-2xl object-cover shadow-2xl"
          onError={(e) => {
            e.target.src = `https://placehold.co/400x560/1e3a5f/fff?text=${encodeURIComponent(book.title)}`;
          }}
        />
        <div>
          <p className="text-sm font-semibold uppercase text-brand-600">{book.category}</p>
          <h1 className="mt-2 font-display text-3xl font-bold">{book.title}</h1>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">by {book.author}</p>
          <span
            className={`mt-4 inline-block rounded-full px-3 py-1 text-sm font-semibold ${
              available ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
            }`}
          >
            {available ? `${book.availableCopies} copies available` : "Currently unavailable"}
          </span>
          <p className="mt-6 leading-relaxed text-slate-700 dark:text-slate-300">{book.description}</p>
          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-slate-500">ISBN</dt>
              <dd className="font-medium">{book.isbn || "—"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Year</dt>
              <dd className="font-medium">{book.publicationYear}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Shelf</dt>
              <dd className="font-medium">{book.shelfLocation || "—"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Total copies</dt>
              <dd className="font-medium">{book.totalCopies}</dd>
            </div>
          </dl>
          <button
            type="button"
            disabled={!available}
            className="btn-primary mt-8 w-full sm:w-auto"
            onClick={() => navigate("/borrow", { state: { book } })}
          >
            Borrow this book
          </button>
        </div>
      </motion.div>

      {similar.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-semibold">Similar books</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((b) => (
              <BookCard key={b.bookId} book={b} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}


