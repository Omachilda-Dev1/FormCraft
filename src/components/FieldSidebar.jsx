import React, { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { FIELD_CATEGORIES } from '../utils/fieldDefaults'
import useFormStore from '../store/formStore'

function DraggableFieldPill({ type, label, icon, desc }) {
  const { addField } = useFormStore()
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-${type}`,
    data: { fromSidebar: true, fieldType: type },
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => addField(type)}
      className={`field-pill group ${isDragging ? 'opacity-30 scale-95' : ''}`}
    >
      <span className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 group-hover:bg-accent-100 dark:group-hover:bg-accent-900/40 group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors shrink-0">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors leading-tight">{label}</p>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight truncate">{desc}</p>
      </div>
    </div>
  )
}

export default function FieldSidebar() {
  const [search, setSearch] = useState('')
  const [collapsed, setCollapsed] = useState({})

  const toggle = (label) => setCollapsed((p) => ({ ...p, [label]: !p[label] }))

  const filtered = search.trim()
    ? FIELD_CATEGORIES.map((cat) => ({
        ...cat,
        fields: cat.fields.filter(
          (f) =>
            f.label.toLowerCase().includes(search.toLowerCase()) ||
            f.desc.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter((cat) => cat.fields.length > 0)
    : FIELD_CATEGORIES

  return (
    <aside className="w-64 shrink-0 glass-panel flex flex-col h-full" style={{ minWidth: 240 }}>
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-200/80 dark:border-gray-700/80">
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-label">Fields</h2>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">click or drag</span>
        </div>
        {/* Search */}
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="6.5" cy="6.5" r="4"/><path d="M11 11l3 3"/></svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search fields..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-500/40 focus:border-accent-500 transition-all"
          />
        </div>
      </div>

      {/* Field list */}
      <div className="flex-1 overflow-y-auto py-2">
        {filtered.map((cat) => (
          <div key={cat.label} className="mb-1">
            <button
              onClick={() => toggle(cat.label)}
              className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
            >
              <span className="section-label">{cat.label}</span>
              <svg
                className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${collapsed[cat.label] ? '-rotate-90' : ''}`}
                viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              >
                <path d="M2 4l4 4 4-4"/>
              </svg>
            </button>

            {!collapsed[cat.label] && (
              <div className="px-2 pb-1 flex flex-col gap-1">
                {cat.fields.map(({ type, label, icon, desc }) => (
                  <DraggableFieldPill key={type} type={type} label={label} icon={icon} desc={desc} />
                ))}
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center px-4">
            <p className="text-xs text-gray-400 dark:text-gray-500">No fields match "{search}"</p>
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="px-4 py-3 border-t border-gray-200/80 dark:border-gray-700/80">
        <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center leading-relaxed">
          Drag fields onto the canvas<br/>or click to append
        </p>
      </div>
    </aside>
  )
}
