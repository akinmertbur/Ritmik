import { useEffect } from "react";

export default function Toast({ open, message, onClose, duration = 1600 }) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [open, onClose, duration]);

  if (!open) return null;
  return (
    <div className="fixed inset-x-0 bottom-6 flex justify-center pointer-events-none">
      <div className="pointer-events-auto rounded-lg bg-slate-900 text-white px-3 py-2 text-sm shadow-md">
        {message}
      </div>
    </div>
  );
}
