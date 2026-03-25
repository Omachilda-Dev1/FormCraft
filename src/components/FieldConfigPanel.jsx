import React, { useState } from 'react'
import useFormStore from '../store/formStore'
import ConditionalLogicEditor from './ConditionalLogicEditor'

// ── Primitives ──────────────────────────────────────────────────────────────

function Label({ children }) {
  return <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">{children}</label>
}

function Input({ value, onChange, placeholder, type = 'text', className = '' }) {
  return (
    <input
      type={type}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`cfg-input ${className}`}
    />
  )
}

function Textarea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="cfg-input resize-none"
    />
  )
}

function Toggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1">
      <div>
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{label}</p>
        {description && <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative shrink-0 w-10 h-5.5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-500/40 ${checked ? 'bg-accent-500' : 'bg-gray-200 dark:bg-gray-600'}`}
        style={{ height: '22px', width: '40px' }}
      >
        <span className={`absolute top-[3px] w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${checked ? 'left-[20px]' : 'left-[3px]'}`} />
      </button>
    </div>
  )
}

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{title}</span>
        <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${open ? '' : '-rotate-90'}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 4l4 4 4-4"/></svg>
      </button>
      {open && <div className="p-3.5 space-y-3.5 bg-white dark:bg-gray-900">{children}</div>}
    </div>
  )
}

function OptionsEditor({ options, onChange }) {
  const update = (i, val) => { const n = [...options]; n[i] = val; onChange(n) }
  const remove = (i) => onChange(options.filter((_, idx) => idx !== i))
  const add    = () => onChange([...options, `Option ${options.length + 1}`])

  return (
    <div className="space-y-2">
      {options.map((opt, i) => (
        <div key={i} className="flex items-center gap-1.5 group">
          <div className="w-4 h-4 shrink-0 flex items-center justify-center text-gray-300 dark:text-gray-600 cursor-grab">
            <svg width="8" height="12" viewBox="0 0 8 12" fill="currentColor">
              <circle cx="2" cy="2" r="1.2"/><circle cx="6" cy="2" r="1.2"/>
              <circle cx="2" cy="6" r="1.2"/><circle cx="6" cy="6" r="1.2"/>
              <circle cx="2" cy="10" r="1.2"/><circle cx="6" cy="10" r="1.2"/>
            </svg>
          </div>
          <input
            value={opt}
            onChange={(e) => update(i, e.target.value)}
            className="flex-1 text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2.5 py-1.5 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-accent-500/40 focus:border-accent-500 transition-all"
          />
          <button onClick={() => remove(i)} className="p-1 rounded-md text-gray-300 dark:text-gray-600 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 2l8 8M10 2l-8 8"/></svg>
          </button>
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-1.5 text-xs font-semibold text-accent-500 hover:text-accent-600 dark:hover:text-accent-400 transition-colors mt-1">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 1v10M1 6h10"/></svg>
        Add option
      </button>
    </div>
  )
}

// ── Tabs ────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'basic',      label: 'Basic',      icon: '⊞' },
  { id: 'validation', label: 'Validation', icon: '✓' },
  { id: 'logic',      label: 'Logic',      icon: '⇢' },
]

// ── Main Panel ───────────────────────────────────────────────────────────────

export default function FieldConfigPanel() {
  const { fields, selectedFieldId, updateField } = useFormStore()
  const [tab, setTab] = useState('basic')
  const field = fields.find((f) => f.id === selectedFieldId)

  if (!field) {
    return (
      <aside className="w-72 shrink-0 glass-panel flex flex-col h-full" style={{ minWidth: 280 }}>
        <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="section-label">Field Config</h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#f3f4f6,#e5e7eb)' }}>
            <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-600 dark:text-gray-300">No field selected</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 leading-relaxed">Click any field on the canvas to configure it here</p>
          </div>
        </div>
      </aside>
    )
  }

  const upd = (key, val) => updateField(field.id, { [key]: val })
  const updV = (key, val) => updateField(field.id, { validation: { ...field.validation, [key]: val } })

  const hasOptions      = ['dropdown', 'checkbox_group', 'radio_group'].includes(field.type)
  const hasTextVal      = ['short_text', 'long_text', 'url', 'phone'].includes(field.type)
  const hasNumVal       = ['number', 'slider'].includes(field.type)
  const hasRatingVal    = field.type === 'rating'
  const isLayout        = ['divider', 'heading', 'paragraph'].includes(field.type)
  const isHeading       = field.type === 'heading'
  const isParagraph     = field.type === 'paragraph'

  return (
    <aside className="w-72 shrink-0 glass-panel flex flex-col h-full" style={{ minWidth: 280 }}>
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-gray-200/80 dark:border-gray-700/80">
        <div className="flex items-center justify-between">
          <h2 className="section-label">Field Config</h2>
          <span className="badge-accent capitalize">{field.type.replace(/_/g, ' ')}</span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium truncate">{field.label || 'Untitled'}</p>
      </div>

      {/* Tabs */}
      {!isLayout && (
        <div className="flex border-b border-gray-200/80 dark:border-gray-700/80 px-2 pt-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all duration-150 ${
                tab === t.id
                  ? 'text-accent-600 dark:text-accent-400 border-b-2 border-accent-500 -mb-px bg-accent-50/50 dark:bg-accent-900/10'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* ── BASIC TAB ── */}
        {(tab === 'basic' || isLayout) && (
          <div className="space-y-4 animate-fade-in">
            <Section title="Field Details">
              <div>
                <Label>Label</Label>
                <Input value={field.label} onChange={(v) => upd('label', v)} placeholder="Field label" />
              </div>

              {isParagraph && (
                <div>
                  <Label>Content</Label>
                  <Textarea value={field.content} onChange={(v) => upd('content', v)} placeholder="Paragraph text..." />
                </div>
              )}

              {isHeading && (
                <div>
                  <Label>Heading Level</Label>
                  <select value={field.level || 'h2'} onChange={(e) => upd('level', e.target.value)} className="cfg-input">
                    <option value="h1">H1 — Large</option>
                    <option value="h2">H2 — Medium</option>
                    <option value="h3">H3 — Small</option>
                  </select>
                </div>
              )}

              {!isLayout && !['checkbox', 'checkbox_group', 'radio_group', 'date', 'time', 'file', 'image', 'rating', 'slider', 'toggle'].includes(field.type) && (
                <div>
                  <Label>Placeholder</Label>
                  <Input value={field.placeholder} onChange={(v) => upd('placeholder', v)} placeholder="Placeholder text" />
                </div>
              )}

              <div>
                <Label>Help Text</Label>
                <Input value={field.helpText} onChange={(v) => upd('helpText', v)} placeholder="Optional description shown below field" />
              </div>
            </Section>

            {!isLayout && (
              <Section title="Field Settings">
                <Toggle
                  label="Required"
                  description="User must fill this field"
                  checked={!!field.required}
                  onChange={(v) => upd('required', v)}
                />
                <div>
                  <Label>Width</Label>
                  <div className="flex gap-2">
                    {['full', 'half'].map((w) => (
                      <button
                        key={w}
                        onClick={() => upd('width', w)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 ${
                          (field.width || 'full') === w
                            ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20 text-accent-600 dark:text-accent-400'
                            : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        {w === 'full' ? '⬛ Full' : '▬ Half'}
                      </button>
                    ))}
                  </div>
                </div>
              </Section>
            )}

            {hasOptions && (
              <Section title="Options">
                <OptionsEditor options={field.options || []} onChange={(opts) => upd('options', opts)} />
              </Section>
            )}
          </div>
        )}

        {/* ── VALIDATION TAB ── */}
        {tab === 'validation' && !isLayout && (
          <div className="space-y-4 animate-fade-in">
            {hasTextVal && (
              <Section title="Length Constraints">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Min Length</Label>
                    <Input value={field.validation?.minLength} onChange={(v) => updV('minLength', v)} placeholder="0" type="number" />
                  </div>
                  <div>
                    <Label>Max Length</Label>
                    <Input value={field.validation?.maxLength} onChange={(v) => updV('maxLength', v)} placeholder="∞" type="number" />
                  </div>
                </div>
              </Section>
            )}

            {hasTextVal && (
              <Section title="Pattern" defaultOpen={false}>
                <div>
                  <Label>Regex Pattern</Label>
                  <Input value={field.validation?.pattern} onChange={(v) => updV('pattern', v)} placeholder="e.g. ^[a-zA-Z]+$" />
                </div>
                <div>
                  <Label>Error Message</Label>
                  <Input value={field.validation?.patternMessage} onChange={(v) => updV('patternMessage', v)} placeholder="Invalid format" />
                </div>
              </Section>
            )}

            {(hasNumVal || hasRatingVal) && (
              <Section title="Range">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Min</Label>
                    <Input value={field.validation?.min} onChange={(v) => updV('min', v)} placeholder="0" type="number" />
                  </div>
                  <div>
                    <Label>Max</Label>
                    <Input value={field.validation?.max} onChange={(v) => updV('max', v)} placeholder="100" type="number" />
                  </div>
                </div>
                {hasNumVal && (
                  <div>
                    <Label>Step</Label>
                    <Input value={field.validation?.step} onChange={(v) => updV('step', v)} placeholder="1" type="number" />
                  </div>
                )}
              </Section>
            )}

            {!hasTextVal && !hasNumVal && !hasRatingVal && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-xs text-gray-400 dark:text-gray-500">No validation rules available for this field type.</p>
              </div>
            )}
          </div>
        )}

        {/* ── LOGIC TAB ── */}
        {tab === 'logic' && !isLayout && (
          <div className="space-y-4 animate-fade-in">
            <Section title="Conditional Display">
              <ConditionalLogicEditor field={field} />
            </Section>
          </div>
        )}
      </div>

      {/* Footer — field ID */}
      <div className="px-4 py-2.5 border-t border-gray-200/80 dark:border-gray-700/80">
        <p className="text-[10px] text-gray-300 dark:text-gray-600 font-mono truncate">id: {field.id}</p>
      </div>
    </aside>
  )
}
