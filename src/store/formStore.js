import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { getFieldDefaults } from '../utils/fieldDefaults'
import { DEMO_FORMS } from '../utils/demoForms'

const MAX_HISTORY = 50

function snapshot(state) {
  return {
    formTitle: state.formTitle,
    formDescription: state.formDescription,
    fields: JSON.parse(JSON.stringify(state.fields)),
  }
}

const useFormStore = create((set, get) => ({
  // Theme
  darkMode: false,
  toggleDarkMode: () => {
    const next = !get().darkMode
    set({ darkMode: next })
    document.documentElement.classList.toggle('dark', next)
  },

  // Form meta
  formTitle: DEMO_FORMS[0].title,
  formDescription: DEMO_FORMS[0].description,
  formTheme: 'default',
  setFormTitle: (title) => { get()._pushHistory(); set({ formTitle: title }) },
  setFormDescription: (desc) => set({ formDescription: desc }),
  setFormTheme: (theme) => set({ formTheme: theme }),

  // Fields — start with first demo form
  fields: DEMO_FORMS[0].fields,
  selectedFieldId: null,

  // History (undo/redo)
  _history: [],
  _future: [],

  _pushHistory: () => {
    const state = get()
    const snap = snapshot(state)
    const history = [...state._history, snap].slice(-MAX_HISTORY)
    set({ _history: history, _future: [] })
  },

  undo: () => {
    const { _history, _future } = get()
    if (_history.length === 0) return
    const prev = _history[_history.length - 1]
    const currentSnap = snapshot(get())
    set({
      ...(prev),
      _history: _history.slice(0, -1),
      _future: [currentSnap, ..._future].slice(0, MAX_HISTORY),
    })
  },

  redo: () => {
    const { _history, _future } = get()
    if (_future.length === 0) return
    const next = _future[0]
    const currentSnap = snapshot(get())
    set({
      ...(next),
      _history: [..._history, currentSnap].slice(-MAX_HISTORY),
      _future: _future.slice(1),
    })
  },

  canUndo: () => get()._history.length > 0,
  canRedo: () => get()._future.length > 0,

  // Field operations
  addField: (type, insertIndex = null) => {
    get()._pushHistory()
    const newField = { id: uuidv4(), type, ...getFieldDefaults(type) }
    set((state) => {
      const fields = [...state.fields]
      if (insertIndex !== null) {
        fields.splice(insertIndex, 0, newField)
      } else {
        fields.push(newField)
      }
      return { fields, selectedFieldId: newField.id }
    })
  },

  removeField: (id) => {
    get()._pushHistory()
    set((state) => ({
      fields: state.fields.filter((f) => f.id !== id),
      selectedFieldId: state.selectedFieldId === id ? null : state.selectedFieldId,
    }))
  },

  selectField: (id) => set({ selectedFieldId: id }),

  updateField: (id, updates) =>
    set((state) => ({
      fields: state.fields.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    })),

  reorderFields: (activeId, overId) => {
    get()._pushHistory()
    set((state) => {
      const fields = [...state.fields]
      const oldIndex = fields.findIndex((f) => f.id === activeId)
      const newIndex = fields.findIndex((f) => f.id === overId)
      if (oldIndex === -1 || newIndex === -1) return {}
      const [moved] = fields.splice(oldIndex, 1)
      fields.splice(newIndex, 0, moved)
      return { fields }
    })
  },

  duplicateField: (id) => {
    get()._pushHistory()
    set((state) => {
      const idx = state.fields.findIndex((f) => f.id === id)
      if (idx === -1) return {}
      const copy = { ...JSON.parse(JSON.stringify(state.fields[idx])), id: uuidv4() }
      const fields = [...state.fields]
      fields.splice(idx + 1, 0, copy)
      return { fields, selectedFieldId: copy.id }
    })
  },

  clearForm: () => {
    get()._pushHistory()
    set({ fields: [], selectedFieldId: null, formTitle: 'Untitled Form', formDescription: '' })
  },

  loadDemo: (demoId) => {
    get()._pushHistory()
    const demo = DEMO_FORMS.find((d) => d.id === demoId)
    if (!demo) return
    set({ fields: demo.fields, formTitle: demo.title, formDescription: demo.description, selectedFieldId: null })
  },

  DEMO_FORMS,

  // Stats
  getStats: () => {
    const { fields } = get()
    return {
      total: fields.length,
      required: fields.filter((f) => f.required).length,
      withConditions: fields.filter((f) => f.condition).length,
      types: [...new Set(fields.map((f) => f.type))].length,
    }
  },
}))

export default useFormStore
