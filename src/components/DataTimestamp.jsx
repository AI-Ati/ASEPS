export default function DataTimestamp({ meta }) {
  if (!meta) return null
  return (
    <span className="text-federal-300 text-xs font-sans">
      Data: {meta.reference_period} · Next update: {meta.next_auto_update}
    </span>
  )
}
