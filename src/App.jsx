import React, { useState, useEffect, useCallback } from 'react'
import {
  DndContext, DragOverlay, PointerSensor,
  useSensor, useSensors, closestCenter,
} from '@dnd-kit/core'
import useFormStore from './store/formStore'
import FieldSidebar from './components/FieldSidebar'
import FormCanvas from './components/FormCanvas'
import FieldConfigPanel from './components/FieldConfigPanel'
import ExportModal from './components/ExportModal'
import PreviewModal from './components/PreviewModal'
import { FIELD_TYPES } from './utils/fieldDefaults'

export default function App() {
  const {
    addField, reorderFields, fields,
    darkMode, toggleDarkMode,
    undo, redo, canUndo, canRedo,
    clearForm, loadDemo, DEMO_FORMS,
  } = useFormStore()

  const [showExport,       setShowExport]       = useState(false)
  const [showPreview,      setShowPreview]       = useState(false)
  const [showClearConfirm, setShowClearConfirm]  = useState(false)
  const [showDemoMenu,     setShowDemoMenu]      = useState(false)
  const [showSidebar,      setShowSidebar]       = useState(false)  // mobile
  const [showConfig,       setShowConfig]        = useState(false)  // mobile
  const [activeId,         setActiveId]          = useState(null)
  const [activeSidebarType,setActiveSidebarType] = useState(null)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      const mod = e.ctrlKey || e.metaKey
      if (mod && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      if (mod && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo() }
      if (mod && e.key === 'e') { e.preventDefault(); setShowExport(true) }
      if (mod && e.key === 'p') { e.preventDefault(); setShowPreview(true) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  const handleDragStart = useCallback((event) => {
    const { active } = event
    setActiveId(active.id)
    if (active.data.current?.fromSidebar) setActiveSidebarType(active.data.current.fieldType)
  }, [])

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event
    setActiveId(null)
    setActiveSidebarType(null)
    if (!over) return
    if (active.data.current?.fromSidebar) {
      const fieldType = active.data.current.fieldType
      if (over.id !== 'canvas-drop-zone') {
        const overIndex = fields.findIndex((f) => f.id === over.id)
        addField(fieldType, overIndex >= 0 ? overIndex : null)
      } else {
        addField(fieldType)
      }
      setShowSidebar(false)
      return
    }
    if (active.data.current?.fromCanvas && active.id !== over.id) {
      reorderFields(active.id, over.id)
    }
  }, [fields, addField, reorderFields])

  const activeSidebarField = activeSidebarType
    ? FIELD_TYPES.find((f) => f.type === activeSidebarType)
    : null

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-100 dark:bg-gray-950 transition-colors duration-300">

      {/* ══════════════════════════════════════════
          TOP NAV
      ══════════════════════════════════════════ */}
      <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 z-20 shrink-0 gap-3">

        {/* ── Logo ── */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setShowSidebar(true)}
            className="lg:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <MenuIcon />
          </button>

          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <rect x="2" y="2" width="8" height="8" rx="2.5" fill="white" opacity="0.95"/>
                <rect x="12" y="2" width="8" height="8" rx="2.5" fill="white" opacity="0.55"/>
                <rect x="2" y="12" width="8" height="8" rx="2.5" fill="white" opacity="0.55"/>
                <rect x="12" y="12" width="8" height="8" rx="2.5" fill="white" opacity="0.95"/>
              </svg>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight leading-none">FormCraft</span>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full leading-none"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white' }}
                >
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-none mt-0.5">Visual Form Builder</p>
            </div>
          </div>
        </div>

        {/* ── Center toolbar ── */}
        <div className="flex items-center gap-1">
          <button onClick={undo} disabled={!canUndo()} title="Undo (Ctrl+Z)"
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-25 disabled:cursor-not-allowed transition-all">
            <UndoIcon />
          </button>
          <button onClick={redo} disabled={!canRedo()} title="Redo (Ctrl+Y)"
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-25 disabled:cursor-not-allowed transition-all">
            <RedoIcon />
          </button>

          <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />

          {/* Demo loader */}
          <div className="relative">
            <button
              onClick={() => setShowDemoMenu(!showDemoMenu)}
              title="Load a demo form"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
              <SparkleIcon />
              <span>Templates</span>
              <ChevronIcon />
            </button>
            {showDemoMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowDemoMenu(false)} />
                <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-40 overflow-hidden animate-fade-in">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Load Template</p>
                  </div>
                  {DEMO_FORMS.map((demo) => (
                    <button
                      key={demo.id}
                      onClick={() => { loadDemo(demo.id); setShowDemoMenu(false) }}
                      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-base mt-0.5"
                        style={{ background: 'linear-gradient(135deg,#eef2ff,#e0e7ff)' }}>
                        {demo.id === 'job-application' ? '💼' : demo.id === 'customer-feedback' ? '⭐' : '🎟️'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{demo.title}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 leading-snug">{demo.fields.length} fields</p>
                      </div>
                    </button>
                  ))}
                  <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={() => { clearForm(); setShowDemoMenu(false) }}
                      className="w-full text-xs text-red-500 hover:text-red-600 font-medium text-left transition-colors"
                    >
                      + Start from scratch
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <button onClick={() => setShowClearConfirm(true)} title="Clear form"
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-all">
            <TrashIcon />
          </button>
        </div>

        {/* ── Right actions ── */}
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={toggleDarkMode} title={darkMode ? 'Light mode' : 'Dark mode'}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
            {darkMode ? <SunIcon /> : <MoonIcon />}
          </button>

          {/* Mobile config toggle */}
          <button onClick={() => setShowConfig(true)}
            className="lg:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            title="Field settings">
            <SettingsIcon />
          </button>

          <button onClick={() => setShowPreview(true)} className="btn-ghost hidden sm:flex" title="Preview (Ctrl+P)">
            <EyeIcon />
            <span>Preview</span>
          </button>

          <button onClick={() => setShowExport(true)} className="btn-primary" title="Export JSON (Ctrl+E)">
            <ExportIcon />
            <span className="hidden sm:inline">Export JSON</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════════
          MAIN 3-COLUMN LAYOUT
      ══════════════════════════════════════════ */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex flex-1 overflow-hidden relative">

          {/* ── Left Sidebar — desktop always visible, mobile drawer ── */}
          <>
            {/* Mobile overlay */}
            {showSidebar && (
              <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setShowSidebar(false)} />
            )}
            <div className={`
              lg:relative lg:translate-x-0 lg:flex
              fixed inset-y-0 left-0 z-50 flex flex-col
              transition-transform duration-300 ease-in-out
              ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
            `}>
              {/* Mobile close button */}
              <button
                onClick={() => setShowSidebar(false)}
                className="lg:hidden absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500"
              >
                <CloseIcon />
              </button>
              <FieldSidebar />
            </div>
          </>

          {/* ── Canvas ── */}
          <FormCanvas />

          {/* ── Right Config Panel — desktop always visible, mobile drawer ── */}
          <>
            {showConfig && (
              <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setShowConfig(false)} />
            )}
            <div className={`
              lg:relative lg:translate-x-0 lg:flex
              fixed inset-y-0 right-0 z-50 flex flex-col
              transition-transform duration-300 ease-in-out
              ${showConfig ? 'translate-x-0' : 'translate-x-full'}
            `}>
              <button
                onClick={() => setShowConfig(false)}
                className="lg:hidden absolute top-3 left-3 z-10 p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500"
              >
                <CloseIcon />
              </button>
              <FieldConfigPanel />
            </div>
          </>
        </div>

        <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.16,1,0.3,1)' }}>
          {activeSidebarField && (
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 border-indigo-400 bg-white dark:bg-gray-800 text-sm font-bold text-indigo-600 dark:text-indigo-400 rotate-2 scale-105"
              style={{ boxShadow: '0 8px 30px rgba(99,102,241,0.35)' }}>
              <span className="text-base">{activeSidebarField.icon}</span>
              {activeSidebarField.label}
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* ══════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════ */}
      {showExport  && <ExportModal  onClose={() => setShowExport(false)} />}
      {showPreview && <PreviewModal onClose={() => setShowPreview(false)} />}

      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-gray-200 dark:border-gray-700 animate-scale-in">
            <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <TrashIcon className="text-red-500" style={{ width: 24, height: 24 }} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center">Clear all fields?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2 leading-relaxed">
              All fields will be removed from the canvas. You can undo this with Ctrl+Z.
            </p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Cancel
              </button>
              <button onClick={() => { clearForm(); setShowClearConfirm(false) }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors">
                Clear Form
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Icons ──────────────────────────────────────────────────────────────────
function UndoIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7H10a3 3 0 010 6H7"/><path d="M3 7L6 4M3 7L6 10"/></svg>
}
function RedoIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M13 7H6a3 3 0 000 6h3"/><path d="M13 7L10 4M13 7L10 10"/></svg>
}
function TrashIcon({ className = '', style = {} }) {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}><path d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M6 7v5M10 7v5M3 4l1 9a1 1 0 001 1h6a1 1 0 001-1l1-9"/></svg>
}
function MoonIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M13.5 10A6 6 0 016 2.5a6 6 0 100 11 6 6 0 007.5-3.5z"/></svg>
}
function SunIcon() {
  return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="9" cy="9" r="3.5"/><path d="M9 1v2M9 15v2M1 9h2M15 9h2M3.22 3.22l1.42 1.42M13.36 13.36l1.42 1.42M3.22 14.78l1.42-1.42M13.36 4.64l1.42-1.42"/></svg>
}
function EyeIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z"/><circle cx="8" cy="8" r="2"/></svg>
}
function ExportIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v8M5 7l3 3 3-3"/><path d="M3 11v2a1 1 0 001 1h8a1 1 0 001-1v-2"/></svg>
}
function MenuIcon() {
  return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 4h14M2 9h14M2 14h14"/></svg>
}
function CloseIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 1l12 12M13 1L1 13"/></svg>
}
function SettingsIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06"/></svg>
}
function SparkleIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7 1l1.5 3.5L12 6l-3.5 1.5L7 11l-1.5-3.5L2 6l3.5-1.5L7 1z"/></svg>
}
function ChevronIcon() {
  return <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 4l4 4 4-4"/></svg>
}
