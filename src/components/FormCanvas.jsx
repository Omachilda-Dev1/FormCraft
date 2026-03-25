import React, { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import useFormStore from '../store/formStore'
import FieldCard from './FieldCard'

const THEMES = [
  { id: 'default', label: 'Default' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'card',    label: 'Card' },
]

export default function FormCanvas() {
  const {
    formTitle, formDescription, formTheme,
    fields, setFormTitle, setFormDescription, setFormTheme,
    selectField, getStats,
  } = useFormStore()

  const [editingTitle, setEditingTitle] = useState(false)
  const [editingDesc,  setEditingDesc]  = useState(false)

  const { setNodeRef, isOver } = useDroppable({ id: 'canvas-drop-zone' })
  const stats = getStats()

  return (
    <main
      className="flex-1 flex flex-col h-full overflow-hidden bg-slate-100 dark:bg-gray-950"
      onClick={() => selectField(null)}
    >
      {/* Stats bar */}
      <div className="flex items-center gap-4 px-6 py-2.5 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0 flex-wrap gap-y-1">
        <StatPill label="Fields"      value={stats.total}          color="#6366f1" />
        <StatPill label="Required"    value={stats.required}       color="#ef4444" />
        <StatPill label="Conditional" value={stats.withConditions} color="#f59e0b" />
        <StatPill label="Types"       value={stats.types}          color="#10b981" />

        <div className="ml-auto flex items-center gap-1">
          <span className="text-xs text-gray-400 dark:text-gray-500 mr-1 hidden sm:inline">Theme:</span>
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={(e) => { e.stopPropagation(); setFormTheme(t.id) }}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150"
              style={formTheme === t.id
                ? { background: '#6366f1', color: 'white' }
                : { color: '#6b7280', background: 'transparent' }
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable canvas */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto w-full px-6 py-8">

          {/* Form header card */}
          <div
            onClick={(e) => e.stopPropagation()}
            className={`mb-6 rounded-2xl p-6 border transition-all duration-200 ${
              formTheme === 'card'
                ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                : formTheme === 'minimal'
                ? 'bg-transparent border-transparent'
                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
            }`}
            style={{ boxShadow: formTheme !== 'minimal' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none' }}
          >
            {formTheme !== 'minimal' && (
              <div className="h-1 w-16 rounded-full mb-4" style={{ background: 'linear-gradient(90deg,#6366f1,#818cf8)' }} />
            )}

            {editingTitle ? (
              <input
                autoFocus
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                onBlur={() => setEditingTitle(false)}
                onKeyDown={(e) => e.key === 'Enter' && setEditingTitle(false)}
                className="text-2xl font-bold bg-transparent outline-none w-full pb-0.5 text-gray-900 dark:text-white"
                style={{ borderBottom: '2px solid #6366f1' }}
              />
            ) : (
              <h1
                className="text-2xl font-bold text-gray-900 dark:text-white cursor-text group flex items-center gap-2 hover:opacity-80 transition-opacity"
                onClick={() => setEditingTitle(true)}
              >
                {formTitle || 'Untitled Form'}
                <PencilIcon className="w-4 h-4 opacity-0 group-hover:opacity-40 transition-opacity" />
              </h1>
            )}

            {editingDesc ? (
              <textarea
                autoFocus
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                onBlur={() => setEditingDesc(false)}
                placeholder="Add a description..."
                rows={2}
                className="text-sm bg-transparent outline-none w-full mt-2 resize-none text-gray-500 dark:text-gray-400"
                style={{ borderBottom: '1px solid #d1d5db' }}
              />
            ) : (
              <p
                className="text-sm text-gray-500 dark:text-gray-400 mt-2 cursor-text hover:opacity-80 transition-opacity min-h-[1.25rem] group flex items-center gap-2"
                onClick={() => setEditingDesc(true)}
              >
                {formDescription || 'Click to add a description...'}
                <PencilIcon className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity" />
              </p>
            )}
          </div>

          {/* Drop zone */}
          <div
            ref={setNodeRef}
            onClick={(e) => e.stopPropagation()}
            className={`flex flex-col gap-3 min-h-48 rounded-2xl transition-all duration-200 ${
              isOver ? 'bg-accent-50 dark:bg-accent-900/10 ring-2 ring-accent-400 ring-dashed p-2' : ''
            }`}
          >
            {fields.length === 0 ? (
              <EmptyState isOver={isOver} />
            ) : (
              <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                {fields.map((field) => (
                  <FieldCard key={field.id} field={field} />
                ))}
              </SortableContext>
            )}

            {isOver && fields.length > 0 && (
              <div className="h-1 rounded-full bg-gradient-to-r from-accent-400 to-accent-600 mx-2 animate-pulse-glow" />
            )}
          </div>

          {fields.length > 0 && (
            <p className="text-xs text-center text-gray-300 dark:text-gray-600 mt-6">
              {fields.length} field{fields.length !== 1 ? 's' : ''} · drag to reorder
            </p>
          )}
        </div>
      </div>
    </main>
  )
}

function StatPill({ label, value, color }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm font-bold" style={{ color }}>{value}</span>
      <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
    </div>
  )
}

function EmptyState({ isOver }) {
  return (
    <div className={`flex flex-col items-center justify-center min-h-64 rounded-2xl border-2 border-dashed transition-all duration-300 ${
      isOver
        ? 'border-accent-400 bg-accent-50 dark:bg-accent-900/10 scale-[1.01]'
        : 'border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/30'
    }`}>
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${
        isOver ? 'bg-accent-100 dark:bg-accent-900/30 scale-110' : 'bg-gray-100 dark:bg-gray-800'
      }`}>
        <svg className={`w-8 h-8 transition-colors ${isOver ? 'text-accent-500' : 'text-gray-300 dark:text-gray-600'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="3"/>
          <path d="M12 8v8M8 12h8"/>
        </svg>
      </div>
      <p className={`text-sm font-semibold transition-colors ${isOver ? 'text-accent-600 dark:text-accent-400' : 'text-gray-400 dark:text-gray-500'}`}>
        {isOver ? 'Release to add field' : 'Drop fields here'}
      </p>
      <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">
        {isOver ? '' : 'or click any field type in the sidebar'}
      </p>
    </div>
  )
}

function PencilIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11.5 2.5a1.414 1.414 0 012 2L5 13H3v-2L11.5 2.5z"/>
    </svg>
  )
}
