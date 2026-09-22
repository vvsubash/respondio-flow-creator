import { describe, expect, it } from 'vitest'
import { sampleFlow } from '@/test/fixtures'
import { hasErrors, validateCreateNode, validateTimeRange, validateTitle } from '@/utils/validation'

describe('validateTitle', () => {
  it('requires a title and caps its length', () => {
    expect(validateTitle('   ')).toBe('Title is required')
    expect(validateTitle('a'.repeat(61))).toContain('60 characters or fewer')
    expect(validateTitle('Away Message')).toBeUndefined()
  })
})

describe('validateTimeRange', () => {
  it('needs a 24-hour time with the start before the end', () => {
    expect(validateTimeRange('9:00', '17:00')).toBe('Use a 24-hour HH:MM time')
    expect(validateTimeRange('17:00', '09:00')).toBe('Start time must be before end time')
    expect(validateTimeRange('09:00', '09:00')).toBe('Start time must be before end time')
    expect(validateTimeRange('09:00', '17:00')).toBeUndefined()
  })
})

describe('validateCreateNode', () => {
  const nodes = sampleFlow()

  it('only accepts a parent that has no next step yet', () => {
    const ok = validateCreateNode(
      { name: 'Follow up', description: '', type: 'sendMessage', parentId: 'b0653a' },
      nodes,
    )
    expect(hasErrors(ok)).toBe(false)

    const taken = validateCreateNode(
      { name: 'Follow up', description: '', type: 'sendMessage', parentId: 'd09c08' },
      nodes,
    )
    expect(taken.parentId).toBe('That node already has a next step')
  })

  it('reports every bad field at once', () => {
    const errors = validateCreateNode({ name: '', parentId: 'nope' }, nodes)
    expect(errors.name).toBe('Title is required')
    expect(errors.type).toBe('Select a node type')
    expect(errors.parentId).toBe('Select a parent node')
  })
})
