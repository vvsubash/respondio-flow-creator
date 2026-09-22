import type { CreateNodeInput, FlowNode, NodeId } from '../../api/flow.types'
import { CREATABLE_NODE_TYPES } from '../../api/flow.types'
import { canBeParent } from './graph'

export type Errors<T extends string> = Partial<Record<T, string>>

export const LIMITS = {
  title: 60,
  description: 160,
  messageText: 1000,
  comment: 500,
  attachmentBytes: 2 * 1024 * 1024,
}

export function validateTitle(value: string): string | undefined {
  const trimmed = value.trim()
  if (trimmed.length === 0) return 'Title is required'
  if (trimmed.length > LIMITS.title) return `Title must be ${LIMITS.title} characters or fewer`
  return undefined
}

export function validateDescription(value: string): string | undefined {
  if (value.trim().length > LIMITS.description) {
    return `Description must be ${LIMITS.description} characters or fewer`
  }
  return undefined
}

export function validateMessageText(value: string): string | undefined {
  const trimmed = value.trim()
  if (trimmed.length === 0) return 'Message text cannot be empty'
  if (trimmed.length > LIMITS.messageText) {
    return `Message must be ${LIMITS.messageText} characters or fewer`
  }
  return undefined
}

/** An empty comment is allowed: clearing the field is how a comment is removed. */
export function validateComment(value: string): string | undefined {
  if (value.trim().length > LIMITS.comment) {
    return `Comment must be ${LIMITS.comment} characters or fewer`
  }
  return undefined
}

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/

export function validateTimeRange(startTime: string, endTime: string): string | undefined {
  if (!TIME_PATTERN.test(startTime) || !TIME_PATTERN.test(endTime)) {
    return 'Use a 24-hour HH:MM time'
  }
  if (startTime >= endTime) return 'Start time must be before end time'
  return undefined
}

export function validateAttachment(file: File): string | undefined {
  if (!file.type.startsWith('image/')) return 'Only image attachments are supported'
  if (file.size > LIMITS.attachmentBytes) return 'Attachment must be 2 MB or smaller'
  return undefined
}

export function validateCreateNode(
  input: Partial<CreateNodeInput>,
  nodes: FlowNode[],
): Errors<keyof CreateNodeInput> {
  const errors: Errors<keyof CreateNodeInput> = {}

  const title = validateTitle(input.name ?? '')
  if (title) errors.name = title

  const description = validateDescription(input.description ?? '')
  if (description) errors.description = description

  if (!input.type || !CREATABLE_NODE_TYPES.includes(input.type)) {
    errors.type = 'Select a node type'
  }

  const parentId: NodeId | undefined = input.parentId
  const parent = nodes.find((node) => String(node.id) === String(parentId))
  if (!parent) errors.parentId = 'Select a parent node'
  else if (!canBeParent(parent, nodes)) errors.parentId = 'That node already has a next step'

  return errors
}

export function hasErrors<T extends string>(errors: Errors<T>): boolean {
  return Object.values(errors).some(Boolean)
}
