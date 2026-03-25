import React from 'react'
import useFormStore from '../store/formStore'

const OPERATORS = [
  { value: 'equals',       label: 'equals' },
  { value: 'not_equals',   label: 'does not equal' },
  { value: 'contains',     label: 'contains' },
  { value: 'not_contains', label: 'does not contain' },
  { value: 'starts_with',  label: 'starts with' },
  { value: 'is_not_empty', label: 'is not empty' },
  { value: 'is_empty',     label: 'is empty' },
]

export default function ConditionalLogicEditor({ field }) {
  const { fields, updateField } = useFormStore()
  const otherFields = fields.filter((f) => f.id !== field.id && !['divider', 'heading', 'paragraph'].includes(f.type))
  const condition = field.condition || null

  const enable  = () => updateField(field.id, { condition: { fieldId: otherFields[0]?.id || '', operator: 'equals', value: '' } })
  const disable = () => updateField(field.id, { condition: null })
  const update  = (key, val) => updateField(field.id, { condition: { ...condition, [key]: val } })

  const needsValue = !['is_not_empty', 'is_empty'].includes(condition?.operator)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Show this field if...</p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
            {condition ? 'Condition active' : 'Always visible'}
          </p>
        </div>
        <button
          onClick={condition ? disable : enable}
          className={`relative shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-500/40 ${condition ? 'bg-accent-500' : 'bg-gray-200 dark:bg-gray-600'}`}
          style={{ height: '22px', width: '40px' }}
        >
          <span className={`absolute top-[3px] w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${condition ? 'left-[20px]' : 'left-[3px]'}`} />
        </button>
      </div>

      {condition && (
        <div className="space-y-2 p-3 bg-accent-50 dark:bg-accent-900/10 rounded-xl border border-accent-200 dark:border-accent-800/50 animate-fade-in">
          {otherFields.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-gray-500 italic text-center py-2">
              Add more fields to use conditional logic
            </p>
          ) : (
            <>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">Field</label>
                <select
                  value={condition.fieldId}
                  onChange={(e) => update('fieldId', e.target.value)}
                  className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2.5 py-1.5 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
                >
                  {otherFields.map((f) => (
                    <option key={f.id} value={f.id}>{f.label || f.type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">Condition</label>
                <select
                  value={condition.operator}
                  onChange={(e) => update('operator', e.target.value)}
                  className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2.5 py-1.5 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
                >
                  {OPERATORS.map((op) => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </select>
              </div>

              {needsValue && (
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">Value</label>
                  <input
                    type="text"
                    value={condition.value}
                    onChange={(e) => update('value', e.target.value)}
                    placeholder="Enter value..."
                    className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2.5 py-1.5 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
                  />
                </div>
              )}

              <div className="pt-1 border-t border-accent-200 dark:border-accent-800/50">
                <p className="text-[10px] text-accent-600 dark:text-accent-400 font-medium">
                  Show when "{otherFields.find(f => f.id === condition.fieldId)?.label || '...'}" {OPERATORS.find(o => o.value === condition.operator)?.label} {needsValue ? `"${condition.value}"` : ''}
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
