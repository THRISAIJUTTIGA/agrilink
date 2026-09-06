export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white border border-soil-100 rounded-card p-5 ${className}`}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, sub, tone = 'field' }) {
  const toneMap = {
    field: 'text-field-600',
    harvest: 'text-harvest-600',
    sky: 'text-sky-600',
    rust: 'text-rust-500',
  };
  return (
    <Card>
      <p className="text-xs uppercase tracking-wide text-soil-400 font-medium">{label}</p>
      <p className={`font-display text-3xl mt-1 ${toneMap[tone]}`}>{value}</p>
      {sub && <p className="text-xs text-soil-400 mt-1">{sub}</p>}
    </Card>
  );
}

export function Badge({ children, tone = 'neutral' }) {
  const toneMap = {
    neutral: 'bg-soil-100 text-soil-600',
    success: 'bg-field-100 text-field-700',
    warning: 'bg-harvest-100 text-harvest-600',
    danger: 'bg-red-100 text-rust-600',
    info: 'bg-sky-100 text-sky-600',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-pill text-xs font-medium ${toneMap[tone]}`}>
      {children}
    </span>
  );
}

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'bg-field-600 text-white hover:bg-field-700',
    secondary: 'bg-white border border-soil-100 text-soil-800 hover:bg-soil-50',
    danger: 'bg-rust-500 text-white hover:bg-rust-600',
    ghost: 'text-field-600 hover:bg-field-50',
  };
  return (
    <button
      className={`px-4 py-2 rounded-card text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function EmptyState({ title, message }) {
  return (
    <div className="text-center py-12 text-soil-400">
      <p className="font-display text-lg text-soil-600">{title}</p>
      <p className="text-sm mt-1">{message}</p>
    </div>
  );
}

export function Loading({ label = 'Loading…' }) {
  return (
    <div className="flex items-center gap-2 text-soil-400 text-sm py-8 justify-center">
      <span className="w-2 h-2 rounded-full bg-field-400 animate-pulse" />
      {label}
    </div>
  );
}

export function DemoTag() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-[10px] font-semibold bg-harvest-100 text-harvest-600 border border-harvest-400/30">
      DEMO MODE
    </span>
  );
}
