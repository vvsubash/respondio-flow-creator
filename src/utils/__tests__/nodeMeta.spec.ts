import { describe, expect, it } from 'vitest'
import type { FlowNode } from '../../../api/flow.types'
import { sampleFlow } from '@/test/fixtures'
import { NODE_META, describeNode, nodeSummary, nodeTitle } from '@/utils/nodeMeta'

describe('nodeMeta', () => {
  const nodes = sampleFlow()
  const find = (id: string) => nodes.find((node) => String(node.id) === id) as FlowNode

  it('gives every node type an icon and accent', () => {
    for (const meta of Object.values(NODE_META)) {
      expect(meta.icon).toBeTruthy()
      expect(meta.color).toMatch(/^#[0-9a-f]{6}$/)
    }
  })

  it('prefers the node name for the title', () => {
    expect(nodeTitle(find('b6a0c1'))).toBe('Away Message')
  })

  it('falls back to the type label when a node is unnamed', () => {
    expect(nodeTitle(find('1'))).toBe('Trigger')
  })

  it('describes each type in its own words', () => {
    expect(describeNode(find('1'))).toBe('Conversation Opened')
    expect(describeNode(find('d09c08'))).toBe('Business Hours – UTC')
    expect(describeNode(find('e879e4'))).toBe('User message during off hours')
    expect(describeNode(find('b6a0c1'))).toBe(
      'Message: Sorry, we are currently away. We will respond as soon as possible.',
    )
    expect(describeNode(find('161f52'))).toBe('Success')
  })

  it('prefers a description over the generated summary', () => {
    expect(nodeSummary({ ...find('1'), description: '  Kick off  ' })).toBe('Kick off')
  })
})
