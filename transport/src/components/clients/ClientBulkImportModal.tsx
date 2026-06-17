'use client'

import { useMemo, useRef, useState } from 'react'
import Papa from 'papaparse'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Download, FileUp, ClipboardPaste, X } from 'lucide-react'
import { bulkImportClientsAction } from '@/actions/clients'

type ParsedRow = Record<string, string>

export default function ClientBulkImportModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [error, setError] = useState<string>('')

  const headers = useMemo(() => Object.keys(rows[0] ?? {}), [rows])

  if (!open) return null

  const parseText = (text: string) => {
    const result = Papa.parse<ParsedRow>(text, {
      header: true,
      skipEmptyLines: true,
    })

    if (result.errors.length) {
      setError(result.errors[0]?.message ?? 'Failed to parse CSV')
      return
    }

    setError('')
    setRows(result.data)
  }

  const onFile = (file: File) => {
    Papa.parse<ParsedRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        if (result.errors.length) {
          setError(result.errors[0]?.message ?? 'Failed to parse CSV')
          return
        }
        setError('')
        setRows(result.data)
      },
    })
  }

  const onPaste = async () => {
    const text = await navigator.clipboard.readText()
    parseText(text)
  }

  const submit = async () => {
    const formData = new FormData()
    formData.set('rows', JSON.stringify(rows))
    await bulkImportClientsAction(formData)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-5xl rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)]">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold">Import clients</h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              Upload CSV, drag and drop a file, or paste rows from Excel.
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-[var(--color-surface-offset)]">
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-4 p-5 lg:grid-cols-[320px_1fr]">
          <div className="space-y-3">
            <button type="button" className="btn btn-secondary w-full" onClick={() => inputRef.current?.click()}>
              <FileUp size={16} />
              Choose CSV file
            </button>

            <button type="button" className="btn btn-secondary w-full" onClick={onPaste}>
              <ClipboardPaste size={16} />
              Paste from clipboard
            </button>

            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) onFile(file)
              }}
            />

            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const file = e.dataTransfer.files?.[0]
                if (file) onFile(file)
              }}
              className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface-offset)] p-4 text-center"
            >
              <p className="text-sm font-medium">Import data from CSV</p>
              <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                Or drag and drop a CSV file here
              </p>
            </label>

            {error ? <p className="text-sm text-[var(--color-error)]">{error}</p> : null}
          </div>

          <div className="overflow-hidden rounded-2xl border border-[var(--color-border)]">
            <div className="border-b border-[var(--color-border)] px-4 py-3">
              <p className="text-sm font-semibold">Preview</p>
              <p className="text-xs text-[var(--color-text-muted)]">
                Review parsed rows before import
              </p>
            </div>

            <div className="max-h-[420px] overflow-auto">
              <table className="table">
                <thead>
                  <tr>
                    {headers.map((header) => (
                      <th key={header}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 20).map((row, index) => (
                    <tr key={index}>
                      {headers.map((header) => (
                        <td key={header}>{row[header] ?? ''}</td>
                      ))}
                    </tr>
                  ))}
                  {rows.length === 0 ? (
                    <tr>
                      <td className="py-10 text-center text-sm text-[var(--color-text-muted)]">
                        No preview data loaded.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-[var(--color-border)] px-4 py-3">
              <p className="text-xs text-[var(--color-text-muted)]">{rows.length} rows ready</p>
              <div className="flex gap-2">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={submit} disabled={rows.length === 0}>
                  Import rows
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}