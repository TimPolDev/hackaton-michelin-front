type MichelinBadgeProps = {
  /** Texte du badge : "M" (compact) ou "Michelin". */
  label?: string;
  /** Hauteur du badge en px. */
  size?: 'sm' | 'md' | 'lg';
};

const SIZES = {
  sm: 'h-[30px] px-[6px] text-[9px]',
  md: 'h-[32px] px-[8px] text-[11px] tracking-[0.06em]',
  lg: 'h-[34px] px-[10px] text-[13px] tracking-[0.1em]',
} as const;

/** Pastille de marque Michelin (fond bleu, texte jaune extra-bold italic). */
export default function MichelinBadge({ label = 'Michelin', size = 'md' }: MichelinBadgeProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center bg-[#27509b] font-extrabold italic text-[#FCE500] ${SIZES[size]}`}
    >
      {label}
    </span>
  );
}
