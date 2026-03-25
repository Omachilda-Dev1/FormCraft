import React, { useState, useEffect } from 'react'
import useFormStore from '../store/formStore'
import { generateSchema } from '../utils/schemaGenerator'

function syntaxHighlight(json) {
  return json
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = 'text-cyan-400'
        if (/^"/.test(match)) {
          cls = /:$/.test(match) ? 'text-violet-400' : 'text-emerald-400'
        } else if (/true|false/.test(match)) {
          cls = 'text-yellow-400'
        } else if (/null/.test(match)) {
          cls = 'text-red-400'
        }
        return `<span class="${cls}">${match}</span>`
      }
    )
}

export default function ExportModal({ onClose }) {
  const { formTitle, formDescription, fields } = useFormStore()
  const [copied, setCopied] = useState(false)
  const [tab, setTab] = useState('schema')

  const schema = generateSchema(formTitle, formDescription, fields)
  const json = JSON.stringify(schema, null, 2)
  const highlighted = syntaxHighlight(json)

  const fieldCount = fields.filter((f) => !['divider', 'heading', 'paragraph'].includes(f.type)).length
  const requiredCount = fields.filter((f) => f.required).length

  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const copy = async () => {
    await navigator.clipboard.writeText(json)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const download = () => {
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${formTitle.replace(/\s+/g, '-').toLowerCase() || 'form'}-schema.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col animate-slide-up border border-gray-200/80 dark:border-gray-700/80"
        style={{ maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/80 dark:border-gray-700/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center shadow-glow-sm">
              <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v8M5 7l3 3 3-3"/><path d="M3 11v2a1 1 0 001 1h8a1 1 0 001-1v-2"/></svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Export Schema</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500">JSON Schema draft-07</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Stats */}
            <div className="hidden sm:flex items-center gap-3 mr-2">
              <div className="text-center">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{fieldCount}</p>
                <p className="text-[10px] text-gray-400">fields</p>
              </div>
              <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />
              <div className="text-center">
                <p className="text-sm font-bold text-red-500">{requiredCount}</p>
                <p className="text-[10px] text-gray-400">required</p>
              </div>
              <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />
              <div className="text-center">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{(json.length / 1024).toFixed(1)}kb</p>
                <p className="text-[10px] text-gray-400">size</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 2l12 12M14 2L2 14"/></svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-3 border-b border-gray-200/80 dark:border-gray-700/80">
          {[
            { id: 'schema', label: 'JSON Schema' },
            { id: 'preview', label: 'Field Summary' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-all duration-150 ${
                tab === t.id
                  ? 'text-accent-600 dark:text-accent-400 border-b-2 border-accent-500 -mb-px bg-accent-50/50 dark:bg-accent-900/10'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {tab === 'schema' && (
            <div className="relative rounded-xl overflow-hidden border border-gray-800">
              {/* Code toolbar */}
              <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                </div>
                <span className="text-[10px] text-gray-500 font-mono">{formTitle.toLowerCase().replace(/\s+/g, '-')}-schema.json</span>
                <button onClick={copy} className="text-[10px] text-gray-400 hover:text-white transition-colors font-medium">
                  {copied ? '✓ copied' : 'copy'}
                </button>
              </div>
              <pre
                className="text-xs font-mono bg-gray-950 p-4 overflow-x-auto leading-relaxed text-gray-300"
                dangerouslySetInnerHTML={{ __html: highlighted }}
              />
            </div>
          )}

          {tab === 'preview' && (
            <div className="space-y-2 animate-fade-in">
              {fields.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">No fields to display</p>
              ) : (
                fields.map((f, i) => (
                  <div key={f.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 w-5 text-right shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{f.label || 'Untitled'}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">{f.type.replace(/_/g, ' ')}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {f.required && <span className="badge-red">required</span>}
                      {f.condition && <span className="badge-accent">conditional</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200/80 dark:border-gray-700/80 gap-3">
          <p className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">
            Compatible with JSON Schema draft-07 validators
          </p>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={copy}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                copied
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400'
                  : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {copied ? (
                <><CheckIcon /> Copied!</>
              ) : (
                <><CopyIcon /> Copy</>
              )}
            </button>
            <button onClick={download} className="btn-primary">
              <DownloadIcon />
              Download .json
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CopyIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="8" height="8" rx="1.5"/><path d="M2 10V3a1 1 0 011-1h7"/></svg>
}
function CheckIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 7l4 4 6-6"/></svg>
}
function DownloadIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7 2v7M4 6l3 3 3-3"/><path d="M2 10v1.5a.5.5 0 00.5.5h9a.5.5 0 00.5-.5V10"/></svg>
}
