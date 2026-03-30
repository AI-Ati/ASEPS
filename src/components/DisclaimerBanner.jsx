export default function DisclaimerBanner() {
  return (
    <div className="bg-amber-50 border-b-2 border-amber-300 no-print" role="banner" aria-label="Important disclaimer">
      <div className="max-w-screen-xl mx-auto px-6 py-2.5 flex items-start gap-3">
        <span className="text-amber-600 text-sm mt-0.5 flex-shrink-0" aria-hidden="true">⚠</span>
        <p className="text-amber-800 text-xs font-sans leading-relaxed">
          <strong>Educational Research Tool:</strong>{' '}
          ASEPS is an independent academic simulator for educational and research purposes only. 
          All data sourced exclusively from ABS, RBA, and official state treasury publications. 
          Economic models and pathways are based on peer-reviewed research — they are{' '}
          <strong>not</strong> financial, investment, or government policy advice. 
          All calculations are transparent and fully cited. Verify against primary sources before any application.
        </p>
      </div>
    </div>
  )
}
