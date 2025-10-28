const base =
  "inline-flex items-center justify-center gap-1 rounded-lg font-medium transition active:scale-[.99] disabled:opacity-50 disabled:cursor-not-allowed";

const variants = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-700",
  secondary: "bg-slate-200 text-slate-800 hover:bg-slate-300",
  danger: "bg-rose-600 text-white hover:bg-rose-700",
  outline: "border border-slate-300 text-slate-800 hover:bg-white/60",
};

const sizes = {
  sm: "text-sm px-3 py-1.5",
  md: "text-sm px-4 py-2",
  lg: "text-base px-5 py-2.5",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
