// Shared primitives — keeps every page a few lines instead of repeating classes.

export function Card({ as: Tag = "div", className = "", children, ...props }) {
  return (
    <Tag
      className={`rounded-xl border border-line bg-white/60 p-5 ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function Field({ label, children }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-xs font-medium text-ink-soft">{label}</span>}
      {children}
    </label>
  );
}

const inputBase =
  "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none placeholder:text-ink-soft/50 focus:border-accent transition";

export function Input(props) {
  return <input className={inputBase} {...props} />;
}

export function Select({ children, className = "", ...props }) {
  return (
    <select className={`${inputBase} ${className}`} {...props}>
      {children}
    </select>
  );
}

export function Button({ variant = "primary", className = "", children, ...props }) {
  const variants = {
    primary: "bg-ink text-paper hover:bg-ink-soft",
    accent: "bg-accent text-white hover:brightness-95",
    ghost: "border border-line bg-transparent text-ink hover:bg-paper-dim",
    danger: "bg-danger/10 text-danger hover:bg-danger/20",
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium transition disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Eyebrow({ children }) {
  return (
    <p className="font-mono text-xs uppercase tracking-widest text-accent mb-1.5">
      {children}
    </p>
  );
}

export function Money({ children }) {
  return <span className="font-mono">₹{children}</span>;
}
