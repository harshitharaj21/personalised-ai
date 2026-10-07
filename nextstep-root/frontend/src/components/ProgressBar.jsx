export default function ProgressBar({ percentage = 0, label, showLabel = true, height = 'h-2', color = 'brand' }) {
  const gradients = {
    brand: 'from-brand-500 to-brand-400',
    accent: 'from-accent-500 to-brand-400',
    emerald: 'from-emerald-600 to-emerald-400',
    amber: 'from-amber-600 to-amber-400',
  };

  const gradient = gradients[color] || gradients.brand;
  const clamped = Math.min(Math.max(percentage, 0), 100);

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-center justify-between mb-2">
          {label && <span className="text-sm text-slate-400">{label}</span>}
          <span className="text-sm font-semibold text-white ml-auto">{Math.round(clamped)}%</span>
        </div>
      )}
      <div className={`w-full ${height} bg-white/10 rounded-full overflow-hidden`}>
        <div
          className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
