import React, { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import useFormStore from '../store/formStore'
import { FIELD_TYPES } from '../utils/fieldDefaults'

// ── Field type badge color map ──
const TYPE_COLORS = {
  short_text: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  long_text:  'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  email:      'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
  url:        'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
  phone:      'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
  number:     'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  slider:     'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  rating:     'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
  date:       'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
  time:       'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
  dropdown:   'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
  radio_group:'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
  checkbox:   'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  checkbox_group:'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  toggle:     'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  file:       'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  image:      'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  divider:    'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
  heading:    'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
  paragraph:  'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
}

function StarRating({ max = 5 }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1 mt-2">
      {Array.from({ length: Number(max) || 5 }).map((_, i) => (
        <svg key={i} onMouseEnter={() => setHovered(i + 1)} onMouseLeave={() => setHovered(0)}
          className={`w-6 h-6 transition-colors ${i < hovered ? 'text-yellow-400' : 'text-gray-200 dark:text-gray-600'}`}
          viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  )
}

function SliderPreview({ field }) {
  const min = Number(field.validation?.min) || 0
  const max = Number(field.validation?.max) || 100
  const mid = Math.round((min + max) / 2)
  const pct = ((mid - min) / (max - min)) * 100
  return (
    <div className="mt-2 px-1">
      <div className="relative h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
        <div className="absolute left-0 top-0 h-2 bg-accent-500 rounded-full" style={{ width: `${pct}%` }} />
        <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white dark:bg-gray-200 border-2 border-accent-500 rounded-full shadow" style={{ left: `calc(${pct}% - 8px)` }} />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-gray-400">{min}</span>
        <span className="text-[10px] text-gray-400">{max}</span>
      </div>
    </div>
  )
}

function FieldPreview({ field }) {
  const base = 'w-full mt-2 px-3 py-2.5 text-sm border rounded-lg cursor-not-allowed'
  const baseStyle = {
    borderColor: '#e5e7eb',
    background: '#f9fafb',
    color: '#9ca3af',
  }

  if (field.type === 'divider') {
    return (
      <div className="py-2">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
          {field.label && <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">{field.label}</span>}
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
        </div>
        {field.helpText && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 text-center">{field.helpText}</p>}
      </div>
    )
  }

  if (field.type === 'heading') {
    const Tag = field.level || 'h2'
    const sizes = { h1: 'text-2xl', h2: 'text-xl', h3: 'text-lg' }
    return <div className={`${sizes[field.level] || 'text-xl'} font-bold text-gray-800 dark:text-gray-100 mt-1`}>{field.label || 'Heading'}</div>
  }

  if (field.type === 'paragraph') {
    return <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{field.content || 'Paragraph text...'}</p>
  }

  return (
    <div>
      <div className="flex items-center gap-1.5 flex-wrap">
        <label className="text-sm font-semibold text-gray-800 dark:text-gray-100">{field.label || 'Untitled'}</label>
        {field.required && <span className="text-red-500 text-sm leading-none">*</span>}
        {field.condition && <span className="badge-accent text-[10px]">conditional</span>}
      </div>
      {field.helpText && <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>{field.helpText}</p>}

      {['short_text', 'email', 'url', 'phone'].includes(field.type) && (
        <input type="text" placeholder={field.placeholder || `Enter ${(field.label || 'value').toLowerCase()}...`} disabled className={base} style={baseStyle} />
      )}
      {field.type === 'long_text' && (
        <textarea placeholder={field.placeholder || 'Enter text...'} disabled rows={3} className={`${base} resize-none`} style={baseStyle} />
      )}
      {field.type === 'number' && (
        <input type="number" placeholder={field.placeholder || '0'} disabled className={base} style={baseStyle} />
      )}
      {field.type === 'date' && (
        <input type="date" disabled className={base} style={baseStyle} />
      )}
      {field.type === 'time' && (
        <input type="time" disabled className={base} style={baseStyle} />
      )}
      {field.type === 'rating' && <StarRating max={field.validation?.max} />}
      {field.type === 'slider' && <SliderPreview field={field} />}
      {field.type === 'dropdown' && (
        <select disabled className={base} style={baseStyle}>
          <option>{field.placeholder || 'Select an option...'}</option>
          {(field.options || []).map((opt, i) => <option key={i}>{opt}</option>)}
        </select>
      )}
      {field.type === 'checkbox' && (
        <div className="flex items-center gap-2.5 mt-2">
          <div className="w-4 h-4 rounded border-2 shrink-0" style={{ borderColor: '#d1d5db', background: 'white' }} />
          <span className="text-sm" style={{ color: '#9ca3af' }}>{field.placeholder || field.label}</span>
        </div>
      )}
      {field.type === 'toggle' && (
        <div className="flex items-center gap-3 mt-2">
          <div className="w-10 h-5 rounded-full relative" style={{ background: '#e5e7eb' }}>
            <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow" />
          </div>
          <span className="text-sm" style={{ color: '#9ca3af' }}>{field.label}</span>
        </div>
      )}
      {field.type === 'checkbox_group' && (
        <div className="flex flex-col gap-2 mt-2">
          {(field.options || []).map((opt, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded border-2 shrink-0" style={{ borderColor: '#d1d5db', background: 'white' }} />
              <span className="text-sm" style={{ color: '#9ca3af' }}>{opt}</span>
            </div>
          ))}
        </div>
      )}
      {field.type === 'radio_group' && (
        <div className="flex flex-col gap-2 mt-2">
          {(field.options || []).map((opt, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-full border-2 shrink-0" style={{ borderColor: '#d1d5db', background: 'white' }} />
              <span className="text-sm" style={{ color: '#9ca3af' }}>{opt}</span>
            </div>
          ))}
        </div>
      )}
      {(field.type === 'file' || field.type === 'image') && (
        <div className="mt-2 border-2 border-dashed rounded-xl p-4 flex flex-col items-center gap-1.5" style={{ borderColor: '#e5e7eb', background: '#f9fafb' }}>
          <svg className="w-6 h-6" style={{ color: '#d1d5db' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span className="text-xs" style={{ color: '#9ca3af' }}>Click to upload or drag & drop</span>
        </div>
      )}
    </div>
  )
}

export default function FieldCard({ field }) {
  const { selectedFieldId, selectField, removeField, duplicateField } = useFormStore()
  const isSelected = selectedFieldId === field.id
  const fieldMeta = FIELD_TYPES.find((f) => f.type === field.type)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
    data: { fromCanvas: true },
  })

  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => selectField(field.id)}
      className={`field-card p-4 animate-fade-in ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full transition-all duration-200 ${isSelected ? 'bg-accent-500' : 'bg-transparent'}`} />

      {/* Drag handle */}
      <div
        {...listeners}
        {...attributes}
        onClick={(e) => e.stopPropagation()}
        className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1.5 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <GripIcon />
      </div>

      {/* Content */}
      <div className="pl-5 pr-16">
        {/* Type badge */}
        <div className="flex items-center gap-2 mb-1">
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${TYPE_COLORS[field.type] || 'bg-gray-100 text-gray-500'}`}>
            <span>{fieldMeta?.icon}</span>
            <span>{fieldMeta?.label || field.type}</span>
          </span>
          {field.required && <span className="badge-red">required</span>}
          {field.condition && (
            <span className="badge-accent">
              <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="currentColor"><path d="M5 1L9 5L5 9M1 5h8" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
              conditional
            </span>
          )}
        </div>
        <FieldPreview field={field} />
      </div>

      {/* Action buttons */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`absolute top-3 right-3 flex items-center gap-0.5 transition-all duration-150 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
      >
        <button
          onClick={() => duplicateField(field.id)}
          className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-accent-500 hover:bg-accent-50 dark:hover:bg-accent-900/30 transition-colors"
          title="Duplicate"
        >
          <DuplicateIcon />
        </button>
        <button
          onClick={() => removeField(field.id)}
          className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          title="Delete"
        >
          <DeleteIcon />
        </button>
      </div>
    </div>
  )
}

function GripIcon() {
  return (
    <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor">
      <circle cx="3.5" cy="3" r="1.3"/><circle cx="8.5" cy="3" r="1.3"/>
      <circle cx="3.5" cy="8" r="1.3"/><circle cx="8.5" cy="8" r="1.3"/>
      <circle cx="3.5" cy="13" r="1.3"/><circle cx="8.5" cy="13" r="1.3"/>
    </svg>
  )
}
function DuplicateIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="8" height="8" rx="1.5"/><path d="M2 10V3a1 1 0 011-1h7"/></svg>
}
function DeleteIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3.5h10M5 3.5V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v1M5.5 6v4M8.5 6v4M3 3.5l.7 7.5a1 1 0 001 .9h4.6a1 1 0 001-.9L11 3.5"/></svg>
}
