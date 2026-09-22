import { describe, expect, it } from 'vitest'
import type { FlowNode } from '../../../api/flow.types'
import { sampleFlow } from '@/test/fixtures'
import { describeNode, nodeSummary, nodeTitle } from '@/utils/nodeMeta'

describe('nodeMeta', () => {
  const nodes = sampleFlow()
  const find = (id: string) => nodes.find((node) => String(node.id) === id) as FlowNode

  it('titles a node by name, falling back to the type label', () => {
    expect(nodeTitle(find('b6a0c1'))).toBe('Away Message')
    expect(nodeTitle(find('1'))).toBe('Trigger')
  })

  it('describes each type from its own data', () => {
    expect(describeNode(find('1'))).toBe('Conversation Opened')
    expect(describeNode(find('d09c08'))).toBe('Business Hours – UTC')
    expect(describeNode(find('e879e4'))).toBe('User message during off hours')
    expect(describeNode(find('161f52'))).toBe('Success')
    expect(describeNode(find('b6a0c1'))).toContain('Message: Sorry, we are currently away.')
  })

  it('prefers a description over the generated summary', () => {
    expect(nodeSummary({ ...find('1'), description: '  Kick off  ' })).toBe('Kick off')
  })
})
