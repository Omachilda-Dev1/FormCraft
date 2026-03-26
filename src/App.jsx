import React, { useState, useEffect, useCallback } from 'react'
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core'
import useFormStore from './store/formStore'
import FieldSidebar from './components/FieldSidebar'
import FormCanvas from './components/FormCanvas'
import FieldConfigPanel from './components/FieldConfigPanel'
import ExportModal from './components/ExportModal'
import PreviewModal from './components/PreviewModal'
import { FIELD_TYPES } from './utils/fieldDefaults'

export default function App() {
  const { addField, reorderFields, fields, darkMode, toggleDarkMode, undo, redo, canUndo, canRedo, clearForm, loadDemo, DEMO_FORMS } = useFormStore()
  const [showExport,       setShowExport]       = useState(false)
  const [showPreview,      setShowPreview]       = useState(false)
  const [showClearConfirm, setShowClearConfirm]  = useState(false)
  const [showDemoMenu,     setShowDemoMenu]      = useState(false)
  const [showSidebar,      setShowSidebar]       = useState(false)
  const [showConfig,       setShowConfig]        = useState(false)
  const [activeSidebarType,setActiveSidebarType] = useState(null)

  useEffect(() => { document.documentElement.classList.toggle('dark', darkMode) }, [])

  useEffect(() => {
    const h = (e) => {
      const mod = e.ctrlKey || e.metaKey
      if (mod && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      if (mod && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo() }
      if (mod && e.key === 'e') { e.preventDefault(); setShowExport(true) }
      if (mod && e.key === 'p') { e.preventDefault(); setShowPreview(true) }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [undo, redo])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const handleDragStart = useCallback((e) => {
    if (e.active.data.current?.fromSidebar) setActiveSidebarType(e.active.data.current.fieldType)
  }, [])

  const handleDragEnd = useCallback((e) => {
    const { active, over } = e
    setActiveSidebarType(null)
    if (!over) return
    if (active.data.current?.fromSidebar) {
      const idx = fields.findIndex((f) => f.id === over.id)
      addField(active.data.current.fieldType, over.id !== 'canvas-drop-zone' && idx >= 0 ? idx : null)
      setShowSidebar(false)
      return
    }
    if (active.data.current?.fromCanvas && active.id !== over.id) reorderFields(active.id, over.id)
  }, [fields, addField, reorderFields])

  const activeSidebarField = activeSidebarType ? FIELD_TYPES.find((f) => f.type === activeSidebarType) : null

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-100 dark:bg-gray-950 transition-colors duration-300">

      {/* NAV */}
      <header className="flex items-center h-14 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 z-20 shrink-0 px-3 gap-2">

        {/* LEFT — hamburger + logo */}
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => setShowSidebar(true)} className="lg:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            <MenuIcon />
          </button>
          <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#6366f1,#4338ca)', boxShadow: '0 3px 10px rgba(99,102,241,0.4)' }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="2" width="6" height="6" rx="1.8" fill="white" opacity="0.95"/>
              <rect x="10" y="2" width="6" height="6" rx="1.8" fill="white" opacity="0.5"/>
              <rect x="2" y="10" width="6" height="6" rx="1.8" fill="white" opacity="0.5"/>
              <rect x="10" y="10" width="6" height="6" rx="1.8" fill="white" opacity="0.95"/>
            </svg>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="text-base font-bold text-gray-900 dark:text-white tracking-tight">FormCraft</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white' }}>PRO</span>
          </div>
        </div>

        {/* CENTER — only on md+ */}
        <div className="hidden md:flex items-center gap-1 mx-auto">
          <NavBtn onClick={undo} disabled={!canUndo()} title="Undo (Ctrl+Z)"><UndoIcon /></NavBtn>
          <NavBtn onClick={redo} disabled={!canRedo()} title="Redo (Ctrl+Y)"><RedoIcon /></NavBtn>
          <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />
          <div className="relative">
            <button onClick={() => setShowDemoMenu(!showDemoMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
              <SparkleIcon /><span>Templates</span><ChevronIcon />
            </button>
            {showDemoMenu && <DemoMenu DEMO_FORMS={DEMO_FORMS} loadDemo={loadDemo} clearForm={clearForm} onClose={() => setShowDemoMenu(false)} />}
          </div>
          <NavBtn onClick={() => setShowClearConfirm(true)} title="Clear form" danger><TrashIcon /></NavBtn>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-1.5 ml-auto shrink-0">
          <NavBtn onClick={toggleDarkMode} title={darkMode ? 'Light mode' : 'Dark mode'}>
            {darkMode ? <SunIcon /> : <MoonIcon />}
          </NavBtn>
          <button onClick={() => setShowConfig(true)} className="lg:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800" title="Field settings">
            <SettingsIcon />
          </button>
          <button onClick={() => setShowPreview(true)} className="hidden sm:flex btn-ghost text-sm" title="Preview (Ctrl+P)">
            <EyeIcon /><span>Preview</span>
          </button>
          <button onClick={() => setShowExport(true)} className="btn-primary" title="Export JSON (Ctrl+E)">
            <ExportIcon />
            <span className="hidden sm:inline">Export JSON</span>
            <span className="sm:hidden text-xs">Export</span>
          </button>
        </div>
      </header>

      {/* BODY */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex flex-1 overflow-hidden relative">

          {showSidebar && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setShowSidebar(false)} />}
          <div className={`fixed inset-y-0 left-0 z-50 flex flex-col lg:relative lg:translate-x-0 transition-transform duration-300 ${showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
            <button onClick={() => setShowSidebar(false)} className="lg:hidden absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500"><CloseIcon /></button>
            <FieldSidebar />
          </div>

          <FormCanvas />

          {showConfig && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setShowConfig(false)} />}
          <div className={`fixed inset-y-0 right-0 z-50 flex flex-col lg:relative lg:translate-x-0 transition-transform duration-300 ${showConfig ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
            <button onClick={() => setShowConfig(false)} className="lg:hidden absolute top-3 left-3 z-10 p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500"><CloseIcon /></button>
            <FieldConfigPanel />
          </div>
        </div>

        <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.16,1,0.3,1)' }}>
          {activeSidebarField && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-indigo-400 bg-white dark:bg-gray-800 text-sm font-bold text-indigo-600 dark:text-indigo-400 rotate-2 scale-105"
              style={{ boxShadow: '0 8px 30px rgba(99,102,241,0.35)' }}>
              <span>{activeSidebarField.icon}</span>{activeSidebarField.label}
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {showExport  && <ExportModal  onClose={() => setShowExport(false)} />}
      {showPreview && <PreviewModal onClose={() => setShowPreview(false)} />}

      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-gray-200 dark:border-gray-700">
            <h3 className="text-base font-bold text-gray-900 dark:text-white text-center mb-1">Clear all fields?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">All fields will be removed. You can undo with Ctrl+Z.</p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowClearConfirm(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
              <button onClick={() => { clearForm(); setShowClearConfirm(false) }} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors">Clear</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function NavBtn({ children, onClick, disabled, title, danger }) {
  return (
    <button onClick={onClick} disabled={disabled} title={title}
      className={`p-2 rounded-lg transition-all disabled:opacity-25 disabled:cursor-not-allowed ${danger ? 'text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
      {children}
    </button>
  )
}

function DemoMenu({ DEMO_FORMS, loadDemo, clearForm, onClose }) {
  const icons = { 'job-application': '💼', 'customer-feedback': '⭐', 'event-registration': '🎟️' }
  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div className="absolute top-full left-0 mt-2 w-60 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-40 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-800">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Load Template</p>
        </div>
        {DEMO_FORMS.map((demo) => (
          <button key={demo.id} onClick={() => { loadDemo(demo.id); onClose() }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left">
            <span className="text-xl">{icons[demo.id]}</span>
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{demo.title}</p>
              <p className="text-xs text-gray-400">{demo.fields.length} fields</p>
            </div>
          </button>
        ))}
        <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800">
          <button onClick={() => { clearForm(); onClose() }} className="text-xs text-red-500 hover:text-red-600 font-medium transition-colors">+ Start from scratch</button>
        </div>
      </div>
    </>
  )
}

function UndoIcon()    { return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7H10a3 3 0 010 6H7"/><path d="M3 7L6 4M3 7L6 10"/></svg> }
function RedoIcon()    { return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M13 7H6a3 3 0 000 6h3"/><path d="M13 7L10 4M13 7L10 10"/></svg> }
function TrashIcon()   { return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M6 7v5M10 7v5M3 4l1 9a1 1 0 001 1h6a1 1 0 001-1l1-9"/></svg> }
function MoonIcon()    { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M13.5 10A6 6 0 016 2.5a6 6 0 100 11 6 6 0 007.5-3.5z"/></svg> }
function SunIcon()     { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="8" cy="8" r="3"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41"/></svg> }
function EyeIcon()     { return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z"/><circle cx="8" cy="8" r="2"/></svg> }
function ExportIcon()  { return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v8M5 7l3 3 3-3"/><path d="M3 11v2a1 1 0 001 1h8a1 1 0 001-1v-2"/></svg> }
function MenuIcon()    { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 4h14M2 9h14M2 14h14"/></svg> }
function CloseIcon()   { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 1l12 12M13 1L1 13"/></svg> }
function SettingsIcon(){ return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06"/></svg> }
function SparkleIcon() { return <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7 1l1.5 3.5L12 6l-3.5 1.5L7 11l-1.5-3.5L2 6l3.5-1.5L7 1z"/></svg> }
function ChevronIcon() { return <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 4l4 4 4-4"/></svg> }
