export default function EmptyState({ title, message, action }) {
  return (
    <div className="glass-card flex flex-col items-center px-8 py-16 text-center">
      <span className="text-5xl">📚</span>
      <h3 className="mt-4 font-display text-xl font-semibold">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}


