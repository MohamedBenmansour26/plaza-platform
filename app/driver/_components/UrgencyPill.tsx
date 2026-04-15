// UrgencyPill — color-coded time-remaining pill.
// Green >60min, Orange 30–60min, Red <30min.

type Props = { minutesRemaining: number };

export function UrgencyPill({ minutesRemaining }: Props) {
  const label =
    minutesRemaining >= 60
      ? `Dans ${Math.round(minutesRemaining / 60 * 10) / 10}h`
      : `Dans ${minutesRemaining} min`;

  const style =
    minutesRemaining >= 60
      ? { bg: 'bg-green-50', text: 'text-green-700' }
      : minutesRemaining >= 30
      ? { bg: 'bg-[#FFF7ED]', text: 'text-[#E8632A]' }   // orange accent
      : { bg: 'bg-red-50', text: 'text-red-600' };

  return (
    <span className={`${style.bg} ${style.text} text-[11px] font-bold px-2 py-1 rounded-full`}>
      {label}
    </span>
  );
}
