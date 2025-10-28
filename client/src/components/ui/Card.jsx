export default function Card({ title, actions, children, className = "" }) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white/90 shadow-sm backdrop-blur-sm ${className}`}
    >
      {(title || actions) && (
        <header className="flex items-center justify-between px-6 pt-5">
          {title && (
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          )}
          {actions}
        </header>
      )}
      <div className="p-6">{children}</div>
    </section>
  );
}
