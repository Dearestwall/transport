'use client'
import { useRef, useState } from 'react'
import Papa from 'papaparse'
import toast from 'react-hot-toast'
import { CheckCircle, Download, FileWarning, Upload } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { clientSchema, type ClientFormData } from '@/lib/validations'

type ImportRow = ClientFormData & {
  created_by?: string
  is_deleted?: boolean
  locked?: boolean
}

export default function ImportExportPage() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [rows, setRows] = useState<ImportRow[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [importing, setImporting] = useState(false)

  const downloadTemplate = () => {
    const csv = Papa.unparse([
      {
        company_name: 'ABC Logistics',
        contact_person: 'Amit',
        phone: '9876543210',
        email: 'abc@example.com',
        address: 'Pune',
        city: 'Pune',
        state: 'Maharashtra',
        gst_number: '27ABCDE1234F1Z5',
        credit_limit: 50000,
        credit_days: 30,
      },
    ])

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'clients-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleFile = (file: File) => {
    setRows([])
    setErrors([])

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: result => {
        const validRows: ImportRow[] = []
        const nextErrors: string[] = []

        result.data.forEach((raw, index) => {
          const parsed = clientSchema.safeParse(raw)

          if (!parsed.success) {
            const msg = parsed.error.issues
              .map(issue => `${issue.path.join('.')}: ${issue.message}`)
              .join(', ')
            nextErrors.push(`Row ${index + 2}: ${msg}`)
            return
          }

          validRows.push(parsed.data)
        })

        setRows(validRows)
        setErrors(nextErrors)

        if (validRows.length > 0) {
          toast.success(`${validRows.length} valid row(s) ready`)
        }
        if (nextErrors.length > 0) {
          toast.error(`${nextErrors.length} row(s) have validation errors`)
        }
      },
      error: err => {
        toast.error(err.message)
      },
    })
  }

  const handleImport = async () => {
    if (!rows.length) {
      toast.error('No valid rows to import')
      return
    }

    setImporting(true)
    try {
      const sb = getSupabaseClient()
      const { data: { user } } = await sb.auth.getUser()
      if (!user) {
        toast.error('Not authenticated')
        return
      }

      const payload = rows.map(row => ({
        ...row,
        created_by: user.id,
        is_deleted: false,
        locked: false,
      }))

      const { error } = await sb.from('clients').insert(payload)
      if (error) throw error

      toast.success(`Imported ${payload.length} client(s)`)
      setRows([])
      setErrors([])
      if (inputRef.current) inputRef.current.value = ''
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-base font-semibold">Import / Export</h1>
        <p className="text-xs text-[var(--color-text-muted)]">
          Import clients from CSV and download a ready-to-use template.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Upload size={16} />
            <h2 className="text-sm font-semibold">Import Clients CSV</h2>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            onChange={e => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
            }}
            className="block w-full text-sm"
          />

          <div className="flex gap-2">
            <button
              onClick={handleImport}
              disabled={!rows.length || importing}
              className="px-3 py-2 text-xs rounded-lg bg-[var(--color-primary)] text-white hover:opacity-90 disabled:opacity-50"
            >
              {importing ? 'Importing...' : `Import ${rows.length || ''} Row(s)`}
            </button>

            <button
              onClick={() => {
                setRows([])
                setErrors([])
                if (inputRef.current) inputRef.current.value = ''
              }}
              className="px-3 py-2 text-xs rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-surface-offset)]"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Download size={16} />
            <h2 className="text-sm font-semibold">Template</h2>
          </div>

          <p className="text-xs text-[var(--color-text-muted)]">
            Download the sample CSV, fill it, then upload it back here.
          </p>

          <button
            onClick={downloadTemplate}
            className="px-3 py-2 text-xs rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-surface-offset)]"
          >
            Download Clients Template
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={16} className="text-green-600" />
            <h3 className="text-sm font-semibold">Valid Rows ({rows.length})</h3>
          </div>

          <div className="max-h-72 overflow-auto space-y-2">
            {rows.length === 0 ? (
              <p className="text-xs text-[var(--color-text-muted)]">No valid rows yet.</p>
            ) : (
              rows.map((row, i) => (
                <div key={i} className="rounded-xl border border-[var(--color-border)] p-3 text-xs">
                  <p className="font-medium">{row.company_name}</p>
                  <p className="text-[var(--color-text-muted)]">
                    {row.phone} · {row.city || '—'} · Credit: {row.credit_limit}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileWarning size={16} className="text-red-600" />
            <h3 className="text-sm font-semibold">Validation Errors ({errors.length})</h3>
          </div>

          <div className="max-h-72 overflow-auto space-y-2">
            {errors.length === 0 ? (
              <p className="text-xs text-[var(--color-text-muted)]">No validation errors.</p>
            ) : (
              errors.map((err, i) => (
                <div key={i} className="rounded-xl border border-red-200 bg-red-50/40 dark:bg-red-950/10 p-3 text-xs text-red-700 dark:text-red-300">
                  {err}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}