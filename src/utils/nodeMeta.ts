import type { Component } from 'vue'
import { Calendar, GitBranch, MessageSquare, Send, Zap } from 'lucide-vue-next'
import type { FlowNode, NodeType } from '../../api/flow.types'
import { fileNameFromUrl } from './text'

export interface NodeMeta {
  label: string
  icon: Component
  accent: 'pink' | 'violet' | 'teal' | 'amber' | 'sky'
  color: string
}

export const NODE_META: Record<NodeType, NodeMeta> = {
  trigger: { label: 'Trigger', icon: Zap, accent: 'pink', color: '#ec4899' },
  sendMessage: { label: 'Send Message', icon: Send, accent: 'violet', color: '#7c3aed' },
  addComment: { label: 'Add Comment', icon: MessageSquare, accent: 'teal', color: '#0d9488' },
  dateTime: { label: 'Business Hours', icon: Calendar, accent: 'amber', color: '#f59e0b' },
  dateTimeConnector: { label: 'Branch', icon: GitBranch, accent: 'sky', color: '#0ea5e9' },
}

function humanize(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/^./, (char) => char.toUpperCase())
}

export function nodeTitle(node: FlowNode): string {
  if (node.name) return node.name
  if (node.type === 'dateTimeConnector') return humanize(node.data.connectorType)
  return NODE_META[node.type].label
}

export function describeNode(node: FlowNode): string {
  switch (node.type) {
    case 'trigger':
      return humanize(node.data.type)
    case 'sendMessage': {
      const text = node.data.payload.find((item) => item.type === 'text')
      if (text) return `Message: ${text.text}`
      const attachment = node.data.payload.find((item) => item.type === 'attachment')
      if (attachment) return `Message: ${attachment.name ?? fileNameFromUrl(attachment.attachment)}`
      return 'Empty message'
    }
    case 'addComment':
      return node.data.comment
    case 'dateTime':
      return `Business Hours – ${node.data.timezone}`
    case 'dateTimeConnector':
      return humanize(node.data.connectorType)
  }
}

export function nodeSummary(node: FlowNode): string {
  return node.description?.trim() || describeNode(node)
}
