import { useState } from 'react'

export default function ExportButton({ stateId, stateData }) {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      // Dynamically import html2pdf to keep bundle lean
      const html2pdf = (await import('html2pdf.js')).default

      const element = document.getElementById('aseps-content')
      const stateName = stateData?.name || stateId
      const date = new Date().toISOString().split('T')[0]

      const opt = {
        margin: [12, 12, 16, 12],
        filename: `ASEPS_${stateId}_${date}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          letterRendering: true
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      }

      await html2pdf().set(opt).from(element).save()
    } catch (err) {
      console.error('PDF export error:', err)
      alert('PDF export failed. Please try printing with Ctrl+P / Cmd+P as an alternative.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className={`
        flex items-center gap-2 px-4 py-2 rounded border-2 border-white/30
        text-sm font-sans font-medium text-white
        transition-all duration-200
        ${loading
          ? 'opacity-50 cursor-not-allowed bg-federal-500'
          : 'hover:bg-white/10 hover:border-white/60'
        }
      `}
      aria-label="Export current view as PDF"
    >
      <span aria-hidden="true">{loading ? '⟳' : '↓'}</span>
      {loading ? 'Generating PDF...' : 'Export PDF'}
    </button>
  )
}
