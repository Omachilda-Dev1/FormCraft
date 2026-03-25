/**
 * Converts form state → JSON Schema draft-07
 */
export function generateSchema(formTitle, formDescription, fields) {
  const schema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: formTitle,
    description: formDescription || undefined,
    type: 'object',
    properties: {},
    required: [],
    'x-form-fields': [],
    'x-form-meta': {
      generatedAt: new Date().toISOString(),
      fieldCount: fields.filter((f) => !['divider', 'heading', 'paragraph'].includes(f.type)).length,
    },
  }

  fields.forEach((field) => {
    if (['divider', 'heading', 'paragraph'].includes(field.type)) {
      schema['x-form-fields'].push({ id: field.id, type: field.type, label: field.label, content: field.content })
      return
    }

    schema.properties[field.id] = buildProperty(field)

    if (field.required) schema.required.push(field.id)

    schema['x-form-fields'].push({
      id: field.id,
      type: field.type,
      label: field.label,
      ...(field.placeholder && { placeholder: field.placeholder }),
      ...(field.helpText    && { helpText: field.helpText }),
      ...(field.condition   && { condition: field.condition }),
      ...(field.width !== 'full' && { width: field.width }),
    })
  })

  if (schema.required.length === 0) delete schema.required
  if (schema['x-form-fields'].length === 0) delete schema['x-form-fields']

  return schema
}

function buildProperty(field) {
  const prop = {
    title: field.label,
    ...(field.helpText && { description: field.helpText }),
  }

  switch (field.type) {
    case 'short_text':
    case 'long_text':
    case 'url':
    case 'phone':
      prop.type = 'string'
      if (field.validation?.minLength) prop.minLength = Number(field.validation.minLength)
      if (field.validation?.maxLength) prop.maxLength = Number(field.validation.maxLength)
      if (field.validation?.pattern)   prop.pattern   = field.validation.pattern
      if (field.type === 'url')   prop.format = 'uri'
      if (field.type === 'phone') prop['x-field-type'] = 'phone'
      break

    case 'email':
      prop.type   = 'string'
      prop.format = 'email'
      break

    case 'number':
    case 'slider':
      prop.type = 'number'
      if (field.validation?.min !== '') prop.minimum = Number(field.validation.min)
      if (field.validation?.max !== '') prop.maximum = Number(field.validation.max)
      if (field.validation?.step)       prop.multipleOf = Number(field.validation.step)
      break

    case 'rating':
      prop.type    = 'integer'
      prop.minimum = 1
      prop.maximum = Number(field.validation?.max) || 5
      break

    case 'dropdown':
    case 'radio_group':
      prop.type = 'string'
      prop.enum = field.options || []
      break

    case 'checkbox':
    case 'toggle':
      prop.type = 'boolean'
      break

    case 'checkbox_group':
      prop.type        = 'array'
      prop.items       = { type: 'string', enum: field.options || [] }
      prop.uniqueItems = true
      break

    case 'date':
      prop.type   = 'string'
      prop.format = 'date'
      break

    case 'time':
      prop.type   = 'string'
      prop.format = 'time'
      break

    case 'file':
    case 'image':
      prop.type   = 'string'
      prop.format = 'uri'
      prop['x-field-type'] = field.type
      break

    default:
      prop.type = 'string'
  }

  return prop
}
