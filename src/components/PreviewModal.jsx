import React, { useState, useEffect } from 'react'
import useFormStore from '../store/formStore'

function evaluateCondition(condition, values, fields) {
  if (!condition || !condition.fieldId) return true
  const sourceField = fields.find((f) => f.id === condition.fieldId)
  if (!sourceField) return true
  const val = String(values[condition.fieldId] ?? '')
  switch (condition.operator) {
    case 'equals':       return val === condition.value
    case 'not_equals':   return val !== condition.value
    case 'contains':     return val.includes(condition.value)
    case 'not_contains': return !val.includes(condition.value)
    case 'starts_with':  return val.startsWith(condition.value)
    case 'is_not_empty': return val.trim() !== ''
    case 'is_empty':     return val.trim() === ''
    default:             return true
  }
}

function StarInput({ max = 5, value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {Array.from({ length: Number(max) || 5 }).map((_, i) => (
        <button
          key={i}
          type="button"
          onMouseEnter={() => setHovered(i + 1)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(i + 1)}
          className={`w-8 h-8 transition-colors ${i < (hovered || value) ? 'text-yellow-400' : 'text-gray-200 dark:text-gray-600'}`}
        >
          <svg viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
        </button>
      ))}
    </div>
  )
}

function SliderInput({ field, value, onChange }) {
  const min = Number(field.validation?.min) || 0
  const max = Number(field.validation?.max) || 100
  const step = Number(field.validation?.step) || 1
  const val = value ?? min
  const pct = ((val - min) / (max - min)) * 100
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs text-gray-400">{min}</span>
        <span className="text-xs font-semibold text-accent-600 dark:text-accent-400">{val}</span>
        <span className="text-xs text-gray-400">{max}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={val}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-indigo-500"
      />
    </div>
  )
}

function FieldRenderer({ field, value, onChange }) {
  const base = 'w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 transition-all'

  if (field.type === 'divider') {
    return (
      <div className="flex items-center gap-3 my-2">
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        {field.label && <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{field.label}</span>}
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
      </div>
    )
  }
  if (field.type === 'heading') {
    const sizes = { h1: 'text-2xl', h2: 'text-xl', h3: 'text-lg' }
    return <div className={`${sizes[field.level] || 'text-xl'} font-bold text-gray-900 dark:text-white mt-2`}>{field.label}</div>
  }
  if (field.type === 'paragraph') {
    return <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{field.content}</p>
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <label className="text-sm font-semibold text-gray-800 dark:text-gray-100">{field.label}</label>
        {field.required && <span className="text-red-500 text-sm">*</span>}
      </div>
      {field.helpText && <p className="text-xs text-gray-400 dark:text-gray-500">{field.helpText}</p>}

      {['short_text', 'email', 'url', 'phone'].includes(field.type) && (
        <input type={field.type === 'email' ? 'email' : 'text'} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} className={base} />
      )}
      {field.type === 'long_text' && (
        <textarea value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} rows={4} className={`${base} resize-none`} />
      )}
      {field.type === 'number' && (
        <input type="number" value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} className={base} />
      )}
      {field.type === 'date' && (
        <input type="date" value={value || ''} onChange={(e) => onChange(e.target.value)} className={base} />
      )}
      {field.type === 'time' && (
        <input type="time" value={value || ''} onChange={(e) => onChange(e.target.value)} className={base} />
      )}
      {field.type === 'rating' && (
        <StarInput max={field.validation?.max} value={value || 0} onChange={onChange} />
      )}
      {field.type === 'slider' && (
        <SliderInput field={field} value={value} onChange={onChange} />
      )}
      {field.type === 'dropdown' && (
        <select value={value || ''} onChange={(e) => onChange(e.target.value)} className={base}>
          <option value="">{field.placeholder || 'Select an option...'}</option>
          {(field.options || []).map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
        </select>
      )}
      {field.type === 'checkbox' && (
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 accent-indigo-500 rounded" />
          <span className="text-sm text-gray-700 dark:text-gray-300">{field.placeholder || field.label}</span>
        </label>
      )}
      {field.type === 'toggle' && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onChange(!value)}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${value ? 'bg-accent-500' : 'bg-gray-200 dark:bg-gray-600'}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${value ? 'left-6' : 'left-1'}`} />
          </button>
          <span className="text-sm text-gray-700 dark:text-gray-300">{value ? 'On' : 'Off'}</span>
        </div>
      )}
      {field.type === 'checkbox_group' && (
        <div className="space-y-2">
          {(field.options || []).map((opt, i) => (
            <label key={i} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={(value || []).includes(opt)}
                onChange={(e) => {
                  const arr = value || []
                  onChange(e.target.checked ? [...arr, opt] : arr.filter((v) => v !== opt))
                }}
                className="w-4 h-4 accent-indigo-500 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{opt}</span>
            </label>
          ))}
        </div>
      )}
      {field.type === 'radio_group' && (
        <div className="space-y-2">
          {(field.options || []).map((opt, i) => (
            <label key={i} className="flex items-center gap-2.5 cursor-pointer">
              <input type="radio" name={field.id} value={opt} checked={value === opt} onChange={() => onChange(opt)} className="w-4 h-4 accent-indigo-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{opt}</span>
            </label>
          ))}
        </div>
      )}
      {(field.type === 'file' || field.type === 'image') && (
        <div className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl p-6 flex flex-col items-center gap-2 bg-gray-50 dark:bg-gray-800/50 cursor-pointer hover:border-accent-400 hover:bg-accent-50 dark:hover:bg-accent-900/10 transition-all">
          <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span className="text-sm text-gray-400 dark:text-gray-500">Click to upload or drag & drop</span>
        </div>
      )}
    </div>
  )
}

export default function PreviewModal({ onClose }) {
  const { formTitle, formDescription, fields } = useFormStore()
  const [values, setValues] = useState({})
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const setValue = (id, val) => setValues((p) => ({ ...p, [id]: val }))

  const visibleFields = fields.filter((f) => evaluateCondition(f.condition, values, fields))

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-xl flex flex-col animate-slide-up border border-gray-200/80 dark:border-gray-700/80"
        style={{ maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/80 dark:border-gray-700/80">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Live Preview</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setValues({}); setSubmitted(false) }} className="btn-ghost text-xs">Reset</button>
            <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 2l12 12M14 2L2 14"/></svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-6">
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-12 text-center animate-bounce-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Form Submitted!</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This is a preview — no data was sent.</p>
              <button onClick={() => { setValues({}); setSubmitted(false) }} className="btn-primary mt-5">Fill again</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Form title */}
              <div className="mb-6">
                <div className="h-1 w-12 rounded-full bg-gradient-to-r from-accent-500 to-accent-400 mb-3" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{formTitle}</h2>
                {formDescription && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{formDescription}</p>}
              </div>

              {visibleFields.map((field) => (
                <div key={field.id} className="animate-fade-in">
                  <FieldRenderer
                    field={field}
                    value={values[field.id]}
                    onChange={(val) => setValue(field.id, val)}
                  />
                </div>
              ))}

              {fields.length > 0 && (
                <button type="submit" className="btn-primary w-full justify-center py-3 mt-4">
                  Submit Form
                </button>
              )}

              {fields.length === 0 && (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">No fields to preview. Add some fields to the canvas.</p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
