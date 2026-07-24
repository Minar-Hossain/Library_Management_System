import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-100/80 dark:border-slate-800 dark:bg-slate-900/50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6">
        <div>
          <p className="font-display text-lg font-semibold">LibraryHub</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            University Library Management System — DBMS Project
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">Quick links</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
            <li><Link to="/books" className="hover:text-brand-600">Browse books</Link></li>
            <li><Link to="/borrow" className="hover:text-brand-600">Borrow a book</Link></li>
            <li><Link to="/return" className="hover:text-brand-600">Return a book</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Contact</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            library@university.edu · Open Mon–Sat 8am–8pm
          </p>
        </div>
      </div>
      <p className="border-t border-slate-200 py-4 text-center text-xs text-slate-500 dark:border-slate-800">
        © {new Date().getFullYear()} LibraryHub. No login required — public access.
      </p>
    </footer>
  );
}


