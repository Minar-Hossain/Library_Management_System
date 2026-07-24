import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function BookCard({ book, onBorrow }) {
  const available = book.availableCopies > 0;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card group flex flex-col overflow-hidden transition hover:-translate-y-1"
    >
      <Link to={`/books/${book.bookId}`} className="relative aspect-[3/4] overflow-hidden bg-slate-200 dark:bg-slate-800">
        <img
          src={book.coverImage}
          alt={book.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.target.src = `https://placehold.co/400x560/1e3a5f/fff?text=${encodeURIComponent(book.title.slice(0, 20))}`;
          }}
        />
        <span
          className={`absolute right-2 top-2 rounded-full px-2.5 py-1 text-xs font-semibold ${
            available ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
          }`}
        >
          {available ? `${book.availableCopies} left` : "Out"}
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-brand-600">{book.category}</p>
        <Link to={`/books/${book.bookId}`}>
          <h3 className="mt-1 font-display text-lg font-semibold leading-snug line-clamp-2 hover:text-brand-600">
            {book.title}
          </h3>
        </Link>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{book.author}</p>
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-xs text-slate-500">{book.publicationYear}</span>
          {onBorrow ? (
            <button
              type="button"
              disabled={!available}
              onClick={() => onBorrow(book)}
              className="btn-primary py-2 text-xs disabled:cursor-not-allowed"
            >
              Borrow
            </button>
          ) : (
            <Link to={`/books/${book.bookId}`} className="text-sm font-semibold text-brand-600 hover:underline">
              Details →
            </Link>
          )}
        </div>
      </div>
    </motion.article>
  );
}


