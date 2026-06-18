interface PageLoaderProps {
  label?: string;
  fullScreen?: boolean;
}

export function PageLoader({
  label = 'Chargement en cours...',
  fullScreen = true,
}: PageLoaderProps) {
  const wrapperClass = fullScreen
    ? 'min-h-screen bg-michelin-blue flex items-center justify-center px-4'
    : 'rounded-2xl bg-michelin-blue flex items-center justify-center py-16 px-4';

  return (
    <div className={wrapperClass}>
      <div className="flex flex-col items-center gap-6 text-center">
        {/* Spinning group: conic ring + accent dot rotate together */}
        <div className="relative h-14 w-14 animate-spin [animation-duration:0.85s] [animation-timing-function:cubic-bezier(0.6,0.1,0.3,0.9)]">
          {/* Conic gradient ring with smooth trailing fade */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.12) 110deg, #ffffff 340deg, #ffffff 360deg)',
              WebkitMask:
                'radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 4px))',
              mask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 4px))',
            }}
          />
          {/* Accent dot riding the ring head */}
          <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-white shadow-[0_0_8px_1px] shadow-white/60" />
        </div>

        <p className="text-sm font-medium tracking-tight text-white/90">
          {label}
        </p>
      </div>
    </div>
  );
}
