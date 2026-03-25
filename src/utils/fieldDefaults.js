export const FIELD_CATEGORIES = [
  {
    label: 'Text',
    fields: [
      { type: 'short_text', label: 'Short Text', icon: 'T', desc: 'Single line input' },
      { type: 'long_text',  label: 'Long Text',  icon: '¶', desc: 'Multi-line textarea' },
      { type: 'email',      label: 'Email',       icon: '@', desc: 'Email address' },
      { type: 'url',        label: 'URL',          icon: '⌁', desc: 'Website link' },
      { type: 'phone',      label: 'Phone',        icon: '☎', desc: 'Phone number' },
    ],
  },
  {
    label: 'Numbers & Dates',
    fields: [
      { type: 'number', label: 'Number',      icon: '#', desc: 'Numeric input' },
      { type: 'date',   label: 'Date Picker', icon: '◫', desc: 'Date selection' },
      { type: 'time',   label: 'Time Picker', icon: '◷', desc: 'Time selection' },
      { type: 'rating', label: 'Rating',      icon: '★', desc: 'Star rating 1–5' },
      { type: 'slider', label: 'Slider',      icon: '⊟', desc: 'Range slider' },
    ],
  },
  {
    label: 'Choice',
    fields: [
      { type: 'dropdown',      label: 'Dropdown',       icon: '▾', desc: 'Select one option' },
      { type: 'radio_group',   label: 'Radio Group',    icon: '◉', desc: 'Pick one' },
      { type: 'checkbox',      label: 'Checkbox',       icon: '☑', desc: 'Single toggle' },
      { type: 'checkbox_group',label: 'Checkbox Group', icon: '☰', desc: 'Pick multiple' },
      { type: 'toggle',        label: 'Toggle Switch',  icon: '⏻', desc: 'On/off switch' },
    ],
  },
  {
    label: 'Media & Layout',
    fields: [
      { type: 'file',    label: 'File Upload',     icon: '⬆', desc: 'Upload files' },
      { type: 'image',   label: 'Image Upload',    icon: '⊞', desc: 'Upload images' },
      { type: 'divider', label: 'Section Divider', icon: '─', desc: 'Visual separator' },
      { type: 'heading', label: 'Heading',         icon: 'H', desc: 'Section heading' },
      { type: 'paragraph', label: 'Paragraph',     icon: '¶', desc: 'Static text block' },
    ],
  },
]

// Flat list for drag overlay lookups
export const FIELD_TYPES = FIELD_CATEGORIES.flatMap((c) => c.fields)

export function getFieldDefaults(type) {
  const base = {
    label: labelFor(type),
    placeholder: '',
    required: false,
    helpText: '',
    validation: {},
    condition: null,
    width: 'full', // full | half
  }

  switch (type) {
    case 'dropdown':
    case 'checkbox_group':
    case 'radio_group':
      return { ...base, options: ['Option 1', 'Option 2', 'Option 3'] }
    case 'number':
    case 'slider':
      return { ...base, validation: { min: '', max: '', step: '' } }
    case 'short_text':
    case 'long_text':
    case 'url':
    case 'phone':
      return { ...base, validation: { minLength: '', maxLength: '', pattern: '' } }
    case 'rating':
      return { ...base, validation: { max: '5' } }
    case 'divider':
      return { label: 'Section Title', helpText: '', width: 'full' }
    case 'heading':
      return { label: 'Section Heading', helpText: '', level: 'h2', width: 'full' }
    case 'paragraph':
      return { label: '', content: 'Add your text here...', width: 'full' }
    case 'toggle':
      return { ...base, defaultValue: false }
    default:
      return base
  }
}

function labelFor(type) {
  const found = FIELD_TYPES.find((f) => f.type === type)
  return found ? found.label : 'Field'
}
